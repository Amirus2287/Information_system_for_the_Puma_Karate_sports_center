# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_delete_clubteam'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='passport_series',
            field=models.CharField(blank=True, max_length=10, verbose_name='Серия паспорта'),
        ),
        migrations.AddField(
            model_name='profile',
            name='passport_number',
            field=models.CharField(blank=True, max_length=20, verbose_name='Номер паспорта'),
        ),
        migrations.AddField(
            model_name='profile',
            name='passport_issued_by',
            field=models.CharField(blank=True, max_length=500, verbose_name='Кем выдан паспорт'),
        ),
        migrations.AddField(
            model_name='profile',
            name='snils',
            field=models.CharField(blank=True, max_length=14, verbose_name='СНИЛС'),
        ),
    ]
