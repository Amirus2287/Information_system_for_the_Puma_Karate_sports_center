from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Journal, ProgressNote, TechniqueRecord
from .serializers import JournalSerializer, ProgressNoteSerializer, TechniqueRecordSerializer
from accounts.permissions import IsCoach

class JournalViewSet(viewsets.ModelViewSet):
    queryset = Journal.objects.all()
    serializer_class = JournalSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['student', 'coach', 'date']
    search_fields = ['notes', 'student__first_name', 'student__last_name']
    ordering_fields = ['date', 'created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_coach:
            return Journal.objects.filter(coach=user)
        return Journal.objects.filter(student=user)

class ProgressNoteViewSet(viewsets.ModelViewSet):
    queryset = ProgressNote.objects.all()
    serializer_class = ProgressNoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['student', 'coach', 'category']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_coach:
            return ProgressNote.objects.filter(coach=user)
        return ProgressNote.objects.filter(student=user)

class TechniqueRecordViewSet(viewsets.ModelViewSet):
    queryset = TechniqueRecord.objects.all()
    serializer_class = TechniqueRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['student', 'mastery_level']
    search_fields = ['technique', 'notes']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_coach:
            return TechniqueRecord.objects.all()
        return TechniqueRecord.objects.filter(student=user)