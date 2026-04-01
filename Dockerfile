# ── Stage 1: 构建 ──────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# 先复制 pom.xml，利用 Docker 层缓存加速依赖下载
COPY pom.xml .
RUN mvn dependency:go-offline -q

# 复制源码并打包（跳过测试）
COPY src ./src
RUN mvn package -DskipTests -q

# ── Stage 2: 运行 ──────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 安装 openssl（用于证书管理）
RUN apk add --no-cache openssl

# 创建 SSL 证书目录
RUN mkdir -p /etc/ssl/certs

# 复制 JAR
COPY --from=builder /app/target/*.jar app.jar

# 复制启动脚本
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 8443

ENTRYPOINT ["/docker-entrypoint.sh"]
