from celery import Celery
from config import settings

celery_app = Celery(
    "pcrm_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.task_routes = {
    "services.ai_service.classify_complaint": "main-queue"
}
