# Generated manually for emotions app

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='EmotionSession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('session_start', models.DateTimeField(auto_now_add=True)),
                ('session_end', models.DateTimeField(blank=True, null=True)),
                ('face_emotion', models.CharField(blank=True, max_length=50)),
                ('confidence_score', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='emotion_sessions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'emotion_sessions',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='emotionsession',
            index=models.Index(fields=['user'], name='emotion_ses_user_id_83bd82_idx'),
        ),
        migrations.AddIndex(
            model_name='emotionsession',
            index=models.Index(fields=['created_at'], name='emotion_ses_created_b6d7c4_idx'),
        ),
    ]
