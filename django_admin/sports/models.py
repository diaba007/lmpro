from django.db import models

class Competition(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nom de la compétition")
    code = models.CharField(max_length=10, verbose_name="Code (PL, SA, CAF...)")
    flag = models.CharField(max_length=10, default="🌍", verbose_name="Drapeau Emoji")

    class Meta:
        verbose_name = "Compétition"
        verbose_name_plural = "Compétitions"

    def __str__(self):
        return f"{self.flag} {self.name}"


class Match(models.Model):
    competition = models.ForeignKey(Competition, on_delete=models.CASCADE, verbose_name="Compétition")
    home_team = models.CharField(max_length=120, verbose_name="Équipe Domicile")
    away_team = models.CharField(max_length=120, verbose_name="Équipe Extérieur")
    match_date = models.DateTimeField(verbose_name="Date & Heure du Match")
    home_score = models.IntegerField(null=True, blank=True, verbose_name="Score Domicile")
    away_score = models.IntegerField(null=True, blank=True, verbose_name="Score Extérieur")
    is_finished = models.BooleanField(default=False, verbose_name="Match Terminé ?")
    is_vip = models.BooleanField(default=False, verbose_name="Pronostic Réservé aux VIP ?")

    # Calculs statistiques de Poisson
    xg_home = models.DecimalField(max_digits=4, decimal_places=2, default=1.80, verbose_name="xG Domicile")
    xg_away = models.DecimalField(max_digits=4, decimal_places=2, default=1.10, verbose_name="xG Extérieur")
    prob_home = models.DecimalField(max_digits=5, decimal_places=1, default=45.0, verbose_name="Probabilité 1 (%)")
    prob_draw = models.DecimalField(max_digits=5, decimal_places=1, default=28.0, verbose_name="Probabilité Nul (%)")
    prob_away = models.DecimalField(max_digits=5, decimal_places=1, default=27.0, verbose_name="Probabilité 2 (%)")
    expert_comment = models.TextField(blank=True, verbose_name="Conseil / Analyse Expert Christian")

    class Meta:
        verbose_name = "Match & Pronostic"
        verbose_name_plural = "Matchs & Pronostics"

    def __str__(self):
        return f"{self.home_team} vs {self.away_team} ({self.competition.name})"


class BookmakerPartner(models.Model):
    name = models.CharField(max_length=50, verbose_name="Nom (Melbet, Betwinner...)")
    promo_code = models.CharField(max_length=30, default="XPRO225", verbose_name="Code Promo Actif")
    bonus_text = models.CharField(max_length=255, verbose_name="Offre de Bienvenue")
    affiliate_url = models.URLField(verbose_name="Lien d'affiliation officiel")
    bg_color = models.CharField(max_length=20, default="#F3A000", verbose_name="Couleur de marque")
    is_active = models.BooleanField(default=True, verbose_name="Actif sur le site ?")

    class Meta:
        verbose_name = "Partenaire Bookmaker"
        verbose_name_plural = "Partenaires Bookmakers"

    def __str__(self):
        return f"{self.name} - Code: {self.promo_code}"


class VIPSubscriber(models.Model):
    PROVIDERS = [
        ('WAVE', 'Wave'),
        ('ORANGE', 'Orange Money'),
        ('MTN', 'MTN MoMo'),
        ('MOOV', 'Moov Money'),
    ]
    phone_number = models.CharField(max_length=30, verbose_name="Numéro de Téléphone")
    provider = models.CharField(max_length=20, choices=PROVIDERS, verbose_name="Opérateur")
    plan_name = models.CharField(max_length=50, default="Pass Mensuel (5000 FCFA)", verbose_name="Formule")
    is_active = models.BooleanField(default=True, verbose_name="Abonnement Actif ?")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date d'abonnement")

    class Meta:
        verbose_name = "Abonné VIP"
        verbose_name_plural = "Abonnés VIP"

    def __str__(self):
        return f"{self.phone_number} ({self.provider}) - {'Actif' if self.is_active else 'Expiré'}"