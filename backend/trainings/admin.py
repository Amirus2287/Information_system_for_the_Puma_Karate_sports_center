from django.contrib import admin
from .models import Gym, Group, GroupStudent, Training, Homework, Attendance

admin.site.register(Gym)
admin.site.register(Group)
admin.site.register(GroupStudent)
admin.site.register(Training)
admin.site.register(Homework)
admin.site.register(Attendance)
