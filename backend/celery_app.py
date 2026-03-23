from celery import Celery
from config import settings
import ssl

# Configure SSL options for secure Redis connections
broker_use_ssl = None
redis_backend_use_ssl = None

if settings.REDIS_URL.startswith("rediss://"):
    broker_use_ssl = {"ssl_cert_reqs": ssl.CERT_NONE}
    redis_backend_use_ssl = {"ssl_cert_reqs": ssl.CERT_NONE}

celery_app = Celery(
    "pcrm_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    broker_use_ssl=broker_use_ssl,
    redis_backend_use_ssl=redis_backend_use_ssl,
    include=["services.ai_service"]
)

celery_app.conf.task_routes = {
    "services.ai_service.classify_complaint_task": "main-queue"
}
