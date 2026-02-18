
redis_cache: redis-server config/redis_cache.conf
redis_queue: redis-server config/redis_queue.conf


web: bench serve  --port 8001


socketio: node apps/frappe/socketio.js


watch: fuser -k 3001/tcp; export FRAPPE_SOCKETIO_PORT=9001 && bench watch

