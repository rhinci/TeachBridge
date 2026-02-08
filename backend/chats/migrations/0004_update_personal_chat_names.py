from django.db import migrations

def update_personal_chat_names(apps, schema_editor):
    """Обновляет названия существующих личных чатов"""
    Chat = apps.get_model('chats', 'Chat')
    User = apps.get_model('users', 'User')
    
    for chat in Chat.objects.filter(chat_type='personal'):
        participants = list(chat.participants.all())
        if len(participants) == 2:
            # Берем второго участника как собеседника (для админки)
            other_participant = participants[1]  # Второй участник
            
            # Если создатель в участниках, используем другого
            if chat.created_by in participants:
                for participant in participants:
                    if participant != chat.created_by:
                        other_participant = participant
                        break
            
            # Формируем полное имя
            full_name = f"{other_participant.last_name} {other_participant.first_name}"
            if other_participant.patronymic:
                full_name += f" {other_participant.patronymic}"
            
            # Устанавливаем название
            chat.name = full_name
            chat.save(update_fields=['name'])

class Migration(migrations.Migration):
    dependencies = [
        ('chats', '0003_alter_chat_name_alter_chat_teachers_and_more'),
    ]

    operations = [
        migrations.RunPython(update_personal_chat_names, migrations.RunPython.noop),
    ]