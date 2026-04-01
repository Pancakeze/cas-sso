# CAS SSO 单点登录系统

基于 CAS 3.0 协议的统一身份认证平台，支持多子系统单点登录。

## 技术栈

- **后端**: Spring Boot 3.x (Java 17)
- **前端**: React 18 + TypeScript + Vite + Tailwind CSS（赛博朋克风格）
- **缓存**: Redis
- **容器化**: Docker + Docker Compose
- **架构**: HTTP 前端 → Nginx 反向代理 → HTTP 后端

## 项目结构

```
day02/
├── src/                        # 后端源码 (Spring Boot)
│   └── main/java/com/example/cas/
│       ├── controller/         # 控制器
│       ├── service/            # 服务层
│       └── model/              # 数据模型
├── cas-client/                 # 前端门户 (React)
│   ├── src/
│   │   ├── pages/              # 页面组件
│   │   ├── services/            # API 服务
│   │   └── context/            # React Context
│   ├── nginx.conf               # Nginx 配置
│   └── vite.config.ts          # Vite 配置
├── docker-images/              # Docker 离线镜像包
├── docker-compose.yml           # Docker 部署配置
├── Dockerfile                   # 后端构建配置
└── pom.xml                      # Maven 依赖配置
```

## 快速开始

### 本地开发

**1. 启动后端 (端口 8080)**

```bash
cd day02
mvn spring-boot:run
```

或使用 Maven Wrapper：

```bash
cd day02
./mvnw spring-boot:run
```

**2. 启动前端 (端口 3000)**

```bash
cd day02/cas-client
npm install
npm run dev
```

**3. 访问系统**

- 门户首页: http://localhost:3000
- CAS 登录: http://localhost:3000/cas/login
- 默认账号: `admin` / `admin123`

### Docker 部署

**在线部署**

```bash
cd day02
docker compose build --no-cache
docker compose up -d
```

**离线部署**

```bash
# 1. 导入镜像
docker load -i docker-images/cas-server-1.0.0.tar
docker load -i docker-images/cas-portal-1.0.0.tar

# 2. 使用服务器专用配置启动
docker-compose -f docker-compose.yml -f docker-images/docker-compose.yml up -d
```

详细部署说明请参考 [DOCKER.md](./DOCKER.md)

## 功能特性

### 认证模块
- ✅ CAS 3.0 单点登录协议
- ✅ Ticket 验证机制
- ✅ 会话管理（Redis 存储）
- ✅ 默认账号登录

### 门户功能
- ✅ 子系统管理（CRUD）
- ✅ 统一认证入口
- ✅ 子系统跳转验证
- ✅ 赛博朋克风格 UI

### API 接口

#### CAS 认证

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 登录页面 | GET | `/cas/login` | CAS 登录入口 |
| 验证 Ticket | GET | `/cas/serviceValidate` | 验证 CAS Ticket |
| 健康检查 | GET | `/cas/health` | 服务健康检查 |
| 登出 | GET | `/cas/logout` | 注销会话 |

#### Token 服务

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 创建 Token | POST | `/token-server/sapi/createtoken` | 创建用户令牌 |
| 查询 Token | POST | `/token-server/sapi/queryusertoken` | 查询令牌信息 |
| 核验 Token | POST | `/token-server/sapi/validateusertoken` | 验证令牌有效性 |

#### 人员查询

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| V1 查询 | POST | `/token-server/sapi/querypersoninfo` | 人员信息查询 |
| V2 查询 | POST | `/uac/openAPI/queryPerson/v2` | 人员信息查询(新版) |

## 分支说明

| 分支 | 说明 |
|------|------|
| `main` | HTTPS 版本（生产环境） |
| `V1.0.0-nossl` | HTTP 版本（本地开发/测试） |

## 默认账号

- **用户名**: admin
- **密码**: admin123

## 环境变量

### 后端 (application.yml)

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `SERVER_PORT` | 8080 | 服务端口 |
| `REDIS_HOST` | localhost | Redis 主机 |
| `REDIS_PORT` | 6379 | Redis 端口 |
| `REDIS_PASSWORD` | - | Redis 密码 |
| `JWT_SECRET` | (默认密钥) | JWT 加密密钥 |

### 前端 (vite.config.ts)

前端通过 Vite 代理连接后端，无需额外配置。

## License

MIT
