from rest_framework import serializers
from .models import Competition, Match, BookmakerPartner, VIPSubscriber

class CompetitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Competition
        fields = ['id', 'name', 'code', 'flag']


class MatchSerializer(serializers.ModelSerializer):
    competition = CompetitionSerializer(read_only=True)
    
    # Formatage adapté au design de votre frontend React
    homeTeam = serializers.SerializerMethodField()
    awayTeam = serializers.SerializerMethodField()
    score = serializers.SerializerMethodField()
    analysis = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = [
            'id', 
            'competition', 
            'match_date', 
            'status', 
            'is_finished', 
            'is_vip',
            'homeTeam', 
            'awayTeam', 
            'score', 
            'analysis'
        ]

    def get_homeTeam(self, obj):
        return {
            'name': obj.home_team,
            'shortName': obj.home_team
        }

    def get_awayTeam(self, obj):
        return {
            'name': obj.away_team,
            'shortName': obj.away_team
        }

    def get_score(self, obj):
        return {
            'fullTime': {
                'home': obj.home_score,
                'away': obj.away_score
            }
        }

    def get_analysis(self, obj):
        return {
            'prob1': float(obj.prob_home),
            'probX': float(obj.prob_draw),
            'prob2': float(obj.prob_away),
            'xGHome': float(obj.xg_home),
            'xGAway': float(obj.xg_away),
            'comment': obj.expert_comment
        }


class BookmakerPartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookmakerPartner
        fields = ['id', 'name', 'promo_code', 'bonus_text', 'affiliate_url', 'bg_color', 'is_active']