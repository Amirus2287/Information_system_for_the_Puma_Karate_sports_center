from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('competitions', '0002_alter_competition_options_and_more'),
        ('trainings', '__first__'),
    ]

    operations = [
        migrations.AddField(
            model_name='competition',
            name='visible_groups',
            field=models.ManyToManyField(blank=True, related_name='competitions', to='trainings.group', verbose_name='Видимые группы'),
        ),
    ]
