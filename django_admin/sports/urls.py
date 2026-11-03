from django.urls import path
from . import views

urlpatterns = [
    path('matches/', views.get_matches_api, name='api_matches'),
    path('partners/', views.get_partners_api, name='api_partners'),
    path('competitions/', views.get_competitions_api, name='api_competitions'),
]