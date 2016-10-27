# HTTP server

upstream frontend_backend {
  server 127.0.0.1:60000;
}

# HTTPS server
#
server {
  listen      80;
  server_name frontend.com;

  gzip on;
  gzip_proxied any;
  gzip_types text/plain text/xml text/css application/x-javascript application/javascript;
  gzip_vary on;
  gzip_disable "MSIE [1-6]\.(?!.*SV1)";

  access_log      /data/log/nginx/frontend-access.log;
  error_log       /data/log/nginx/frontend-error.log;

  keepalive_timeout    60;
  client_max_body_size    10m;

  error_page 502 /504.html;
  error_page 504 /504.html;
  location /504.html {
    root /home/nodeadmin/static/;
  }

  location / {
    proxy_pass  http://frontend_backend;

    ### force timeouts if one of backend is died ##
    proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;

    ### Set headers ####
    proxy_set_header        Accept-Encoding   "";
    proxy_set_header        Host            $host;
    proxy_set_header        X-Real-IP       $remote_addr;
    proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header        X-Forwarded-Proto $scheme;
    add_header              Front-End-Https   on;
 
    ### By default we don't want to redirect it ####
    proxy_redirect     off;

    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
