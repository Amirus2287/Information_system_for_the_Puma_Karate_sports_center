# Generated migration: time -> time_start, time_end

from datetime import time, timedelta, datetime, date
from django.db import migrations, models


def backfill_time_start_end(apps, schema_editor):
    Training = apps.get_model('trainings', 'Training')
    for t in Training.objects.all():
        t.time_start = t.time
        dt = datetime.combine(date.today(), t.time) + timedelta(minutes=90)
        t.time_end = dt.time()
        t.save()


def reverse_backfill(apps, schema_editor):
    Training = apps.get_model('trainings', 'Training')
    for t in Training.objects.all():
        t.time = t.time_start
        t.save()


class Migration(migrations.Migration):

    dependencies = [
        ('trainings', '0007_group_age_filter'),
    ]

    operations = [
        migrations.AddField(
            model_name='training',
            name='time_start',
            field=models.TimeField(null=True, verbose_name='Время начала'),
        ),
        migrations.AddField(
            model_name='training',
            name='time_end',
            field=models.TimeField(null=True, verbose_name='Время окончания'),
        ),
        migrations.RunPython(backfill_time_start_end, reverse_backfill),
        migrations.RemoveField(
            model_name='training',
            name='time',
        ),
        migrations.AlterField(
            model_name='training',
            name='time_start',
            field=models.TimeField(verbose_name='Время начала', default=time(18, 0)),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='training',
            name='time_end',
            field=models.TimeField(verbose_name='Время окончания', default=time(19, 30)),
            preserve_default=False,
        ),
    ]
