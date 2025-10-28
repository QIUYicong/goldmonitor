-- 金价追踪应用 - 数据库初始化脚本
-- 执行此脚本创建所有表和RLS策略

-- ==========================================
-- 1. 创建gold_prices表（金价历史记录）
-- ==========================================
CREATE TABLE IF NOT EXISTS gold_prices (
  id SERIAL PRIMARY KEY,
  source_type TEXT NOT NULL CHECK (source_type IN ('international', 'jewelry', 'third_party')),
  source_name TEXT NOT NULL,
  product_category TEXT,
  price NUMERIC(10,2) NOT NULL,
  price_unit TEXT NOT NULL,
  change_amount NUMERIC(10,2),
  change_percent NUMERIC(5,2),
  currency TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引提高查询性能
CREATE INDEX IF NOT EXISTS idx_gold_prices_source ON gold_prices(source_name, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_gold_prices_timestamp ON gold_prices(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_gold_prices_source_type ON gold_prices(source_type);

-- 启用RLS并创建策略
ALTER TABLE gold_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow all operations via edge function" ON gold_prices
  FOR ALL
  USING (auth.role() IN ('anon', 'service_role'));

-- ==========================================
-- 2. 创建email_settings表（邮件推送设置）
-- ==========================================
CREATE TABLE IF NOT EXISTS email_settings (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL UNIQUE,
  push_frequency TEXT NOT NULL DEFAULT 'daily' CHECK (push_frequency IN ('realtime', 'daily', 'weekly', 'off')),
  price_threshold NUMERIC(5,2) DEFAULT 2.0,
  monitored_brands TEXT[],
  push_time_start TEXT DEFAULT '08:00',
  push_time_end TEXT DEFAULT '22:00',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_email_settings_email ON email_settings(user_email);
CREATE INDEX IF NOT EXISTS idx_email_settings_active ON email_settings(is_active) WHERE is_active = TRUE;

-- 启用RLS并创建策略
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow all operations via edge function" ON email_settings
  FOR ALL
  USING (auth.role() IN ('anon', 'service_role'));

-- ==========================================
-- 3. 创建data_sources表（数据源状态监控）
-- ==========================================
CREATE TABLE IF NOT EXISTS data_sources (
  id SERIAL PRIMARY KEY,
  source_name TEXT NOT NULL UNIQUE,
  source_type TEXT NOT NULL CHECK (source_type IN ('international', 'jewelry', 'third_party')),
  status TEXT NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'offline', 'error')),
  last_success_time TIMESTAMPTZ,
  last_error TEXT,
  response_time_ms INTEGER,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_data_sources_name ON data_sources(source_name);
CREATE INDEX IF NOT EXISTS idx_data_sources_status ON data_sources(status);

-- 启用RLS并创建策略
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow all operations via edge function" ON data_sources
  FOR ALL
  USING (auth.role() IN ('anon', 'service_role'));

-- ==========================================
-- 4. 创建email_logs表（邮件发送日志）
-- ==========================================
CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  email_type TEXT NOT NULL CHECK (email_type IN ('daily_report', 'price_alert', 'test')),
  subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);

-- 启用RLS并创建策略
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow all operations via edge function" ON email_logs
  FOR ALL
  USING (auth.role() IN ('anon', 'service_role'));

-- ==========================================
-- 5. 插入默认邮件设置
-- ==========================================
INSERT INTO email_settings (user_email, push_frequency, price_threshold, monitored_brands, is_active)
VALUES ('yqiubc@connect.ust.hk', 'daily', 2.0, ARRAY['周大福', '周生生', '老凤祥'], TRUE)
ON CONFLICT (user_email) DO NOTHING;

-- ==========================================
-- 6. 插入初始数据源配置
-- ==========================================
INSERT INTO data_sources (source_name, source_type, status) VALUES
  ('LBMA', 'international', 'online'),
  ('COMEX', 'international', 'online'),
  ('SGE', 'international', 'online'),
  ('周大福', 'jewelry', 'online'),
  ('周生生', 'jewelry', 'online'),
  ('老凤祥', 'jewelry', 'online'),
  ('周大生', 'jewelry', 'online'),
  ('中国黄金', 'jewelry', 'online')
ON CONFLICT (source_name) DO NOTHING;

-- ==========================================
-- 完成提示
-- ==========================================
-- 数据库初始化完成！
-- 下一步：
-- 1. 部署Edge Functions
-- 2. 配置Resend API Key
-- 3. 设置定时任务（cron job）
