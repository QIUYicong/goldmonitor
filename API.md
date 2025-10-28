# API 文档

## 基础信息

- **Base URL**: `http://localhost:5000/api/v1`
- **认证方式**: API Key (Header: `X-API-Key`)
- **数据格式**: JSON
- **字符编码**: UTF-8

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

## 价格相关 API

### 1. 获取当前金价

**接口**: `GET /price/current`

**描述**: 获取最新的国际金价和首饰金价

**请求参数**: 无

**响应示例**:
```json
{
  "success": true,
  "data": {
    "timestamp": "2025-10-28T12:00:00Z",
    "international": {
      "london_gold": {
        "price": 2050.50,
        "currency": "USD",
        "unit": "oz",
        "change": 15.30,
        "change_percent": 0.75,
        "updated_at": "2025-10-28T11:55:00Z"
      },
      "shanghai_gold": {
        "price": 468.50,
        "currency": "CNY",
        "unit": "g",
        "change": -2.30,
        "change_percent": -0.49,
        "updated_at": "2025-10-28T11:50:00Z"
      }
    },
    "jewelry": [
      {
        "brand": "周大福",
        "price": 620,
        "currency": "CNY",
        "unit": "g",
        "change": 5.0,
        "change_percent": 0.81,
        "updated_at": "2025-10-28T10:00:00Z"
      },
      {
        "brand": "老凤祥",
        "price": 615,
        "currency": "CNY",
        "unit": "g",
        "change": 3.0,
        "change_percent": 0.49,
        "updated_at": "2025-10-28T10:30:00Z"
      }
    ]
  }
}
```

### 2. 获取历史价格数据

**接口**: `GET /price/history`

**描述**: 获取指定时间范围内的历史价格数据

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | string | 否 | 价格类型：`international`（国际金价）或 `jewelry`（首饰金价），默认全部 |
| brand | string | 否 | 品牌名称（仅当 type=jewelry 时有效） |
| days | integer | 否 | 查询天数，默认 30 天 |
| start_date | string | 否 | 开始日期，格式：YYYY-MM-DD |
| end_date | string | 否 | 结束日期，格式：YYYY-MM-DD |
| interval | string | 否 | 数据间隔：`5m`, `1h`, `1d`，默认 `1d` |

**请求示例**:
```
GET /price/history?type=international&days=7&interval=1h
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "type": "international",
    "interval": "1h",
    "prices": [
      {
        "timestamp": "2025-10-21T00:00:00Z",
        "london_gold": 2045.20,
        "shanghai_gold": 466.80
      },
      {
        "timestamp": "2025-10-21T01:00:00Z",
        "london_gold": 2046.50,
        "shanghai_gold": 467.10
      }
      // ... 更多数据
    ],
    "statistics": {
      "count": 168,
      "max": 2055.80,
      "min": 2040.10,
      "average": 2048.50,
      "volatility": 0.38
    }
  }
}
```

### 3. 获取价格统计信息

**接口**: `GET /price/statistics`

**描述**: 获取价格的统计分析数据

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | string | 是 | 价格类型：`international` 或 `jewelry` |
| period | string | 否 | 统计周期：`day`, `week`, `month`, `year`，默认 `week` |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "period": "week",
    "start_date": "2025-10-21",
    "end_date": "2025-10-28",
    "statistics": {
      "opening_price": 2040.50,
      "closing_price": 2050.50,
      "highest_price": 2055.80,
      "lowest_price": 2038.20,
      "average_price": 2047.30,
      "change": 10.00,
      "change_percent": 0.49,
      "volatility": 0.43
    }
  }
}
```

## 预警相关 API

### 4. 创建价格预警

**接口**: `POST /alert`

**描述**: 创建新的价格预警规则

**请求参数**:
```json
{
  "price_type": "international",
  "source": "london_gold",
  "threshold_high": 2100,
  "threshold_low": 2000,
  "notification_methods": ["email", "wechat"],
  "email": "user@example.com",
  "is_active": true
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "alert_id": 123,
    "created_at": "2025-10-28T12:00:00Z",
    "message": "价格预警创建成功"
  }
}
```

### 5. 获取预警列表

**接口**: `GET /alert`

**描述**: 获取用户的所有预警规则

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| is_active | boolean | 否 | 是否只显示激活的预警 |
| page | integer | 否 | 页码，默认 1 |
| per_page | integer | 否 | 每页数量，默认 20 |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": 123,
        "price_type": "international",
        "source": "london_gold",
        "threshold_high": 2100,
        "threshold_low": 2000,
        "notification_methods": ["email", "wechat"],
        "is_active": true,
        "triggered_count": 5,
        "last_triggered_at": "2025-10-27T15:30:00Z",
        "created_at": "2025-10-20T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 1,
      "total_pages": 1
    }
  }
}
```

### 6. 更新预警规则

**接口**: `PUT /alert/{alert_id}`

**描述**: 更新指定的预警规则

**请求参数**:
```json
{
  "threshold_high": 2150,
  "threshold_low": 1950,
  "is_active": true
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "alert_id": 123,
    "updated_at": "2025-10-28T12:00:00Z",
    "message": "预警规则更新成功"
  }
}
```

### 7. 删除预警规则

**接口**: `DELETE /alert/{alert_id}`

**描述**: 删除指定的预警规则

**响应示例**:
```json
{
  "success": true,
  "message": "预警规则删除成功"
}
```

### 8. 获取预警历史

**接口**: `GET /alert/{alert_id}/history`

