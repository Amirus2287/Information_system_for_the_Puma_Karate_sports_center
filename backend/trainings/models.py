from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


# ===========================
# GYM
# ===========================
class Gym(models.Model):
    coach = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    address = models.CharField(max_length=255)
    work_time = models.CharField(max_length=50)

    def __str__(self):
        return self.address


# ===========================
# GROUPS
# ===========================
class Group(models.Model):
    coach = models.ForeignKey(User, on_delete=models.CASCADE)
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE)

    def __str__(self):
        return f"Group {self.id}"


# ===========================
# TRAININGS
# ===========================
class Training(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    training_date = models.DateField()
    training_time = models.TimeField()

    def __str__(self):
        return f"Training {self.training_date}"


# ===========================
# HOMEWORKS
# ===========================
class Homework(models.Model):
    training = models.ForeignKey(Training, on_delete=models.CASCADE)
    coach = models.ForeignKey(User, on_delete=models.CASCADE, related_name="homework_coach")
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="homework_student")

    task_text = models.TextField()
    deadline = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.task_text[:30]


# ===========================
# ATTENDANCE
# ===========================
class Attendance(models.Model):
    training = models.ForeignKey(Training, on_delete=models.CASCADE)
    student = models.ForeignKey(User, on_delete=models.CASCADE)

    status = models.CharField(max_length=50)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.student} — {self.status}"


# ===========================
# GROUP STUDENTS
# ===========================
class GroupStudent(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    joined_at = models.DateField()

    def __str__(self):
        return f"{self.student} → Group {self.group.id}"
