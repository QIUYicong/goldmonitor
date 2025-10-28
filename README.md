# GoldMonitor - 金价监控系统

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

金价监控系统 - 全自动追踪国际金价和首饰金价的智能监控平台

## 📋 项目概述

GoldMonitor 是一个自动化的金价监控系统，旨在实时追踪和分析国际黄金价格以及首饰金价的变化趋势。系统可以帮助用户及时了解金价波动，做出更明智的投资决策。

### 核心功能

- **实时价格监控**: 自动追踪国际金价（伦敦金、纽约金等）
- **首饰金价追踪**: 监控各大品牌和商家的首饰金价
- **价格预警**: 当价格达到设定阈值时发送通知
- **历史数据分析**: 存储和分析历史价格数据
- **可视化展示**: 提供直观的价格走势图表
- **多渠道通知**: 支持邮件、微信、钉钉等多种通知方式

## 🏗️ 技术架构

### 系统架构

```
┌─────────────────┐
│   数据采集层     │  - 定时爬虫
│                 │  - API 接口调用
└────────┬────────┘
         │
┌────────▼────────┐
│   数据处理层     │  - 数据清洗
│                 │  - 格式标准化
└────────┬────────┘
         │
┌────────▼────────┐
│   数据存储层     │  - 数据库存储
│                 │  - 缓存层
└────────┬────────┘
         │
┌────────▼────────┐
│   业务逻辑层     │  - 价格分析
│                 │  - 预警判断
└────────┬────────┘
         │
┌────────▼────────┐
│   展示层        │  - Web 界面
│                 │  - API 服务
└─────────────────┘
```

### 技术栈（推荐）

- **后端框架**: Python (Flask/FastAPI) 或 Node.js (Express)
- **数据库**: PostgreSQL / MySQL（关系型数据）+ Redis（缓存）
- **任务调度**: Celery / APScheduler / Cron
- **数据采集**: Scrapy / Requests + BeautifulSoup
- **前端**: React / Vue.js 或简单的 HTML + Bootstrap
- **可视化**: ECharts / Chart.js / D3.js
- **通知服务**: SMTP（邮件）/ 企业微信 API / 钉钉机器人

## 🚀 快速开始

### 系统要求

- Python 3.8+ 或 Node.js 14+
- PostgreSQL 12+ 或 MySQL 8+
- Redis 6+
- 至少 2GB RAM
- 5GB 可用磁盘空间

### 安装步骤

#### 1. 克隆仓库

```bash
git clone https://github.com/QIUYicong/goldmonitor.git
cd goldmonitor
```

#### 2. 创建虚拟环境（Python 项目）

```bash
# 使用 venv
python -m venv venv

# 激活虚拟环境
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate
```

#### 3. 安装依赖

```bash
# Python 项目
pip install -r requirements.txt

# 或 Node.js 项目
npm install
```

#### 4. 配置数据库

```bash
# 创建数据库
createdb goldmonitor

# 运行数据库迁移
python manage.py migrate
# 或
npm run migrate
```

#### 5. 配置环境变量

创建 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，设置必要的配置：

```env
# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/goldmonitor

# Redis 配置
REDIS_URL=redis://localhost:6379/0

# API 密钥（如需要）
GOLD_API_KEY=your_api_key_here

# 通知配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_password

# 企业微信配置（可选）
WECHAT_WEBHOOK=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx

# 预警阈值
PRICE_ALERT_THRESHOLD_HIGH=500
PRICE_ALERT_THRESHOLD_LOW=400
```

#### 6. 初始化数据

```bash
# 创建初始数据
python manage.py seed
# 或
npm run seed
```

### 运行项目

#### 开发环境

```bash
# 启动 Web 服务器
python app.py
# 或
npm run dev

# 在另一个终端启动任务调度器
python scheduler.py
# 或
npm run scheduler

# 启动数据采集任务
python scraper.py
# 或
npm run scraper
```

服务将在 `http://localhost:5000` 或 `http://localhost:3000` 启动

#### 生产环境

```bash
# 使用 gunicorn (Python)
gunicorn -w 4 -b 0.0.0.0:8000 app:app

# 使用 pm2 (Node.js)
pm2 start ecosystem.config.js

# 使用 Docker
docker-compose up -d
```

## 📖 使用指南

### Web 界面操作

1. **访问主页**: 打开浏览器访问 `http://localhost:5000`
2. **查看实时价格**: 在首页可以看到当前的金价信息
3. **设置价格预警**: 
   - 进入"预警设置"页面
   - 设置目标价格
   - 选择通知方式
   - 保存设置
4. **查看历史数据**: 在"历史数据"页面可以查看价格走势图

