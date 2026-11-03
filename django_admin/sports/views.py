from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Match, BookmakerPartner, Competition
from .serializers import MatchSerializer, BookmakerPartnerSerializer, CompetitionSerializer

@api_view(['GET'])
def get_matches_api(request):
    """
    Renvoie tous les matchs gérés par Django (triés du plus récent au plus ancien)
    Possibilité de filtrer par code de championnat : ?league=SA ou ?league=CIV
    """
    league = request.GET.get('league', None)
    matches = Match.objects.all().order_by('-match_date')

    if league and league != 'ALL':
        matches = matches.filter(competition__code__iexact=league)

    serializer = MatchSerializer(matches, many=True)
    return Response({
        'source': 'DJANGO_ADMIN_API',
        'totalFound': matches.count(),
        'matches': serializer.data
    })


@api_view(['GET'])
def get_partners_api(request):
    """
    Renvoie les partenaires bookmakers actifs avec leurs codes promo
    """
    partners = BookmakerPartner.objects.filter(is_active=True)
    serializer = BookmakerPartnerSerializer(partners, many=True)
    return Response({
        'source': 'DJANGO_ADMIN_API',
        'partners': serializer.data
    })


@api_view(['GET'])
def get_competitions_api(request):
    """
    Renvoie la liste des championnats enregistrés
    """
    competitions = Competition.objects.all()
    serializer = CompetitionSerializer(competitions, many=True)
    return Response(serializer.data)