"""!
This module contains the views for the latency_analyzer REST API endpoints.

The views are used to handle requests from the web frontend.
"""

from rest_framework import viewsets

from latency_analyzer.lib.helpers import calculate_averages, convert_delta_to_str
from .models import Route, Stop, Latency, Trip, StopTime
from django.db.models import Subquery
from rest_framework import mixins
from rest_framework.response import Response
from .serializer import RouteSerializer, StopSerializer, StopSerializerWithOndemand, ShapeSerializer
from rest_framework.renderers import JSONRenderer
from rest_framework.views import APIView
from django.db.models import Min, Max
from collections import OrderedDict
from datetime import datetime as dt

REST_API_VERSION_STRING = "v1"

class RouteViewSet(mixins.RetrieveModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    """!
    @brief A viewset which returns a list of routes.

    API endpoint: /api/{REST_API_VERSION_STRING}/lines
    """

    throttle_scope = "high"
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    renderer_classes = [JSONRenderer]

    def list(self, request):
        routes = self.get_queryset().order_by('route_short_name')
        serializer = self.get_serializer(routes, many=True)
        return Response(serializer.data)

class StopViewSet(mixins.RetrieveModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    """!
    @brief A viewset which returns a list of stops.

    API endpoint: /api/{REST_API_VERSION_STRING}/stops
    """

    throttle_scope = "high"
    queryset = Stop.objects.all()
    serializer_class = StopSerializer
    renderer_classes = [JSONRenderer]

    def list(self, request):
        stops = self.get_queryset()
        serializer = self.get_serializer(stops, many=True)
        return Response(serializer.data)

class RouteStopsView(APIView):
    """!
    @brief A view which returns a list of stops for a given route.

    API endpoint: /api/{REST_API_VERSION_STRING}/lines/<str:line>/stops/
    """

    throttle_scope = "high"
    renderer_classes = [JSONRenderer]

    def get(self, request, line):
        try:
            route = Route.objects.get(route_short_name=line)
        except Route.DoesNotExist:
            return Response({'error': 'Line not found.'}, status=404)

        direction = request.query_params.get('direction', "0")
        if direction not in ["0", "1"]:
            return Response({'error': 'Wrong value for the direction parameter. Can be only 0 or 1.'}, status=400)

        latest_trip = Trip.objects.filter(route=route, direction=direction).first()
        latest_trip_other_direction = Trip.objects.filter(route=route, direction=(not direction)).first()

        stops = Stop.objects.filter(stoptime__trip=latest_trip).order_by('stoptime__stop_sequence')

        serializer = StopSerializerWithOndemand(stops, context={'trip': latest_trip}, many=True)
        result = OrderedDict([
            ('direction', latest_trip.direction),
            ('directionBeginning', latest_trip_other_direction.direction_headsign),
            ('directionDestination', latest_trip.direction_headsign),
            ('stops', serializer.data)
        ])

        return Response(result)

class RoutesAtStopView(APIView):
    """!
    @brief A view which returns a list of routes that stop at a given stop.

    API endpoint: /api/{REST_API_VERSION_STRING}/stops/<str:stop>/lines/
    """

    throttle_scope = "high"
    renderer_classes = [JSONRenderer]

    def get(self, request, stop):
        try:
            stop = Stop.objects.get(name=stop)
        except Stop.DoesNotExist:
            return Response({'error': 'Stop not found.'}, status=404)

        routes = Route.objects.filter(trip__stoptime__stop=stop).distinct()

        serializer = RouteSerializer(routes, many=True)
        return Response(serializer.data)

class RouteDetailsView(APIView):
    """!
    @brief A view which returns the analysis data for a given route.

    API endpoint: /api/{REST_API_VERSION_STRING}/lines/<str:line>/latency
    """
    throttle_scope = "low"
    renderer_classes = [JSONRenderer]

    def get(self, request, line):
        try:
            route = Route.objects.get(route_short_name=line)
        except Route.DoesNotExist:
            return Response({'error': 'Line not found.'}, status=404)

        start_stop_name = request.query_params.get('start_stop', None)
        end_stop_name = request.query_params.get('end_stop', None)
        direction = request.query_params.get('direction', None)
        whole_range = request.query_params.get('whole_range', "true")
        start_datetime_str = request.query_params.get('start_datetime', None)
        end_datetime_str = request.query_params.get('end_datetime', None)

        if start_stop_name is None or end_stop_name is None or direction is None:
            return Response({'error': 'Missing required parameters.'}, status=400)
        try:
            start_stop = Stop.objects.get(name=start_stop_name)
        except Stop.DoesNotExist:
            return Response({'error': 'Start stop not found.'}, status=404)
        try:
            end_stop = Stop.objects.get(name=end_stop_name)
        except Stop.DoesNotExist:
            return Response({'error': 'End stop not found.'}, status=404)
        if direction not in ["0", "1"]:
            return Response({'error': 'Wrong value for the direction parameter. Can be only 0 or 1.'}, status=400)

        if whole_range == "true":
            start_datetime = Latency.objects.aggregate(Min('timestamp'))['timestamp__min']
            end_datetime = Latency.objects.aggregate(Max('timestamp'))['timestamp__max']
        else:
            try:
                start_datetime = dt.strptime(start_datetime_str, '%Y-%m-%d %H:%M:%S')
                end_datetime = dt.strptime(end_datetime_str, '%Y-%m-%d %H:%M:%S')
            except ValueError:
                return Response({'error': 'Invalid datetime format'}, status=400)

        trips = Trip.between_stops(route, start_datetime, end_datetime, start_stop, end_stop)
        differences = Latency.between_stops(trips, start_stop, end_stop)

        count, avg_time, avg_latency, median_latency, trimmed_latency = calculate_averages(differences)

        if count == 0:
            return Response({'message': 'Latency data not available for the selected stops, but the request was processed successfully.'}, status=200)

        result_data = OrderedDict([
            ('number_of_trips', count),
            ('average_trip_time', convert_delta_to_str(avg_time)),
            ('average_mean_latency_relative_to_schedule', convert_delta_to_str(avg_latency)),
            ('average_median_latency_relative_to_schedule', convert_delta_to_str(median_latency)),
            ('average_trimmed_mean_latency_relative_to_schedule', convert_delta_to_str(trimmed_latency))
        ])

        # Add shapes if we manage to get them from any trip for a route and direction
        trips_for_line_and_direction = Trip.objects.filter(route__route_short_name=line, direction=direction)
        for trip in trips_for_line_and_direction:
            shapes = trip.get_shapes()
            if shapes:
                break

        shape_serializer = ShapeSerializer(shapes, many=True)
        serialized_shapes = shape_serializer.data

        result_data['shapes'] = serialized_shapes

        return Response(result_data)

class DateRangesView(APIView):
    """!
    @brief A view which returns the earliest and latest date for which data is available for a given route.

    API endpoint: /api/{REST_API_VERSION_STRING}/lines/<str:line>/range
    """
    throttle_scope = "high"
    renderer_classes = [JSONRenderer]

    def get(self, request, line):
        try:
            route = Route.objects.get(route_short_name=line)
        except Route.DoesNotExist:
            return Response({'error': 'Line not found.'}, status=404)

        earliest_arrival_time = Latency.objects.filter(trip__route_id=route.id).order_by('timestamp').first()
        earliest_datetime = earliest_arrival_time.timestamp if earliest_arrival_time else None

        latest_arrival_time = Latency.objects.filter(trip__route_id=route.id).order_by('timestamp').last()
        latest_datetime = latest_arrival_time.timestamp if latest_arrival_time else None

        if not earliest_datetime or not latest_datetime:
            return Response({'message': 'Date range data not available for the selected line, but the request was processed successfully.'}, status=200)

        response_data = OrderedDict([
            ('earliest_date_time', earliest_datetime),
            ('latest_date_time', latest_datetime)
        ])

        return Response(response_data)
