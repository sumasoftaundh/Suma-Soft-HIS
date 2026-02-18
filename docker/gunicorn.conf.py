import os

bind = f"0.0.0.0:{os.getenv('PORT', '8001')}"
workers = int(os.getenv('WEB_WORKERS', '2'))
worker_class = "gthread"
threads = int(os.getenv('WEB_THREADS', '4'))
timeout = int(os.getenv('WEB_TIMEOUT', '120'))
keepalive = int(os.getenv('WEB_KEEPALIVE', '120'))
graceful_timeout = int(os.getenv('WEB_GRACEFUL_TIMEOUT', '120'))
accesslog = os.getenv('ACCESS_LOG', '-')
errorlog = os.getenv('ERROR_LOG', '-')
loglevel = os.getenv('LOG_LEVEL', 'info')
