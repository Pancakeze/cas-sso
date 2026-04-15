# ── Stage 1: 构建 ──────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# 构建时注入环境变量
# 前端通过相对路径 /cas 访问后端，由 Nginx 代理转发
ARG VITE_CAS_BASE_URL=/cas
ARG VITE_CLIENT_SERVICE_URL=http://localhost:3000
ARG VITE_SSO_UC_URL=http://172.38.110.237:9090/sso/login

ENV VITE_CAS_BASE_URL=$VITE_CAS_BASE_URL
ENV VITE_CLIENT_SERVICE_URL=$VITE_CLIENT_SERVICE_URL
ENV VITE_SSO_UC_URL=$VITE_SSO_UC_URL

RUN npm run build

# ── Stage 2: 运行 ──────────────────────────────────────────
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
