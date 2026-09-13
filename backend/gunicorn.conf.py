# =============================================================================
# gunicorn.conf.py — Production WSGI Configuration
# =============================================================================
import os
import multiprocessing

# Network binding
bind = f"{os.getenv('FLASK_HOST', '0.0.0.0')}:{os.getenv('FLASK_PORT', '5000')}"

# Worker model: gthread allows concurrent I/O requests without duplicating heavy PyTorch memory
workers = int(os.getenv("GUNICORN_WORKERS", "2"))
threads = int(os.getenv("GUNICORN_THREADS", "4"))
worker_class = "gthread"

# Timeouts: Generous timeout for deep ML question synthesis and PDF generation
timeout = int(os.getenv("GUNICORN_TIMEOUT", "180"))
graceful_timeout = 30
keepalive = 5

# Memory management: Prevent memory leaks from PyTorch / Transformers caching
max_requests = 1000
max_requests_jitter = 50

# Preload application: Load Sentence-BERT embeddings and RAG index once before workers fork
# This saves hundreds of megabytes of RAM via Copy-On-Write (COW) memory sharing
preload_app = os.getenv("GUNICORN_PRELOAD", "true").lower() == "true"

# Logging
accesslog = "-"
errorlog = "-"
loglevel = os.getenv("GUNICORN_LOG_LEVEL", "info")
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" (%(D)sus)'
