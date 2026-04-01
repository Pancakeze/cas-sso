# CAS SSO 单点登录系统

基于 CAS 3.0 协议的统一身份认证平台。

## 技术栈

- **后端**: Spring Boot 3.x (Java 17)
- **前端**: React 18 + TypeScript + Vite + Tailwind CSS
- **缓存**: Redis
- **架构**: HTTP 前端 → Nginx 反向代理 → HTTPS 后端

## 项目结构

```
day02/
├── src/                    # 后端源码 (Spring Boot)
│   └── main/java/com/example/cas/
│       ├── controller/    # 控制器
│       ├── service/        # 服务层
│       └── model/          # 数据模型
├── cas-client/            # 前端门户
│   ├── src/
│   └── nginx.conf
├── docker-compose.yml      # Docker 部署配置
└── Dockerfile             # 后端构建配置
```

## 快速开始

### 本地开发

```bash
# 启动后端 (端口 8443 HTTPS)
cd day02
./mvnw spring-boot:run

# 启动前端 (端口 3000)
cd cas-client
npm install
npm run dev
```

### Docker 部署

```bash
cd day02
docker compose build
docker compose up -d
```

## 接口文档

### CAS 认证

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 登录 | GET | `/cas/login` | CAS 登录页面 |
| 验证 Ticket | GET | `/cas/serviceValidate` | 验证 CAS Ticket |
| 登出 | GET | `/cas/logout` | 注销会话 |

### 人员查询

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| V1 查询 | POST | `/token-server/sapi/querypersoninfo` | 人员信息查询 |
| V2 查询 | POST | `/uac/openAPI/queryPerson/v2` | 人员信息查询(新版) |

### Token 服务

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 创建 Token | POST | `/token-server/sapi/createtoken` | 创建用户令牌 |
| 查询 Token | POST | `/token-server/sapi/queryusertoken` | 查询令牌信息 |
| 核验 Token | POST | `/token-server/sapi/validateusertoken` | 验证令牌有效性 |

## 默认账号

- **用户名**: admin
- **密码**: admin123

## License

MIT
