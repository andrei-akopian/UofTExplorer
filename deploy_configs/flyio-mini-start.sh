# start script for minimal docker image running on fly.io
nginx -c /deploy_configs/nginx.conf
gunicorn -w 4 --bind 127.0.0.1:5000 server.server:app --forwarded-allow-ips="127.0.0.1" --proxy-allow-from="127.0.0.1"