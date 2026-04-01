# CAS SSO Docker 部署说明

## 目录结构

```
day02/
├── Dockerfile              # 后端镜像
├── docker-compose.yml      # 编排文件
├── pom.xml
├── src/
└── cas-client/
    ├── Dockerfile          # 前端镜像
    ├── nginx.conf          # Nginx 反向代理配置
    ├── package.json
    └── src/
```

## 修改配置

在 `docker-compose.yml` 中修改以下环境变量：

| 变量 | 说明 | 示例 |
|------|------|------|
| `REDIS_HOST` | 已有 Redis 的 IP | `172.38.110.121` |
| `REDIS_PORT` | Redis 端口 | `6379` |
| `REDIS_PASSWORD` | Redis 密码（无则留空） | `""` |
| `REDIS_DATABASE` | Redis 数据库编号 | `0` |

如果你的 Linux 服务器对外 IP 不是 localhost，还需同步修改：

```yaml
args:
  VITE_CAS_BASE_URL: http://<你的服务器IP>:3000/cas
  VITE_CLIENT_SERVICE_URL: http://<你的服务器IP>:3000
```

## 构建并启动

```bash
# 进入 day02 目录
cd day02

# 构建 Linux amd64 镜像并启动（首次需要一段时间）
docker compose build --no-cache
docker compose up -d

# 查看日志
docker compose logs -f

# 停止
docker compose down
```

## 访问地址

| 服务 | 地址 |
|------|------|
| 前端门户 | http://<服务器IP>:3000 |
| 后端 CAS | http://<服务器IP>:8085/cas/login |

## 默认账号

- 用户名：`admin`
- 密码：`admin123`

## 跨平台构建（Mac → Linux）

如果在 Mac 上构建 Linux 镜像：

```bash
# 启用 buildx 跨平台支持
docker buildx create --use

# 构建并推送（或只构建不推送）
docker buildx bake --load
```

或者直接在 Linux 服务器上执行 `docker compose build`，无需跨平台处理。
