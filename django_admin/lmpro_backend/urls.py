from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

urlpatterns = [
    # Redirige automatiquement la racine vers la console admin
    path('', RedirectView.as_view(url='admin/', permanent=False)),
    
    path('admin/', admin.site.urls),
    path('api/', include('sports.urls')),
]