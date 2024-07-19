"""!
This file contains the serializers for the latency_analyzer app.

Serializers are used to convert data from the database into JSON format.
"""

from rest_framework import serializers
from .models import Route, Stop, Shape

class RouteSerializer(serializers.ModelSerializer):
    """!
    @brief A serializer for the Route model.
    """

    class Meta:
        model = Route
        fields = ['route_short_name']

    def to_representation(self, instance):
        return instance.route_short_name

class StopSerializer(serializers.ModelSerializer):
    """!
    @brief A serializer for the Stop model.
    """

    class Meta:
        model = Stop
        fields = ['name', 'latitude', 'longitude']

class StopSerializerWithOndemand(StopSerializer):
    """!
    @brief A serializer for the Stop model, including the ondemand field.
    """

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        trip = self.context.get('trip')
        stoptime = instance.stoptime_set.filter(trip=trip).first()

        representation['on_demand'] = stoptime.on_demand if stoptime else None

        return representation

class ShapeSerializer(serializers.ModelSerializer):
    """!
    @brief A serializer for the Shape model.
    """
    class Meta:
        model = Shape
        fields = ['point_sequency_number','distance_traveled','point_latitude','point_longitude']
