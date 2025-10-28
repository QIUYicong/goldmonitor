# 金价追踪应用 - 部署指南

## 项目概述

全栈金价追踪应用，采用Swiss Design风格，实时监控国际金属交易金价和首饰金价，支持邮件推送和每日自动更新。

## 技术栈

- **前端**: React 18 + TypeScript + TailwindCSS + ECharts
- **后端**: Supabase (PostgreSQL + Edge Functions)
- **邮件服务**: Resend API
- **数据源**: gold-api.com (免费金价API)
- **部署**: Supabase + CDN

## 功能特性

### 1. 实时金价监控
- 国际金价：LBMA、COMEX、SGE Au99.99
- 首饰金价：周大福、周生生、老凤祥、周大生、中国黄金
- 数据来源：gold-api.com 实时API

### 2. 数据可视化
- 实时金价卡片展示
- 交互式价格走势图（ECharts）
- 多时间段对比（24小时/7天/30天/3个月/1年）
- 多数据源筛选

### 3. 邮件推送
- 每日/每周摘要
- 价格阈值告警
- 品牌监控
- 时间窗口控制

### 4. 数据源管理
- 实时状态监控
- 手动刷新
- 自动刷新（可配置间隔）
- 错误日志

## 数据库结构

### gold_prices (金价记录)
```sql
- id: SERIAL PRIMARY KEY
- source_type: 'international' | 'jewelry' | 'third_party'
- source_name: TEXT (LBMA, 周大福等)
- product_category: TEXT (Spot, 足金饰品等)
- price: NUMERIC(10,2)
- price_unit: TEXT (USD/oz, CNY/g)
- change_amount: NUMERIC(10,2)
- change_percent: NUMERIC(5,2)
- currency: TEXT
- timestamp: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
```

### email_settings (邮件设置)
```sql
- id: SERIAL PRIMARY KEY
- user_email: TEXT UNIQUE
- push_frequency: TEXT ('daily', 'weekly', 'off')
- price_threshold: NUMERIC(5,2)
- monitored_brands: TEXT[]
- push_time_start: TEXT
- push_time_end: TEXT
- is_active: BOOLEAN
- created_at/updated_at: TIMESTAMPTZ
```

### data_sources (数据源状态)
```sql
- id: SERIAL PRIMARY KEY
- source_name: TEXT UNIQUE
- source_type: TEXT
- status: TEXT ('online', 'offline', 'error')
- last_success_time: TIMESTAMPTZ
- last_error: TEXT
- response_time_ms: INTEGER
- success_count/error_count: INTEGER
- updated_at: TIMESTAMPTZ
```

### email_logs (邮件日志)
```sql
- id: SERIAL PRIMARY KEY
- recipient_email: TEXT
- email_type: TEXT ('daily_report', 'price_alert', 'test')
- subject: TEXT
- status: TEXT ('sent', 'failed', 'pending')
- error_message: TEXT
- sent_at: TIMESTAMPTZ
```

## Edge Functions

### 1. fetch-gold-prices
**功能**: 从gold-api.com获取实时金价并存储到数据库

**数据源**:
- gold-api.com API (免费，无需API key)
- 国际金价：LBMA Spot, COMEX Futures, SGE Au99.99
- 首饰金价：基于国际金价计算（加上品牌加工费）

**触发方式**:
- 前端手动调用
- 定时任务自动调用

### 2. send-email-notification
**功能**: 发送邮件通知（使用Resend API）

**邮件类型**:
- 每日报告
- 价格告警
- 测试邮件

**内容**:
- 国际金价卡片
- 首饰金价表格
- HTML格式，响应式设计

### 3. cron-daily-update
**功能**: 每日定时任务

**流程**:
1. 调用 fetch-gold-prices 获取最新数据
2. 查询启用推送的用户设置
3. 检查时间窗口
4. 批量发送邮件

**Cron表达式**: `0 10 * * *` (每天10:00 UTC / 18:00 北京时间)

## 部署步骤

### 前置要求

