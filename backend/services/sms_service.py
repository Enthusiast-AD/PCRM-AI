from config import settings
import requests

def send_sms(to_phone: str, message: str):
    if not settings.MSG91_AUTH_KEY or settings.MSG91_AUTH_KEY == "your-msg91-key":
        print(f"Mock SMS to {to_phone}: {message}")
        return {"status": "mocked", "provider_msg_id": "mock-id-123"}
        
    url = "https://api.msg91.com/api/v5/flow/"
    headers = {
        "authkey": settings.MSG91_AUTH_KEY,
        "Content-Type": "application/json"
    }
    
    payload = {
        "template_id": "your_template_id_here", # Replace with actual MSG91 template ID
        "short_url": "0",
        "recipients": [
            {
                "mobiles": to_phone,
                "var1": message # Assuming template uses var1 for the message body
            }
        ]
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        return {"status": "sent", "provider_msg_id": data.get("request_id", "unknown")}
    except Exception as e:
        print(f"Failed to send SMS via MSG91: {e}")
        return {"status": "failed", "provider_msg_id": None}