**描述**: 获取指定预警的触发历史记录

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| days | integer | 否 | 查询天数，默认 30 |
| page | integer | 否 | 页码，默认 1 |
| per_page | integer | 否 | 每页数量，默认 20 |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "alert_id": 123,
    "history": [
      {
        "id": 456,
        "triggered_at": "2025-10-27T15:30:00Z",
        "trigger_type": "high",
        "price": 2105.50,
        "threshold": 2100,
        "notification_sent": true,
        "notification_methods": ["email", "wechat"]
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 5,
      "total_pages": 1
    }
  }
}
```

## 数据源相关 API

### 9. 获取数据源列表

**接口**: `GET /source`

**描述**: 获取所有支持的数据源及其状态

**响应示例**:
```json
{
  "success": true,
  "data": {
    "international": [
      {
        "name": "kitco",
        "display_name": "Kitco",
        "url": "https://www.kitco.com",
        "interval": 300,
        "enabled": true,
        "last_fetch_at": "2025-10-28T11:55:00Z",
        "status": "online"
      },
      {
        "name": "investing",
        "display_name": "Investing.com",
        "url": "https://www.investing.com",
        "interval": 300,
        "enabled": true,
        "last_fetch_at": "2025-10-28T11:54:00Z",
        "status": "online"
      }
    ],
    "jewelry": [
      {
        "name": "chow_tai_fook",
        "display_name": "周大福",
        "url": "https://www.ctf.com.cn",
        "interval": 3600,
        "enabled": true,
        "last_fetch_at": "2025-10-28T10:00:00Z",
        "status": "online"
      }
    ]
  }
}
```

### 10. 手动触发数据采集

**接口**: `POST /source/{source_name}/fetch`

**描述**: 手动触发指定数据源的数据采集

**响应示例**:
```json
{
  "success": true,
  "data": {
    "source": "kitco",
    "task_id": "abc123def456",
    "status": "pending",
    "message": "数据采集任务已提交"
  }
}
```

## 系统相关 API

### 11. 系统健康检查

**接口**: `GET /health`

**描述**: 检查系统各组件的健康状态

**响应示例**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-10-28T12:00:00Z",
    "components": {
      "database": {
        "status": "healthy",
        "latency_ms": 5
      },
      "redis": {
        "status": "healthy",
        "latency_ms": 2
      },
      "scheduler": {
        "status": "healthy",
        "running_jobs": 3
      },
      "scrapers": {
        "status": "healthy",
        "active_count": 5,
        "failed_count": 0
      }
    }
  }
}
```

### 12. 获取系统统计

**接口**: `GET /statistics`

**描述**: 获取系统运行统计信息

**响应示例**:
```json
{
  "success": true,
  "data": {
    "total_price_records": 1234567,
    "total_alerts": 89,
    "total_notifications_sent": 345,
    "active_data_sources": 8,
    "uptime_hours": 720,
    "last_24h": {
      "price_updates": 288,
      "alerts_triggered": 12,
      "notifications_sent": 24
    }
  }
}
```

## 错误码说明

| 错误码 | HTTP 状态码 | 说明 |
|--------|-------------|------|
| INVALID_PARAMS | 400 | 请求参数无效 |
| UNAUTHORIZED | 401 | 未授权，缺少或无效的 API Key |
| FORBIDDEN | 403 | 禁止访问 |
| NOT_FOUND | 404 | 资源不存在 |
| RATE_LIMIT_EXCEEDED | 429 | 请求频率超过限制 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |
| DATABASE_ERROR | 500 | 数据库错误 |
| SCRAPER_ERROR | 503 | 数据采集服务错误 |

## 频率限制

- 普通用户：100 请求/分钟
- 认证用户：1000 请求/分钟
- 手动触发采集：10 次/小时

响应头中会包含频率限制信息：
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1698505200
```

## 认证

在请求头中添加 API Key：
```
X-API-Key: your_api_key_here
```

或使用查询参数：
```
GET /api/v1/price/current?api_key=your_api_key_here
```

## 使用示例

### Python
```python
import requests

API_BASE = "http://localhost:5000/api/v1"
API_KEY = "your_api_key"

headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

# 获取当前金价
response = requests.get(f"{API_BASE}/price/current", headers=headers)
data = response.json()
print(data)

# 创建价格预警
alert_data = {
    "price_type": "international",
    "source": "london_gold",
    "threshold_high": 2100,
    "threshold_low": 2000,
    "notification_methods": ["email"]
}
response = requests.post(f"{API_BASE}/alert", json=alert_data, headers=headers)
print(response.json())
```

### JavaScript (Node.js)
```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/v1';
const API_KEY = 'your_api_key';

const headers = {
  'X-API-Key': API_KEY,
  'Content-Type': 'application/json'
};

// 获取当前金价
axios.get(`${API_BASE}/price/current`, { headers })
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error:', error.response.data);
  });

// 创建价格预警
const alertData = {
  price_type: 'international',
  source: 'london_gold',
  threshold_high: 2100,
  threshold_low: 2000,
  notification_methods: ['email']
};

axios.post(`${API_BASE}/alert`, alertData, { headers })
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error:', error.response.data);
  });
```

### cURL
```bash
# 获取当前金价
curl -X GET \
  http://localhost:5000/api/v1/price/current \
  -H 'X-API-Key: your_api_key'

# 创建价格预警
curl -X POST \
  http://localhost:5000/api/v1/alert \
  -H 'X-API-Key: your_api_key' \
  -H 'Content-Type: application/json' \
  -d '{
    "price_type": "international",
    "source": "london_gold",
    "threshold_high": 2100,
    "threshold_low": 2000,
    "notification_methods": ["email"]
  }'
```
