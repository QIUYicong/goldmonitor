# 快速开始指南

本指南将帮助您在 5 分钟内快速启动 GoldMonitor 金价监控系统。

## 前提条件

确保您的系统已安装：
- Python 3.8+ 或 Node.js 14+
- PostgreSQL 或 MySQL
- Redis
- Git

## 快速开始（开发环境）

### 1. 克隆项目

```bash
git clone https://github.com/QIUYicong/goldmonitor.git
cd goldmonitor
```

### 2. 配置环境

#### Python 项目

```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

#### Node.js 项目

```bash
# 安装依赖
npm install
```

### 3. 配置数据库

```bash
# 创建数据库
createdb goldmonitor

# 或使用 psql
psql -U postgres
CREATE DATABASE goldmonitor;
\q
```

### 4. 配置环境变量

```bash
# 复制配置文件模板
cp .env.example .env

# 编辑 .env 文件，至少设置以下内容：
# DATABASE_URL=postgresql://user:password@localhost:5432/goldmonitor
# REDIS_URL=redis://localhost:6379/0
# SECRET_KEY=your-secret-key
```

使用文本编辑器打开 `.env` 文件并修改数据库连接信息。

### 5. 初始化数据库

```bash
# Python
python manage.py migrate

# Node.js
npm run migrate
```

### 6. 启动服务

```bash
# Python
python app.py

# Node.js
npm start
```

### 7. 访问应用

打开浏览器访问：`http://localhost:5000`

## Docker 快速启动（推荐）

如果您安装了 Docker 和 Docker Compose，可以使用以下命令快速启动：

```bash
# 克隆项目
git clone https://github.com/QIUYicong/goldmonitor.git
cd goldmonitor

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件（可选，默认配置可以直接使用）

# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f app
```

等待几分钟，然后访问 `http://localhost` 即可使用。

## 验证安装

### 检查应用健康状态

```bash
curl http://localhost:5000/api/v1/health
```

应返回类似以下内容：
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "components": {
      "database": {"status": "healthy"},
      "redis": {"status": "healthy"}
    }
  }
}
```

### 获取当前金价

```bash
curl http://localhost:5000/api/v1/price/current
```

### 访问 Web 界面

在浏览器中打开 `http://localhost:5000`，您应该能看到金价监控系统的主界面。

## 下一步

现在您已经成功启动了 GoldMonitor，可以：

1. **设置数据源** - 编辑 `config/sources.yaml` 配置数据采集源
2. **启动采集服务** - 运行 `python scraper.py` 开始采集数据
3. **设置价格预警** - 通过 Web 界面或 API 创建价格预警
4. **查看文档** - 阅读 [README.md](README.md) 了解更多功能

## 常见问题

### 数据库连接失败

**问题**: `psycopg2.OperationalError: could not connect to server`

**解决方案**:
1. 确认 PostgreSQL 正在运行：`sudo systemctl status postgresql`
2. 检查数据库连接配置：确保 `.env` 文件中的 `DATABASE_URL` 正确
3. 确认数据库已创建：`psql -l | grep goldmonitor`

### Redis 连接失败

**问题**: `redis.exceptions.ConnectionError: Error connecting to Redis`

**解决方案**:
1. 确认 Redis 正在运行：`sudo systemctl status redis`
2. 检查 Redis 配置：确保 `.env` 文件中的 `REDIS_URL` 正确
3. 测试 Redis 连接：`redis-cli ping`

### 端口已被占用

**问题**: `OSError: [Errno 98] Address already in use`

**解决方案**:
1. 查找占用端口的进程：`lsof -i :5000`
2. 停止该进程或修改应用端口
3. 在 `.env` 文件中设置 `APP_PORT=5001`

### 依赖安装失败

**问题**: 安装 Python 或 Node.js 依赖时出错

**解决方案**:

Python:
```bash
# 升级 pip
pip install --upgrade pip

# 安装构建工具
sudo apt-get install python3-dev build-essential

# 重新安装依赖
pip install -r requirements.txt
```

Node.js:
```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules
rm -rf node_modules

# 重新安装
npm install
```

### Docker 容器启动失败

**问题**: 使用 Docker Compose 时某个容器无法启动

**解决方案**:
```bash
# 查看详细日志
docker-compose logs [service_name]

# 重新构建镜像
docker-compose build --no-cache

# 重启服务
docker-compose restart
```

## 开发工具推荐

### IDE 和编辑器
- **VS Code** - 推荐安装 Python/JavaScript 扩展
- **PyCharm** - Python 开发
- **WebStorm** - JavaScript/Node.js 开发

### 浏览器扩展
- **JSON Viewer** - 查看 API 响应
- **Postman** - API 测试

### 数据库工具
- **DBeaver** - 通用数据库管理工具
- **pgAdmin** - PostgreSQL 专用工具
- **Redis Desktop Manager** - Redis 管理工具

## 学习资源

- [项目完整文档](README.md)
- [API 接口文档](API.md)
- [部署指南](DEPLOYMENT.md)
- [贡献指南](CONTRIBUTING.md)

## 获取帮助

遇到问题？以下是获取帮助的方式：

1. 查看 [常见问题](#常见问题)
2. 搜索 [GitHub Issues](https://github.com/QIUYicong/goldmonitor/issues)
3. 创建新的 Issue 描述您的问题
4. 发送邮件至：yqiubc@connect.ust.hk

## 参与贡献

欢迎贡献代码！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何参与项目开发。

---

祝您使用愉快！如果 GoldMonitor 对您有帮助，欢迎 ⭐ Star 本项目！
