# Generated manually: отчество, мед. страховка, удаление паспорта и СНИЛС

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_add_passport_snils'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='patronymic',
            field=models.CharField(blank=True, max_length=150, verbose_name='Отчество'),
        ),
        migrations.AddField(
            model_name='profile',
            name='medical_insurance',
            field=models.CharField(blank=True, max_length=100, verbose_name='Мед. страховка'),
        ),
        migrations.RemoveField(
            model_name='profile',
            name='passport_series',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='passport_number',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='passport_issued_by',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='snils',
        ),
    ]