### API 接口

#### 获取当前金价

```bash
GET /api/v1/price/current
```

响应示例：
```json
{
  "timestamp": "2025-10-28T12:00:00Z",
  "international": {
    "london_gold": 2050.50,
    "currency": "USD",
    "unit": "oz"
  },
  "jewelry": [
    {
      "brand": "周大福",
      "price": 620,
      "currency": "CNY",
      "unit": "g"
    }
  ]
}
```

#### 获取历史数据

```bash
GET /api/v1/price/history?days=30
```

#### 设置价格预警

```bash
POST /api/v1/alert
Content-Type: application/json

{
  "price_type": "international",
  "threshold_high": 2100,
  "threshold_low": 2000,
  "notification_method": "email"
}
```

### 命令行工具

```bash
# 手动触发数据采集
python cli.py fetch --source all

# 查看当前价格
python cli.py price --type international

# 导出历史数据
python cli.py export --format csv --days 90

# 测试通知功能
python cli.py test-notification --method email
```

## 🔧 配置说明

### 数据源配置

编辑 `config/sources.yaml`:

```yaml
sources:
  international:
    - name: kitco
      url: https://www.kitco.com/gold-price-today-usa/
      interval: 300  # 5分钟
      enabled: true
    - name: investing
      url: https://www.investing.com/commodities/gold
      interval: 300
      enabled: true
      
  jewelry:
    - name: chow_tai_fook
      url: https://www.ctf.com.cn/gold-price
      interval: 3600  # 1小时
      enabled: true
    - name: lao_feng_xiang
      url: https://www.lfx.com/price
      interval: 3600
      enabled: true
```

### 调度任务配置

编辑 `config/scheduler.yaml`:

```yaml
jobs:
  - name: fetch_international_price
    schedule: "*/5 * * * *"  # 每5分钟
    task: tasks.fetch_international_price
    
  - name: fetch_jewelry_price
    schedule: "0 */1 * * *"  # 每小时
    task: tasks.fetch_jewelry_price
    
  - name: check_alerts
    schedule: "*/10 * * * *"  # 每10分钟
    task: tasks.check_price_alerts
    
  - name: cleanup_old_data
    schedule: "0 0 * * 0"  # 每周日凌晨
    task: tasks.cleanup_old_data
    retention_days: 365
```

### 通知模板配置

编辑 `config/notifications.yaml`:

```yaml
templates:
  price_alert_high:
    subject: "【金价预警】价格已达到预设高点"
    body: |
      尊敬的用户：
      
      当前金价已达到您设置的预警高点。
      
      当前价格：{current_price} {currency}/{unit}
      预警阈值：{threshold} {currency}/{unit}
      涨幅：{change_percent}%
      
      请及时关注市场动态。
      
  price_alert_low:
    subject: "【金价预警】价格已低于预设低点"
    body: |
      尊敬的用户：
      
      当前金价已低于您设置的预警低点。
      
      当前价格：{current_price} {currency}/{unit}
      预警阈值：{threshold} {currency}/{unit}
      跌幅：{change_percent}%
```

## 🗂️ 项目结构

```
goldmonitor/
├── app/                    # 应用主目录
│   ├── __init__.py
│   ├── models/            # 数据模型
│   │   ├── price.py
│   │   ├── alert.py
│   │   └── user.py
│   ├── services/          # 业务逻辑
│   │   ├── scraper.py    # 数据采集
│   │   ├── analyzer.py   # 数据分析
│   │   └── notifier.py   # 通知服务
│   ├── api/              # API 接口
│   │   ├── v1/
│   │   │   ├── price.py
│   │   │   └── alert.py
│   │   └── routes.py
│   └── utils/            # 工具函数
│       ├── database.py
│       └── cache.py
├── config/               # 配置文件
│   ├── sources.yaml
│   ├── scheduler.yaml
│   └── notifications.yaml
├── static/               # 静态资源
│   ├── css/
│   ├── js/
│   └── images/
├── templates/            # 模板文件
│   ├── index.html
│   ├── history.html
│   └── alerts.html
├── tests/               # 测试文件
│   ├── test_scraper.py
│   ├── test_analyzer.py
│   └── test_api.py
├── migrations/          # 数据库迁移
├── docs/               # 文档
│   ├── API.md
│   └── DEPLOYMENT.md
├── .env.example        # 环境变量示例
├── .gitignore
├── requirements.txt    # Python 依赖
├── package.json       # Node.js 依赖
├── Dockerfile
├── docker-compose.yml
├── LICENSE
└── README.md
```

## 📊 数据库设计

### 主要数据表

