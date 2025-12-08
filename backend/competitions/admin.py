from django.contrib import admin
from .models import Competition, CompetitionCategory, CompetitionRegistration, CompetitionResult, TeamCompetitionResult

admin.site.register(Competition)
admin.site.register(CompetitionCategory)
admin.site.register(CompetitionRegistration)
admin.site.register(CompetitionResult)
admin.site.register(TeamCompetitionResult)
