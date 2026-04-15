# 生产环境部署指南

> **版本**: 1.0.0  
> **更新日期**: 2026-04-13  
> **目标服务器**: 172.38.110.237

---

## 一、文件结构说明

```
/opt/cas/                      # 生产环境根目录
├── docker-compose.yml         # 容器编排配置（从 docker-images/ 复制）
├── config/                    # 外置配置目录（关键！）
│   ├── server/               # 后端配置
│   │   └── application.yml   # Spring Boot 配置
│   └── portal/               # 前端配置
│       └── config.json       # 前端运行时配置
└── images/                   # 镜像文件（可选）
    ├── cas-server-1.0.0.tar.gz
    └── cas-portal-1.0.0.tar.gz
```

---

## 二、需要修改 IP 的位置

### 1. 前端配置 `config/portal/config.json`
```json
{
  "CAS_BASE_URL": "/cas",
  "SSO_UC_URL": "http://172.38.110.237:9090/sso/login"
}
```

### 2. 后端配置 `config/server/application.yml`
```yaml
spring:
  data:
    redis:
      host: redis        # 如果 Redis 在外部，改为外部 IP
      port: 6379
      password: ""
```

---

## 三、生产环境升级步骤

### 步骤 1: 准备服务器目录

```bash
ssh user@172.38.110.237
sudo mkdir -p /opt/cas/config/server /opt/cas/config/portal
sudo chown -R $USER:$USER /opt/cas
```

### 步骤 2: 准备配置文件（关键！）

**方式 A：从本地上传（推荐）**
```bash
# 在本地执行
scp docker-images/docker-compose.yml user@172.38.110.237:/opt/cas/
scp -r config/server user@172.38.110.237:/opt/cas/config/
scp -r config/portal user@172.38.110.237:/opt/cas/config/
```

**方式 B：在服务器上直接创建**
```bash
# SSH 到服务器
ssh user@172.38.110.237

# 创建目录
mkdir -p /opt/cas/config/server /opt/cas/config/portal

# 创建后端配置
cat > /opt/cas/config/server/application.yml << 'EOF'
server:
  port: 8080

spring:
  data:
    redis:
      host: redis
      port: 6379
      password: ""
      database: 0
EOF

# 创建前端配置
cat > /opt/cas/config/portal/config.json << 'EOF'
{
  "CAS_BASE_URL": "/cas",
  "SSO_UC_URL": "http://172.38.110.237:9090/sso/login"
}
EOF

# 确认文件类型正确（必须是文件，不能是目录）
ls -la /opt/cas/config/portal/config.json
# 应该显示: -rw-r--r-- 1 user group 85 Apr 13 10:27 /opt/cas/config/portal/config.json
```

### 步骤 3: 上传镜像（如已构建）

```bash
# 在本地执行
scp cas-server-1.0.0.tar.gz user@172.38.110.237:/opt/cas/
scp cas-portal-1.0.0.tar.gz user@172.38.110.237:/opt/cas/

# 在服务器执行
docker load < cas-server-1.0.0.tar.gz
docker load < cas-portal-1.0.0.tar.gz
```

### 步骤 4: 启动服务

```bash
# 在服务器执行
cd /opt/cas
docker compose up -d

# 查看状态
docker compose ps
docker compose logs -f
```

---

## 四、配置热更新（无需重新构建镜像）

### 修改后端配置
```bash
# 编辑配置
vim /opt/cas/config/server/application.yml

# 重启后端容器生效（配置变更需要重启）
docker compose restart cas-server
```

### 修改前端配置
```bash
# 编辑配置
vim /opt/cas/config/portal/config.json

# 无需重启！刷新浏览器即可生效
```

---

## 五、IP 变更操作

如果服务器 IP 从 `172.38.110.237` 变为其他地址：

```bash
# 1. 修改前端配置
vim /opt/cas/config/portal/config.json
# 将 "SSO_UC_URL" 改为新地址

# 2. 修改后端配置（如 Redis 地址变化）
vim /opt/cas/config/server/application.yml

# 3. 重启服务
cd /opt/cas && docker compose restart
```

**注意**: 前端配置修改后，用户刷新浏览器即可生效，无需重新构建镜像！

---

## 六、验证检查清单

- [ ] `http://172.38.110.237:3000` 前端页面可访问
- [ ] `http://172.38.110.237:3000/config.json` 返回正确配置
- [ ] `http://172.38.110.237:8083/cas/login` 后端登录页可访问（端口 8083）
- [ ] 登录流程正常（输入用户名密码 → 登录成功）
- [ ] Redis 连接正常（`docker compose logs cas-server | grep -i redis`）

---

## 七、常见问题

### Q: HTTP ERROR 502？
A: Nginx 无法连接到后端，检查步骤：
```bash
# 1. 查看容器状态
docker compose ps

# 2. 查看后端日志
docker compose logs cas-server --tail=50

# 3. 常见原因
# - 后端启动失败（配置错误、端口冲突）
# - 后端还在启动中（Spring Boot 启动较慢，等待 30 秒）
# - 网络问题（容器间无法通信）
```

### Q: 修改 config.json 后未生效？
A: 浏览器可能有缓存，按 `Ctrl+F5` 强制刷新。

### Q: 如何查看前端配置是否加载成功？
A: 打开浏览器开发者工具，Console 中查看 `[Config] 运行时配置加载成功` 日志。

### Q: 后端配置修改后需要重启吗？
A: 是的，Spring Boot 需要重启才能读取新配置。

### Q: 如何修改子系统列表？
A: 子系统存储在浏览器 localStorage，首次加载后可在前端管理页面修改。
