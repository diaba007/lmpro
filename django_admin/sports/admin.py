from django.contrib import admin
from .models import Competition, Match, BookmakerPartner, VIPSubscriber

# Titre personnalisé pour Christian Diabagate
admin.site.site_header = "👑 LMPRO — Console Super-Admin"
admin.site.site_title = "LMPRO Administration"
admin.site.index_title = "Tableau de Bord Direction — Christian Diabagate"

@admin.register(Competition)
class CompetitionAdmin(admin.ModelAdmin):
    list_display = ('flag', 'name', 'code')
    search_fields = ('name', 'code')

@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ('home_team', 'away_team', 'competition', 'match_date', 'get_score', 'is_finished', 'is_vip')
    list_filter = ('competition', 'is_finished', 'is_vip', 'match_date')
    search_fields = ('home_team', 'away_team', 'expert_comment')
    date_hierarchy = 'match_date'

    fieldsets = (
        ("Affiche de la Rencontre", {
            'fields': ('competition', 'home_team', 'away_team', 'match_date')
        }),
        ("Statut & Score Final", {
            'fields': ('is_finished', 'home_score', 'away_score')
        }),
        ("Accès VIP", {
            'fields': ('is_vip',)
        }),
        ("Calculs Statistiques (Poisson) & Analyse", {
            'fields': ('xg_home', 'xg_away', 'prob_home', 'prob_draw', 'prob_away', 'expert_comment')
        }),
    )

    def get_score(self, obj):
        if obj.home_score is not None and obj.away_score is not None:
            return f"{obj.home_score} - {obj.away_score}"
        return "En attente"
    get_score.short_description = "Score Final"


@admin.register(BookmakerPartner)
class BookmakerPartnerAdmin(admin.ModelAdmin):
    list_display = ('name', 'promo_code', 'bonus_text', 'is_active')
    list_editable = ('promo_code', 'is_active')


@admin.register(VIPSubscriber)
class VIPSubscriberAdmin(admin.ModelAdmin):
    list_display = ('phone_number', 'provider', 'plan_name', 'is_active', 'created_at')
    list_filter = ('provider', 'is_active')
    search_fields = ('phone_number',)