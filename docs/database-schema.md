# 金价追踪应用 - 数据库设计

## 数据表结构

### 1. gold_prices (金价记录表)
存储历史金价数据，支持多源数据对比和趋势分析

```sql
CREATE TABLE gold_prices (
  id SERIAL PRIMARY KEY,
  source_type TEXT NOT NULL,           -- 数据源类型: 'international' | 'jewelry' | 'third_party'
  source_name TEXT NOT NULL,           -- 数据源名称: 'LBMA' | '周大福' | 'SGE' 等
  product_category TEXT,               -- 产品类别: 'AU99.99' | '足金饰品' | 'AM' | 'PM' 等
  price NUMERIC(10,2) NOT NULL,        -- 价格
  price_unit TEXT NOT NULL,            -- 单位: 'CNY/g' | 'USD/oz' 等
  change_amount NUMERIC(10,2),         -- 涨跌金额
  change_percent NUMERIC(5,2),         -- 涨跌百分比
  currency TEXT NOT NULL,              -- 货币: 'CNY' | 'USD' 等
  timestamp TIMESTAMPTZ NOT NULL,      -- 数据时间戳
  created_at TIMESTAMPTZ DEFAULT NOW() -- 记录创建时间
);

CREATE INDEX idx_gold_prices_source ON gold_prices(source_name, timestamp DESC);
CREATE INDEX idx_gold_prices_timestamp ON gold_prices(timestamp DESC);
```

### 2. email_settings (邮件设置表)
存储用户邮件推送偏好设置

```sql
CREATE TABLE email_settings (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL UNIQUE,     -- 用户邮箱
  push_frequency TEXT NOT NULL DEFAULT 'daily', -- 推送频率: 'realtime' | 'daily' | 'weekly' | 'off'
  price_threshold NUMERIC(5,2) DEFAULT 2.0,     -- 价格阈值（百分比）
  monitored_brands TEXT[],             -- 监控的品牌列表
  push_time_start TEXT DEFAULT '08:00', -- 推送时间窗口开始
  push_time_end TEXT DEFAULT '22:00',   -- 推送时间窗口结束
  is_active BOOLEAN DEFAULT TRUE,       -- 是否启用
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. data_sources (数据源状态表)
监控数据源健康状况

```sql
CREATE TABLE data_sources (
  id SERIAL PRIMARY KEY,
  source_name TEXT NOT NULL UNIQUE,    -- 数据源名称
  source_type TEXT NOT NULL,           -- 类型: 'international' | 'jewelry' | 'third_party'
  status TEXT NOT NULL DEFAULT 'online', -- 状态: 'online' | 'offline' | 'error'
  last_success_time TIMESTAMPTZ,       -- 最后成功时间
  last_error TEXT,                     -- 最后错误信息
  response_time_ms INTEGER,            -- 响应时间（毫秒）
  success_count INTEGER DEFAULT 0,     -- 成功次数
  error_count INTEGER DEFAULT 0,       -- 失败次数
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. email_logs (邮件日志表)
记录邮件发送历史

```sql
CREATE TABLE email_logs (
  id SERIAL PRIMARY KEY,
  recipient_email TEXT NOT NULL,       -- 收件人
  email_type TEXT NOT NULL,            -- 邮件类型: 'daily_report' | 'price_alert' | 'test'
  subject TEXT NOT NULL,               -- 邮件主题
  status TEXT NOT NULL,                -- 状态: 'sent' | 'failed' | 'pending'
  error_message TEXT,                  -- 错误信息
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email, sent_at DESC);
```

## RLS 策略

根据Supabase最佳实践，所有表的RLS策略允许 `anon` 和 `service_role` 两种角色：

```sql
-- gold_prices 表
ALTER TABLE gold_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations via edge function" ON gold_prices
  FOR ALL
  USING (auth.role() IN ('anon', 'service_role'));

-- email_settings 表
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations via edge function" ON email_settings
  FOR ALL
  USING (auth.role() IN ('anon', 'service_role'));

-- data_sources 表
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations via edge function" ON data_sources
  FOR ALL
  USING (auth.role() IN ('anon', 'service_role'));

-- email_logs 表
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations via edge function" ON email_logs
  FOR ALL
  USING (auth.role() IN ('anon', 'service_role'));
```

## 数据源配置

### 国际金价数据源
- LBMA AM/PM（通过第三方API）
- COMEX（通过第三方API）
- SGE Au99.99（通过第三方API）

### 首饰金价数据源
- 周大福
- 周生生
- 老凤祥
- 周大生
- 中国黄金

### 第三方聚合平台
- 金价查询网
- 其他聚合API
