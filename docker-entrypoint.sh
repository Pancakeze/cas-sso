#!/bin/sh
# 后端容器启动脚本

SSL_KEYSTORE="/etc/ssl/certs/server.p12"
SSL_KEYSTORE_PASSWORD="${SSL_KEYSTORE_PASSWORD:-changeit}"

# 如果没有证书，自动生成
if [ ! -f "$SSL_KEYSTORE" ]; then
    echo "🔐 首次启动，正在生成 SSL 证书..."

    # 创建 Java Keystore
    keytool \
      -genkeypair \
      -alias cas-server \
      -keyalg RSA \
      -keysize 2048 \
      -validity 3650 \
      -keystore "$SSL_KEYSTORE" \
      -storepass "$SSL_KEYSTORE_PASSWORD" \
      -keypass "$SSL_KEYSTORE_PASSWORD" \
      -dname "CN=localhost, OU=SSO, O=DayLife, L=Beijing, ST=Beijing, C=CN" \
      -ext "SAN=DNS:localhost,IP:127.0.0.1" 2>/dev/null

    if [ -f "$SSL_KEYSTORE" ]; then
        echo "✅ SSL 证书生成成功"
    else
        echo "❌ SSL 证书生成失败"
        exit 1
    fi
else
    echo "✅ SSL 证书已存在: $SSL_KEYSTORE"
fi

# 启动应用
echo "🚀 启动 CAS Server..."
exec java -jar /app/app.jar
