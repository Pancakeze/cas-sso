# 镜像构建指南

> **版本**: 1.0.0  
> **构建日期**: 2026-04-13

---

## 一、构建前准备

### 1. 确认代码修改完成

确保以下文件已正确修改：

```bash
# 前端配置外置
✓ cas-client/src/services/cas.ts      # 从 config.json 读取 SSO_UC_URL
✓ cas-client/public/config.json       # 前端运行时配置模板
✓ cas-client/nginx.conf               # 支持 config.json 访问

# 后端配置外置
✓ src/main/resources/application.yml  # 支持外部配置覆盖

# Docker 编排
✓ docker-compose.yml                  # 添加 volumes 映射
```

### 2. 安装依赖

```bash
# 后端（本地 Maven 缓存）
mvn dependency:resolve -q

# 前端
cd cas-client && npm ci && cd ..
```

---

## 二、后端镜像构建 (cas-server)

### 方案 A：本地构建 + Dockerfile 打包（推荐）

由于 Docker 内无法访问 Maven Central，采用本地构建后打包：

```bash
# 1. 本地构建 JAR
mvn clean package -DskipTests

# 2. 构建镜像（指定 linux/amd64 平台，兼容生产环境）
docker build --platform linux/amd64 -f Dockerfile.runtime -t cas-server:1.0.0 .

# 3. 验证
docker images | grep cas-server
```

**注意**：生产环境是 x86_64 (amd64) 架构，Mac (Apple Silicon/arm64) 构建时需要指定 `--platform linux/amd64`。

### 方案 B：完整 Dockerfile 构建（需网络畅通）

```bash
# 直接构建（需要容器内能访问 Maven 仓库）
docker build -t cas-server:1.0.0 .
```

---

## 三、前端镜像构建 (cas-portal)

### 构建步骤

```bash
cd cas-client

# 1. 构建生产包（config.json 不会被 webpack 打包）
npm run build

# 2. 构建镜像（指定 linux/amd64 平台，兼容生产环境）
docker build --platform linux/amd64 -f Dockerfile.runtime -t cas-portal:1.0.0 .

# 3. 验证
docker images | grep cas-portal
```

**注意**：生产环境是 x86_64 (amd64) 架构，Mac (Apple Silicon/arm64) 构建时需要指定 `--platform linux/amd64`。

---

## 四、导出镜像

```bash
# 创建输出目录
mkdir -p docker-images/release

# 导出后端镜像
docker save cas-server:1.0.0 | gzip > docker-images/release/cas-server-1.0.0.tar.gz

# 导出前端镜像
docker save cas-portal:1.0.0 | gzip > docker-images/release/cas-portal-1.0.0.tar.gz

# 查看大小
ls -lh docker-images/release/
```

---

## 五、一键构建脚本

```bash
#!/bin/bash
set -e

echo "=== 开始构建 CAS SSO 镜像 ==="

# 1. 后端
echo "[1/4] 构建后端 JAR..."
mvn clean package -DskipTests -q

echo "[2/4] 构建后端镜像..."
docker build -f Dockerfile.runtime -t cas-server:1.0.0 .

# 2. 前端
echo "[3/4] 构建前端..."
cd cas-client
npm run build
docker build -f Dockerfile.runtime -t cas-portal:1.0.0 .
cd ..

# 3. 导出
echo "[4/4] 导出镜像..."
mkdir -p docker-images/release
docker save cas-server:1.0.0 | gzip > docker-images/release/cas-server-1.0.0.tar.gz
docker save cas-portal:1.0.0 | gzip > docker-images/release/cas-portal-1.0.0.tar.gz

echo "=== 构建完成 ==="
echo "输出文件:"
ls -lh docker-images/release/
```

保存为 `build.sh`，执行：
```bash
chmod +x build.sh
./build.sh
```

---

## 六、本地测试

```bash
# 加载镜像
docker load < docker-images/release/cas-server-1.0.0.tar.gz
docker load < docker-images/release/cas-portal-1.0.0.tar.gz

# 准备测试配置
mkdir -p config/server config/portal
cp config/server/application.yml config/server/
cp config/portal/config.json config/portal/

# 启动测试
docker compose up -d

# 验证
curl http://localhost:3000/config.json
curl http://localhost:8080/cas/login
```

---

## 七、上传到生产环境

```bash
# 上传镜像
scp docker-images/release/cas-server-1.0.0.tar.gz \
   docker-images/release/cas-portal-1.0.0.tar.gz \
   user@172.38.110.237:/opt/cas/

# 上传配置和编排文件
scp docker-compose.yml \
   -r config/server \
   -r config/portal \
   user@172.38.110.237:/opt/cas/
```

---

## 八、生产环境部署

```bash
ssh user@172.38.110.237
cd /opt/cas

# 加载镜像
docker load < cas-server-1.0.0.tar.gz
docker load < cas-portal-1.0.0.tar.gz

# 启动服务
docker compose up -d

# 查看状态
docker compose ps
docker compose logs -f
```

---

## 九、镜像大小参考

| 镜像 | 压缩前 | 压缩后 (tar.gz) |
|------|--------|-----------------|
| cas-server:1.0.0 | ~226 MB | ~100 MB |
| cas-portal:1.0.0 | ~62 MB | ~24 MB |

---

## 十、常见问题

### Q: Maven 构建失败？
A: 检查本地 Maven 缓存，或尝试 `mvn clean` 后重新构建。

### Q: Docker 构建失败？
A: 确保 Docker 守护进程运行中，`docker info` 检查状态。

### Q: 镜像太大？
A: 使用 `Dockerfile.runtime` 替代完整 Dockerfile，只包含运行时依赖。

### Q: 如何更新镜像版本？
A: 修改 `docker build -t cas-server:1.1.0` 中的标签，重新构建导出。
