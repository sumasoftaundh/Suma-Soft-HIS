
redis_cache: redis-server config/redis_cache.conf
redis_queue: redis-server config/redis_queue.conf


web: bench serve  --port 8001


socketio: /home/devuser/.nvm/versions/node/v18.20.8/bin/node apps/frappe/socketio.js


watch: fuser -k 3001/tcp; export FRAPPE_SOCKETIO_PORT=9001 && bench watch

