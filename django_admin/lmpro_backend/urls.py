from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

# 1. Configure le bouton "VOIR LE SITE" en haut à droite de l'admin Django
# pour qu'il ouvre directement votre vrai site sur Vercel !
admin.site.site_url = 'https://lmpro-alpha.vercel.app/'

urlpatterns = [
    # 2. Si quelqu'un ouvre la racine de Render, redirection automatique vers Vercel
    path('', RedirectView.as_view(url='https://lmpro-alpha.vercel.app/', permanent=False)),
    
    # Console d'administration
    path('admin/', admin.site.urls),
    
    # API des matchs et partenaires
    path('api/', include('sports.urls')),
]