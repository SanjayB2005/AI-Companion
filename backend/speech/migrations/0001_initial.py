# Generated manually for speech app

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
            name='SpeechSession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_audio_response_enabled', models.BooleanField(default=False)),
                ('last_transcript', models.TextField(blank=True)),
                ('last_detected_emotion', models.CharField(blank=True, max_length=50)),
                ('last_response_text', models.TextField(blank=True)),
                ('session_start', models.DateTimeField(auto_now_add=True)),
                ('session_end', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='speech_sessions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'speech_sessions',
                'ordering': ['-created_at'],
            },
        ),
    ]
