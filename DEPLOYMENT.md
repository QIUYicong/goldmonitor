# 部署指南

本文档详细介绍如何在不同环境中部署 GoldMonitor 金价监控系统。

## 目录

- [系统要求](#系统要求)
- [生产环境部署](#生产环境部署)
  - [Docker 部署](#docker-部署)
  - [传统部署](#传统部署)
- [云平台部署](#云平台部署)
- [监控和维护](#监控和维护)
- [备份和恢复](#备份和恢复)
- [性能优化](#性能优化)
- [故障排查](#故障排查)

## 系统要求

### 硬件要求

**最低配置**:
- CPU: 2 核心
- 内存: 2GB RAM
- 硬盘: 10GB 可用空间
- 网络: 稳定的互联网连接

**推荐配置**:
- CPU: 4 核心或更多
- 内存: 4GB RAM 或更多
- 硬盘: 20GB SSD
- 网络: 10Mbps+ 带宽

### 软件要求

- **操作系统**: Ubuntu 20.04+, CentOS 7+, Debian 10+
- **Python**: 3.8+ (如使用 Python)
- **Node.js**: 14+ (如使用 Node.js)
- **数据库**: PostgreSQL 12+ 或 MySQL 8+
- **缓存**: Redis 6+
- **Web 服务器**: Nginx 1.18+ 或 Apache 2.4+
- **反向代理**: Nginx (推荐)

## 生产环境部署

### Docker 部署

#### 1. 准备 Dockerfile

创建 `Dockerfile`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 创建非 root 用户
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# 暴露端口
EXPOSE 5000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/api/v1/health || exit 1

# 启动应用
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "--timeout", "120", "app:app"]
```

#### 2. 准备 docker-compose.yml

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    container_name: goldmonitor-app
    restart: always
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://goldmonitor:password@db:5432/goldmonitor
      - REDIS_URL=redis://redis:6379/0
    env_file:
      - .env
    depends_on:
      - db
      - redis
    volumes:
      - ./logs:/app/logs
      - ./data:/app/data
    networks:
      - goldmonitor-network

  scheduler:
    build: .
    container_name: goldmonitor-scheduler
    restart: always
    command: python scheduler.py
    environment:
      - DATABASE_URL=postgresql://goldmonitor:password@db:5432/goldmonitor
      - REDIS_URL=redis://redis:6379/0
    env_file:
      - .env
    depends_on:
      - db
      - redis
    volumes:
      - ./logs:/app/logs
    networks:
      - goldmonitor-network

  scraper:
    build: .
    container_name: goldmonitor-scraper
    restart: always
    command: python scraper.py
    environment:
      - DATABASE_URL=postgresql://goldmonitor:password@db:5432/goldmonitor
      - REDIS_URL=redis://redis:6379/0
    env_file:
      - .env
    depends_on:
      - db
      - redis
    volumes:
      - ./logs:/app/logs
      - ./data:/app/data
    networks:
      - goldmonitor-network

  db:
    image: postgres:14-alpine
    container_name: goldmonitor-db
    restart: always
    environment:
      - POSTGRES_DB=goldmonitor
      - POSTGRES_USER=goldmonitor
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - goldmonitor-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U goldmonitor"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: goldmonitor-redis
    restart: always
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    networks:
      - goldmonitor-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  nginx:
    image: nginx:alpine
    container_name: goldmonitor-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./static:/usr/share/nginx/html/static:ro
    depends_on:
      - app
    networks:
      - goldmonitor-network

volumes:
  postgres-data:
  redis-data:

networks:
  goldmonitor-network:
    driver: bridge
```

#### 3. 准备 Nginx 配置

创建 `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream goldmonitor_app {
        server app:5000;
    }

    server {
        listen 80;
        server_name goldmonitor.example.com;

        # 重定向到 HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name goldmonitor.example.com;

        # SSL 证书配置
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # 安全头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # 静态文件
        location /static {
            alias /usr/share/nginx/html/static;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # API 代理
        location /api {
            proxy_pass http://goldmonitor_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Web 应用
        location / {
            proxy_pass http://goldmonitor_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # 健康检查
        location /health {
            access_log off;
            proxy_pass http://goldmonitor_app;
        }
    }
}
```

#### 4. 部署步骤

```bash
# 1. 克隆仓库
git clone https://github.com/QIUYicong/goldmonitor.git
cd goldmonitor

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置生产环境配置

# 3. 构建和启动服务
docker-compose up -d

# 4. 检查服务状态
docker-compose ps

# 5. 查看日志
docker-compose logs -f app

# 6. 运行数据库迁移
docker-compose exec app python manage.py migrate

# 7. 创建初始数据（可选）
docker-compose exec app python manage.py seed
```

### 传统部署

#### 1. 准备服务器

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装依赖
sudo apt install -y python3.10 python3.10-venv python3-pip \
    postgresql postgresql-contrib \
    redis-server \
    nginx \
    supervisor \
    git
```

#### 2. 创建应用用户

```bash
sudo useradd -m -s /bin/bash goldmonitor
sudo su - goldmonitor
```

#### 3. 部署应用

```bash
# 克隆代码
git clone https://github.com/QIUYicong/goldmonitor.git
cd goldmonitor

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
pip install gunicorn

# 配置环境变量
cp .env.example .env
nano .env  # 编辑配置

# 创建必要的目录
mkdir -p logs data backups
```

#### 4. 配置数据库

```bash
# 切换到 postgres 用户
sudo -u postgres psql

# 在 psql 中执行
CREATE DATABASE goldmonitor;
CREATE USER goldmonitor WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE goldmonitor TO goldmonitor;
\q

# 返回 goldmonitor 用户
sudo su - goldmonitor
cd goldmonitor
source venv/bin/activate

# 运行迁移
python manage.py migrate
```

#### 5. 配置 Supervisor

创建 `/etc/supervisor/conf.d/goldmonitor.conf`:

```ini
[program:goldmonitor-web]
command=/home/goldmonitor/goldmonitor/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 --timeout 120 app:app
directory=/home/goldmonitor/goldmonitor
user=goldmonitor
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
stderr_logfile=/home/goldmonitor/goldmonitor/logs/gunicorn.err.log
stdout_logfile=/home/goldmonitor/goldmonitor/logs/gunicorn.out.log

[program:goldmonitor-scheduler]
command=/home/goldmonitor/goldmonitor/venv/bin/python scheduler.py
directory=/home/goldmonitor/goldmonitor
user=goldmonitor
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
stderr_logfile=/home/goldmonitor/goldmonitor/logs/scheduler.err.log
stdout_logfile=/home/goldmonitor/goldmonitor/logs/scheduler.out.log

[program:goldmonitor-scraper]
command=/home/goldmonitor/goldmonitor/venv/bin/python scraper.py
directory=/home/goldmonitor/goldmonitor
user=goldmonitor
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
stderr_logfile=/home/goldmonitor/goldmonitor/logs/scraper.err.log
stdout_logfile=/home/goldmonitor/goldmonitor/logs/scraper.out.log

[group:goldmonitor]
programs=goldmonitor-web,goldmonitor-scheduler,goldmonitor-scraper
```

启动服务：

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start goldmonitor:*
sudo supervisorctl status
```

#### 6. 配置 Nginx

创建 `/etc/nginx/sites-available/goldmonitor`:

```nginx
server {
    listen 80;
    server_name goldmonitor.example.com;

    # 静态文件
    location /static {
        alias /home/goldmonitor/goldmonitor/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 代理到应用
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 日志
    access_log /var/log/nginx/goldmonitor.access.log;
    error_log /var/log/nginx/goldmonitor.error.log;
}
```

启用站点：

```bash
sudo ln -s /etc/nginx/sites-available/goldmonitor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 7. 配置 SSL (使用 Let's Encrypt)

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d goldmonitor.example.com

# 自动续期
sudo systemctl enable certbot.timer
```

## 云平台部署

### AWS 部署

#### 使用 EC2 + RDS

1. **创建 RDS PostgreSQL 实例**
2. **创建 ElastiCache Redis 实例**
3. **启动 EC2 实例**（Ubuntu 20.04）
4. **配置安全组**（开放 80, 443, 22 端口）
5. **按照传统部署方式部署应用**

#### 使用 ECS (Docker)

1. 构建 Docker 镜像并推送到 ECR
2. 创建 ECS 任务定义
3. 创建 ECS 服务
4. 配置负载均衡器

### 阿里云部署

#### 使用 ECS + RDS

1. **购买 ECS 实例**
2. **创建 RDS PostgreSQL 实例**
3. **创建 Redis 实例**
4. **配置安全组规则**
5. **部署应用**（同传统部署）

### 腾讯云部署

类似阿里云部署流程。

## 监控和维护

### 日志管理

```bash
# 应用日志
tail -f /home/goldmonitor/goldmonitor/logs/gunicorn.out.log

# Supervisor 日志
sudo tail -f /var/log/supervisor/supervisord.log

# Nginx 日志
sudo tail -f /var/log/nginx/goldmonitor.access.log
sudo tail -f /var/log/nginx/goldmonitor.error.log
```

### 性能监控

使用 Prometheus + Grafana:

```bash
# 安装 Prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.40.0/prometheus-2.40.0.linux-amd64.tar.gz
tar xvfz prometheus-2.40.0.linux-amd64.tar.gz
cd prometheus-2.40.0.linux-amd64

# 配置和启动
./prometheus --config.file=prometheus.yml
```

### 健康检查

```bash
# 检查应用健康状态
curl http://localhost:5000/api/v1/health

# 检查数据库连接
sudo -u postgres psql -c "SELECT 1"

# 检查 Redis
redis-cli ping
```

## 备份和恢复

### 数据库备份

```bash
# 手动备份
sudo -u postgres pg_dump goldmonitor > /home/goldmonitor/goldmonitor/backups/goldmonitor_$(date +%Y%m%d_%H%M%S).sql

# 自动备份脚本
cat > /home/goldmonitor/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/goldmonitor/goldmonitor/backups"
DATE=$(date +%Y%m%d_%H%M%S)
sudo -u postgres pg_dump goldmonitor | gzip > $BACKUP_DIR/goldmonitor_$DATE.sql.gz
# 保留最近 30 天的备份
find $BACKUP_DIR -name "goldmonitor_*.sql.gz" -mtime +30 -delete
EOF

chmod +x /home/goldmonitor/backup.sh

# 添加到 crontab
crontab -e
# 每天凌晨 2 点备份
0 2 * * * /home/goldmonitor/backup.sh
```

### 数据库恢复

```bash
# 恢复未压缩的备份
sudo -u postgres psql goldmonitor < backup_file.sql

# 恢复压缩的备份
gunzip -c backup_file.sql.gz | sudo -u postgres psql goldmonitor
```

## 性能优化

### 数据库优化

编辑 `/etc/postgresql/14/main/postgresql.conf`:

```ini
# 内存设置
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 16MB
maintenance_work_mem = 128MB

# 连接设置
max_connections = 100

# 日志设置
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_min_duration_statement = 1000
```

### Redis 优化

编辑 `/etc/redis/redis.conf`:

```ini
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### 应用优化

- 使用连接池
- 实现缓存策略
- 异步处理耗时任务
- 使用 CDN 分发静态资源

## 故障排查

### 应用无法启动

```bash
# 检查日志
sudo supervisorctl tail -f goldmonitor-web stderr

# 检查端口占用
sudo netstat -tlnp | grep 5000

# 检查环境变量
cat .env
```

### 数据库连接失败

```bash
# 检查 PostgreSQL 状态
sudo systemctl status postgresql

# 检查连接
psql -U goldmonitor -d goldmonitor -h localhost

# 查看 PostgreSQL 日志
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### 采集任务失败

```bash
# 查看 scraper 日志
sudo supervisorctl tail -f goldmonitor-scraper stderr

# 手动测试采集
source venv/bin/activate
python scraper.py --test
```

### 高内存占用

```bash
# 查看进程内存使用
ps aux | grep python | grep goldmonitor

# 重启服务
sudo supervisorctl restart goldmonitor:*
```

## 更新和升级

```bash
# 停止服务
sudo supervisorctl stop goldmonitor:*

# 备份数据库
/home/goldmonitor/backup.sh

# 拉取最新代码
cd /home/goldmonitor/goldmonitor
git pull origin main

# 更新依赖
source venv/bin/activate
pip install -r requirements.txt

# 运行迁移
python manage.py migrate

# 重启服务
sudo supervisorctl start goldmonitor:*
sudo supervisorctl status
```

## 安全最佳实践

1. **定期更新系统和依赖包**
2. **使用强密码和密钥认证**
3. **配置防火墙规则**
4. **启用 HTTPS**
5. **定期备份数据**
6. **监控异常访问**
7. **限制数据库远程访问**
8. **使用环境变量存储敏感信息**
9. **定期审计日志**
10. **实施最小权限原则**
