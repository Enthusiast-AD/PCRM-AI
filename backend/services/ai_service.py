import google.generativeai as genai
from config import settings
import json
from celery_app import celery_app

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

def classify_complaint_text(text: str, channel: str, ward: str = None):
    prompt = f"""
    Analyze the following citizen complaint and extract the details in strict JSON format.
    Complaint: {text}
    Channel: {channel}
    Ward: {ward}
    
    Return ONLY a JSON object with this schema:
    {{
      "category": "string (Water Supply, Roads & Infrastructure, Electricity, Healthcare, Education, Law & Order, Employment, Land Records, Sanitation, Other)",
      "subcategory": "string",
      "priority": "integer (1-5, 5 is most urgent)",
      "priority_reason": "string",
      "summary": "string (1-2 sentences)",
      "suggested_assignee_role": "string (FieldWorker / PA / Coordinator / Politician)",
      "suggested_action": "string",
      "draft_reply_citizen": "string (max 160 chars)",
      "language_detected": "string",
      "tags": ["array", "of", "tags"]
    }}
    """
    try:
        response = model.generate_content(prompt)
        text_resp = response.text.strip()
        if text_resp.startswith("```json"):
            text_resp = text_resp[7:-3]
        return json.loads(text_resp)
    except Exception as e:
        print(f"Error parsing Gemini response: {e}")
        return {"category": "Unclassified", "priority": 3, "summary": "Failed to classify"}

@celery_app.task
def classify_complaint_task(complaint_id: str, text: str, channel: str):
    # This task runs in the background via Celery
    result = classify_complaint_text(text, channel)
    print(f"Classified complaint {complaint_id}: {result}")
    # In a real scenario, you would update the database here with the result
    return {"status": "success", "complaint_id": complaint_id, "classification": result}

def generate_morning_briefing(stats: dict):
    prompt = f"Generate a morning briefing summary and trend alert based on these stats: {json.dumps(stats)}. Return JSON with 'ai_summary' and 'trend_alert'."
    try:
        response = model.generate_content(prompt)
        text_resp = response.text.strip()
        if text_resp.startswith("```json"):
            text_resp = text_resp[7:-3]
        return json.loads(text_resp)
    except:
        return {"ai_summary": "Briefing generation failed.", "trend_alert": "No alerts."}

def chat_with_data(message: str, history: list, query_type: str, context_data: str = ""):
    prompt = f"You are an AI Co-Pilot for a politician. Context data: {context_data}. User message: {message}. Query type: {query_type}."
    response = model.generate_content(prompt)
    return response.text
