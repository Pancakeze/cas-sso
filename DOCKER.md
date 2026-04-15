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

所有环境变量统一在 `config.env` 文件中配置，**无需修改 docker-compose.yml**。

### 配置文件位置

```
day02/
├── config.env          # ← 修改这个文件
├── docker-compose.yml
└── ...
```

### 需要修改的变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `REDIS_HOST` | 已有 Redis 的 IP | `172.38.110.237` |
| `REDIS_PORT` | Redis 端口 | `6379` |
| `REDIS_PASSWORD` | Redis 密码（无则留空） | `""` |
| `REDIS_DATABASE` | Redis 数据库编号 | `0` |
| `VITE_CAS_BASE_URL` | CAS 基础地址 | `http://172.38.110.237:3000/cas` |
| `VITE_CLIENT_SERVICE_URL` | 客户端服务地址 | `http://172.38.110.237:3000` |
| `VITE_SSO_UC_URL` | 统一用户中心地址 | `http://172.38.110.237:9090/sso/login` |

### 修改后重启服务

```bash
# 修改 config.env 后，重启服务生效
docker compose restart
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