#### prices 表（价格记录）
```sql
CREATE TABLE prices (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    source VARCHAR(50) NOT NULL,
    price_type VARCHAR(20) NOT NULL,  -- 'international' or 'jewelry'
    brand VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CNY',
    unit VARCHAR(10) DEFAULT 'g',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_timestamp (timestamp),
    INDEX idx_source (source),
    INDEX idx_price_type (price_type)
);
```

#### alerts 表（价格预警）
```sql
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    price_type VARCHAR(20) NOT NULL,
    threshold_high DECIMAL(10, 2),
    threshold_low DECIMAL(10, 2),
    notification_method VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### notifications 表（通知记录）
```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    alert_id INTEGER REFERENCES alerts(id),
    sent_at TIMESTAMP NOT NULL,
    method VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    message TEXT
);
```

## 🔨 开发指南

### 本地开发设置

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -am 'Add some feature'`
4. 推送到分支：`git push origin feature/your-feature`
5. 提交 Pull Request

### 代码规范

- Python: 遵循 PEP 8 规范
- JavaScript: 使用 ESLint 配置
- 提交信息: 遵循 Conventional Commits

### 运行测试

```bash
# Python 项目
pytest tests/ -v --cov=app

# Node.js 项目
npm test

# 集成测试
npm run test:integration
```

### 添加新的数据源

1. 在 `app/services/scrapers/` 创建新的爬虫文件
2. 继承 `BaseScraper` 类
3. 实现 `fetch()` 和 `parse()` 方法
4. 在 `config/sources.yaml` 中注册新数据源
5. 添加相应的测试用例

示例：
```python
from app.services.scrapers.base import BaseScraper

class NewSourceScraper(BaseScraper):
    def __init__(self):
        super().__init__(name="new_source")
    
    def fetch(self):
        # 实现数据获取逻辑
        pass
    
    def parse(self, raw_data):
        # 实现数据解析逻辑
        return {
            'price': price,
            'timestamp': timestamp,
            'currency': 'CNY',
            'unit': 'g'
        }
```

## 🚢 部署指南

### Docker 部署

```bash
# 构建镜像
docker build -t goldmonitor:latest .

# 运行容器
docker-compose up -d
```

### 传统部署

#### Nginx 配置

```nginx
server {
    listen 80;
    server_name goldmonitor.example.com;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /static {
        alias /path/to/goldmonitor/static;
    }
}
```

#### Systemd 服务

创建 `/etc/systemd/system/goldmonitor.service`:

```ini
[Unit]
Description=GoldMonitor Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/goldmonitor
Environment="PATH=/opt/goldmonitor/venv/bin"
ExecStart=/opt/goldmonitor/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

启动服务：
```bash
sudo systemctl enable goldmonitor
sudo systemctl start goldmonitor
```

## 🔐 安全建议

1. **环境变量**: 不要将敏感信息提交到代码仓库
2. **API 密钥**: 使用专用的 API 密钥管理服务
3. **数据库**: 使用强密码，限制远程访问
4. **HTTPS**: 生产环境必须使用 HTTPS
5. **定期更新**: 及时更新依赖包，修复安全漏洞
6. **访问控制**: 实现适当的用户认证和授权机制

## 🤝 贡献指南

欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详情。

### 贡献者

感谢所有为本项目做出贡献的开发者！

## 📝 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解版本更新历史。

## ❓ 常见问题

### Q: 数据采集频率可以调整吗？
A: 可以，在 `config/scheduler.yaml` 中修改相应任务的 schedule 参数。

### Q: 支持哪些数据源？
A: 目前支持多个国际金价和首饰金价数据源，具体列表请查看 `config/sources.yaml`。

### Q: 如何添加新的通知方式？
A: 在 `app/services/notifier.py` 中实现新的通知类，并在配置中启用。

### Q: 数据保存多久？
A: 默认保留 365 天，可以在 `config/scheduler.yaml` 中的 cleanup_old_data 任务中调整。

### Q: 可以同时监控多个品牌的首饰金价吗？
A: 可以，在 `config/sources.yaml` 中启用需要监控的品牌数据源即可。

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 📧 联系方式

- 项目地址: https://github.com/QIUYicong/goldmonitor
- 问题反馈: https://github.com/QIUYicong/goldmonitor/issues
- 作者邮箱: yqiubc@connect.ust.hk

## 🙏 致谢

感谢以下开源项目：

- [Flask](https://flask.palletsprojects.com/) / [FastAPI](https://fastapi.tiangolo.com/)
- [Scrapy](https://scrapy.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)
- [ECharts](https://echarts.apache.org/)

---

**注意**: 本项目仅供学习和研究使用，不构成投资建议。使用本系统获取的数据进行投资决策，风险自负。
