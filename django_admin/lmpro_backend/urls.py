from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Console d'administration Django
    path('admin/', admin.site.urls),
    
    # API REST pour LMPRO
    path('api/', include('sports.urls')),
]