# Stage 1: Build React 19 Frontend
FROM node:24-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

COPY . .
RUN pnpm build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config for SPA routing and API reverse proxy
RUN echo 'server {' \
    'listen 80;' \
    'location / {' \
    '  root /usr/share/nginx/html;' \
    '  index index.html index.htm;' \
    '  try_files $uri $uri/ /index.html;' \
    '}' \
    'location /api/ {' \
    '  proxy_pass http://server:8080/api/;' \
    '  proxy_set_header Host $host;' \
    '  proxy_set_header X-Real-IP $remote_addr;' \
    '}' \
    '}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
