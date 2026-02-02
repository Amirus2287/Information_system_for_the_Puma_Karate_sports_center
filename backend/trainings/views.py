from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import datetime, time as dt_time
from .models import Gym, Group, Training, Homework, Attendance, GroupStudent
from .serializers import (
    GymSerializer, GroupSerializer, TrainingSerializer, 
    HomeworkSerializer, AttendanceSerializer, GroupStudentSerializer
)
from accounts.permissions import IsCoachOrAdmin

class GymViewSet(viewsets.ModelViewSet):
    queryset = Gym.objects.all()
    serializer_class = GymSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['name', 'address']

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['coach', 'gym']
    search_fields = ['name']
    
    def get_queryset(self):
        user = self.request.user
        is_coach = user.is_coach or user.is_staff
        if user.is_student and not is_coach:
            return Group.objects.filter(students__student=user, students__is_active=True).distinct()
        elif is_coach and not user.is_staff:
            return Group.objects.filter(coach=user)
        return Group.objects.all()

class TrainingViewSet(viewsets.ModelViewSet):
    queryset = Training.objects.all()
    serializer_class = TrainingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['group', 'date']
    ordering_fields = ['date', 'time_start']
    ordering = ['date', 'time_start']
    
    def get_queryset(self):
        user = self.request.user
        is_coach = user.is_coach or user.is_staff
        
        queryset = Training.objects.all()
        
        date_after = self.request.query_params.get('date_after')
        date_before = self.request.query_params.get('date_before')
        group_filter = self.request.query_params.get('group')
        
        if date_after:
            queryset = queryset.filter(date__gte=date_after)
        if date_before:
            queryset = queryset.filter(date__lte=date_before)
        
        # Если указана конкретная группа, фильтруем по ней
        # Если группа не указана (все группы) - для тренеров/админов показываем все тренировки
        if user.is_student and not is_coach:
            queryset = queryset.filter(
                group__students__student=user, 
                group__students__is_active=True
            ).distinct()
        elif is_coach and not user.is_staff:
            # Если указана конкретная группа, фильтруем только по группам тренера
            # Если группа не указана (все группы в журнале), показываем все тренировки
            if group_filter:
                queryset = queryset.filter(group__coach=user)
            # Если group_filter не указан, тренер видит все тренировки всех групп
        
        return queryset

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Создание тренировок на несколько дат: group, time_start, time_end, topic?, dates[]."""
        user = request.user
        is_coach = user.is_coach or user.is_staff
        if not is_coach:
            return Response(
                {'detail': 'Только тренер или администратор может создавать тренировки.'},
                status=status.HTTP_403_FORBIDDEN
            )

        group_id = request.data.get('group')
        time_start_str = request.data.get('time_start')
        time_end_str = request.data.get('time_end')
        topic = (request.data.get('topic') or '').strip()
        dates = request.data.get('dates') or []

        if not group_id or not time_start_str or not time_end_str or not dates:
            return Response(
                {'detail': 'Укажите группу, время начала, время окончания и хотя бы одну дату (dates).'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            group = Group.objects.get(pk=group_id)
        except Group.DoesNotExist:
            return Response(
                {'detail': 'Группа не найдена.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not user.is_staff and group.coach_id != user.id:
            return Response(
                {'detail': 'Можно создавать тренировки только для своих групп.'},
                status=status.HTTP_403_FORBIDDEN
            )

        def parse_time(s):
            if isinstance(s, str) and ':' in s:
                parts = s.strip().split(':')
                hour, minute = int(parts[0]), int(parts[1])
                second = int(parts[2]) if len(parts) > 2 else 0
                return dt_time(hour, minute, second)
            return None

        time_start_obj = parse_time(time_start_str)
        time_end_obj = parse_time(time_end_str)
        if time_start_obj is None or time_end_obj is None:
            return Response(
                {'detail': 'Укажите время начала и окончания в формате ЧЧ:ММ или ЧЧ:ММ:СС.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        created = []
        errors = []

        for i, d in enumerate(dates):
            if isinstance(d, str):
                try:
                    dt = datetime.strptime(d, '%Y-%m-%d').date()
                except ValueError:
                    errors.append(f'Неверный формат даты: {d}')
                    continue
            else:
                errors.append(f'Ожидается строка даты, получено: {d}')
                continue

            if Training.objects.filter(group=group, date=dt, time_start=time_start_obj).exists():
                errors.append(f'Тренировка уже есть: {d}')
                continue

            training = Training.objects.create(
                group=group,
                date=dt,
                time_start=time_start_obj,
                time_end=time_end_obj,
                topic=topic,
            )
            created.append(TrainingSerializer(training).data)

        return Response({
            'created': len(created),
            'trainings': created,
            'errors': errors if errors else None,
        }, status=status.HTTP_201_CREATED)

class HomeworkViewSet(viewsets.ModelViewSet):
    queryset = Homework.objects.all()
    serializer_class = HomeworkSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['training', 'student', 'completed']
    ordering_fields = ['deadline', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        is_coach = user.is_coach or user.is_staff
        if user.is_student and not is_coach:
            return Homework.objects.filter(student=user)
        elif is_coach and not user.is_staff:
            return Homework.objects.filter(
                training__group__coach=user
            )
        return Homework.objects.all()

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['training', 'student', 'present']
    ordering_fields = ['training__date']
    ordering = ['-training__date']
    
    def get_queryset(self):
        user = self.request.user
        is_coach = user.is_coach or user.is_staff
        if user.is_student and not is_coach:
            return Attendance.objects.filter(student=user)
        elif is_coach and not user.is_staff:
            return Attendance.objects.filter(
                training__group__coach=user
            )
        return Attendance.objects.all()

class GroupStudentViewSet(viewsets.ModelViewSet):
    queryset = GroupStudent.objects.all()
    serializer_class = GroupStudentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'student', 'is_active']

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.IsAuthenticated()]
        return [IsCoachOrAdmin()]

    def get_queryset(self):
        user = self.request.user
        is_coach = user.is_coach or user.is_staff
        if is_coach and not user.is_staff:
            return GroupStudent.objects.filter(group__coach=user)
        if not is_coach:
            return GroupStudent.objects.filter(student=user)
        return GroupStudent.objects.all()
    
    def create(self, request, *args, **kwargs):
        group_id = request.data.get('group')
        student_id = request.data.get('student')
        if not group_id or not student_id:
            from rest_framework.response import Response
            from rest_framework import status
            return Response(
                {'detail': 'Укажите группу и ученика.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        # Ученик может быть только в одной группе: снимаем с других групп
        GroupStudent.objects.filter(student_id=student_id).exclude(group_id=group_id).update(is_active=False)

        existing = GroupStudent.objects.filter(
            group_id=group_id,
            student_id=student_id
        ).first()

        if existing:
            existing.is_active = True
            existing.save()
            serializer = self.get_serializer(existing)
            from rest_framework.response import Response
            from rest_framework import status
            return Response(serializer.data, status=status.HTTP_200_OK)

        return super().create(request, *args, **kwargs)

    def perform_update(self, serializer):
        instance = serializer.save()
        if instance.is_active:
            GroupStudent.objects.filter(student_id=instance.student_id).exclude(pk=instance.pk).update(is_active=False)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        from rest_framework.response import Response
        from rest_framework import status
        return Response(status=status.HTTP_204_NO_CONTENT)