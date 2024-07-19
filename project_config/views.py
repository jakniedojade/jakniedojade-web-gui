"""!
Project specific views.

Handles serving for the index page.
"""

from django.shortcuts import render

def index(request):
    return render(request, 'index.html')
