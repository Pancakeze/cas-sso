# CAS SSO 部署指南

## 架构说明

- **后端 cas-server**: HTTPS (8443)，CAS 认证服务
- **前端 cas-portal**: HTTP (3000)，通过 Nginx 代理访问后端
- **Redis**: 外部服务，用于 Session 存储

## 部署步骤

### 1. 上传镜像文件

```bash
# 上传到服务器
scp cas-server-1.0.0.tar.gz user@server:/path/to/day02/
scp cas-portal-1.0.0.tar.gz user@server:/path/to/day02/
```

### 2. 加载镜像

```bash
cd /path/to/day02
docker load -i cas-server-1.0.0.tar.gz
docker load -i cas-portal-1.0.0.tar.gz
```

### 3. 配置

编辑项目根目录的 `config.env` 文件：

```bash
# 进入项目根目录
cd /path/to/day02

# 修改配置文件
vim config.env
```

需要修改的关键配置：

```env
# Redis 配置
REDIS_HOST=172.38.110.237       # 你的 Redis 地址
REDIS_PASSWORD=你的密码          # 你的 Redis 密码

# 前端配置（根据实际服务器 IP 修改）
VITE_CAS_BASE_URL=http://172.38.110.237:3000/cas
VITE_CLIENT_SERVICE_URL=http://172.38.110.237:3000
VITE_SSO_UC_URL=http://172.38.110.237:9090/sso/login
```

### 4. 启动服务

```bash
docker compose up -d
```

## 访问地址

- **前端**: http://localhost:3000
- **后端 API**: https://localhost:8443

## SSL 证书

后端容器首次启动时会自动生成自签名证书。

如需使用自定义证书：

```bash
# 创建证书目录
mkdir -p ssl

# 生成 PKCS12 格式证书（使用 keytool）
keytool -genkeypair \
  -alias cas-server \
  -keyalg RSA \
  -keysize 2048 \
  -validity 3650 \
  -keystore ssl/server.p12 \
  -storepass changeit \
  -keypass changeit \
  -dname "CN=你的域名, OU=SSO, O=Company, L=City, ST=State, C=CN"
```

然后取消注释 `docker-compose.yml` 中的 volumes 配置：
```yaml
volumes:
  - ./ssl:/etc/ssl/certs
```

## 默认账号

- 用户名: `admin`
- 密码: `admin123`