1. **Supabase账号** (https://supabase.com)
2. **Resend账号** (https://resend.com)
3. **Node.js 18+** 和 **pnpm**

### 步骤1: Supabase配置

1. 创建Supabase项目
2. 获取项目凭证：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. 创建数据库表（执行 docs/database-schema.md 中的SQL）

4. 配置RLS策略：
```sql
-- 所有表启用RLS并允许 anon 和 service_role
ALTER TABLE gold_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON gold_prices
  FOR ALL USING (auth.role() IN ('anon', 'service_role'));

-- 对其他表重复相同操作
```

### 步骤2: 部署Edge Functions

```bash
# 安装Supabase CLI
npm install -g supabase

# 登录
supabase login

# 链接项目
supabase link --project-ref <your-project-ref>

# 部署函数
supabase functions deploy fetch-gold-prices
supabase functions deploy send-email-notification
supabase functions deploy cron-daily-update

# 设置环境变量
supabase secrets set RESEND_API_KEY=<your-resend-api-key>
```

### 步骤3: 配置定时任务

在Supabase Dashboard中创建cron job:

```sql
SELECT cron.schedule(
  'daily-gold-price-update',
  '0 10 * * *',  -- 每天10:00 UTC
  $$
  SELECT net.http_post(
    url := '<your-supabase-url>/functions/v1/cron-daily-update',
    headers := jsonb_build_object(
      'Authorization', 'Bearer <your-service-role-key>',
      'Content-Type', 'application/json'
    )
  ) AS request_id;
  $$
);
```

### 步骤4: 前端部署

1. 配置环境变量:
```bash
cd gold-price-tracker
cp .env.example .env

# 编辑 .env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

2. 构建并部署:
```bash
pnpm install
pnpm run build

# 部署 dist 目录到CDN或静态托管服务
```

### 步骤5: 测试

1. 访问应用URL
2. 测试金价获取（数据源管理页面点击"刷新所有数据源"）
3. 配置邮件设置
4. 发送测试邮件到 yqiubc@connect.ust.hk
5. 验证定时任务运行

## 监控与维护

### 日志查看
- Supabase Dashboard > Logs > Edge Functions
- 查看函数调用、错误和性能

### 数据源健康检查
- 访问"数据源管理"页面
- 查看各数据源状态、响应时间、成功/失败次数

### 邮件日志
```sql
SELECT * FROM email_logs 
ORDER BY sent_at DESC 
LIMIT 100;
```

## API使用说明

### 金价API (gold-api.com)
- **免费**: 无需注册，无API key
- **限制**: 公平使用政策，适合中小流量
- **端点**: 
  - GET https://api.gold-api.com/price/XAU (黄金)
  - GET https://api.gold-api.com/price/XAG (白银)
- **响应示例**:
```json
{
  "name": "Gold",
  "price": 3991.70,
  "symbol": "XAU",
  "updatedAt": "2025-10-27T14:53:55Z"
}
```

### Resend邮件API
- **免费额度**: 3000封/月，100封/天
- **文档**: https://resend.com/docs
- **需要**: API Key和验证域名

## 故障排除

### Edge Function错误: "new row violates row-level security policy"
**原因**: RLS策略未允许anon角色
**解决**: 确保所有表的RLS策略包含 `auth.role() IN ('anon', 'service_role')`

### 金价数据未更新
1. 检查Edge Function日志
2. 测试gold-api.com可访问性：`curl https://api.gold-api.com/price/XAU`
3. 检查data_sources表状态

### 邮件未发送
1. 验证Resend API Key
2. 检查email_logs表状态
3. 确认email_settings中is_active=true
4. 检查时间窗口配置

## 成本估算

| 服务 | 免费额度 | 成本（超出后）|
|------|---------|--------------|
| Supabase | 500MB数据库，2GB带宽/月 | $25/月起 |
| Resend | 3000封邮件/月 | $20/月（50K封）|
| gold-api.com | 无限制（公平使用） | 免费 |

预计每月成本：**$0-45**（取决于使用量）

## 联系与支持

- 项目邮箱: yqiubc@connect.ust.hk
- 金价数据更新: 实时（基于API调用）
- 定时任务: 每日10:00 UTC（18:00北京时间）

## License

MIT License
