from twilio.rest import Client
from config import settings

def send_whatsapp_message(to_number: str, message: str):
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN or settings.TWILIO_ACCOUNT_SID == "your-twilio-sid":
        print(f"Mock WhatsApp to {to_number}: {message}")
        return
    
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    message = client.messages.create(
        from_=settings.TWILIO_WHATSAPP_NUMBER,
        body=message,
        to=f"whatsapp:{to_number}"
    )
    return message.sid
