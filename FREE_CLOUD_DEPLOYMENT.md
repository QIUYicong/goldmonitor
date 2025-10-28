# 🚀 金价监控系统 - 免费云端部署完整指南

## 📋 架构概览

您的金价监控系统将部署在以下免费服务上：
- **数据库**：Supabase PostgreSQL（免费额度：500MB数据库 + 50GB带宽/月）
- **后端API**：Supabase Edge Functions（免费额度：500K请求/月）
- **邮件服务**：Gmail SMTP（免费，每天500封）
- **定时任务**：Supabase Cron Jobs（免费）

**当前仓库内容**：Supabase后端（Edge Functions + 数据库结构）
**前端**：需要单独开发或使用Supabase Dashboard管理

## ✅ 前置准备

### 1. 注册免费账号

- [ ] [Supabase](https://supabase.com) - 数据库 + Edge Functions（免费）
- [ ] [GitHub](https://github.com) - 代码托管（可选，用于备份）
- [ ] Gmail账号 - 已有（carlomayacsk@gmail.com）

### 2. 确认您的项目结构

```
goldmonitor/
├── supabase/
│   ├── functions/              # Edge Functions（后端API）
│   │   ├── send-email-notification/   # 邮件发送功能
│   │   ├── fetch-gold-prices/         # 金价抓取
│   │   └── cron-daily-update/         # 定时任务
│   └── migrations/            # 数据库结构
│       ├── init_schema.sql    # 数据库初始化
│       └── ...
├── deploy-email-function.ps1  # 部署脚本
└── GMAIL_SETUP_GUIDE.md      # Gmail配置指南
```

---

## 🎯 部署步骤

### 第一步：推送代码到GitHub（可选）

**注意**：推送到GitHub是可选的，用于代码备份和版本控制。您也可以直接从本地部署。

<details>
<summary>点击展开GitHub推送步骤</summary>

1. **初始化Git仓库**

```bash
cd E:\gitrepo\goldmonitor
git init
git add .
git commit -m "Initial commit: Gold price monitoring system"
```

2. **创建GitHub仓库**
   - 访问：https://github.com/new
   - 仓库名：goldmonitor
   - 设置为Private（私有）
   - 不要初始化README

3. **推送代码**

```bash
git remote add origin https://github.com/YOUR_USERNAME/goldmonitor.git
git branch -M main
git push -u origin main
```

</details>

---

### 第二步：部署Supabase后端

#### 2.1 创建Supabase项目（如果还没有）

1. 访问：https://supabase.com/dashboard
2. 点击"New Project"
3. 填写信息：
   - Name: goldmonitor
   - Database Password: （设置强密码）
   - Region: Northeast Asia (Tokyo) - 离中国最近
   - Pricing Plan: Free

#### 2.2 连接本地项目到Supabase

```bash
# 登录Supabase CLI
npx supabase login

# 链接项目（会提示选择项目）
npx supabase link --project-ref your-project-ref
```

获取project-ref：
- Supabase Dashboard → Project Settings → General → Reference ID

#### 2.3 部署数据库结构

```bash
# 推送数据库迁移
npx supabase db push
```

#### 2.4 配置Gmail SMTP密钥

**方法A：使用自动化脚本**

```powershell
.\deploy-email-function.ps1
```

**方法B：手动配置**

1. 访问：https://supabase.com/dashboard/project/YOUR_PROJECT/settings/functions
2. 导航到：Secrets 选项卡
3. 添加以下Secrets：

```
GMAIL_USER = carlomayacsk@gmail.com
GMAIL_APP_PASSWORD = ayowsyzxhkusfywd
```

#### 2.5 部署Edge Functions

```bash
# 部署所有Edge Functions
npx supabase functions deploy send-email-notification
npx supabase functions deploy fetch-gold-prices
npx supabase functions deploy cron-daily-update
```

#### 2.6 配置定时任务（Cron Jobs）

1. 访问：https://supabase.com/dashboard/project/YOUR_PROJECT/database/cron-jobs
2. 创建Cron Job：

**每小时抓取金价**
```sql
SELECT cron.schedule(
  'hourly-gold-price-fetch',
  '0 * * * *',  -- 每小时整点
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/fetch-gold-prices',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

**每日早上8点发送报告**
```sql
SELECT cron.schedule(
  'daily-gold-report',
  '0 8 * * *',  -- 每天早上8点（UTC时间，需根据时区调整）
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/cron-daily-update',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

替换：
- `YOUR_PROJECT_REF`：在 Project Settings → API → Project URL 中找到
- `YOUR_ANON_KEY`：在 Project Settings → API → Project API keys → anon public 中找到

---

### 第三步：测试API和邮件功能

#### 3.1 测试金价抓取

1. **通过Supabase Dashboard测试**
   - 访问：Edge Functions → fetch-gold-prices
   - 点击"Invoke"
   - 使用空JSON：`{}`

2. **通过API测试**

```bash
curl -X POST \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/fetch-gold-prices \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

3. **查看数据**

在SQL Editor中运行：
```sql
SELECT * FROM gold_prices ORDER BY timestamp DESC LIMIT 10;
```

#### 3.2 测试邮件发送

```bash
curl -X POST \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-email-notification \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"emailType": "test"}'
```

检查您的两个邮箱：
- yqiubc@connect.ust.hk
- y15205207533@163.com

---

## 🎉 部署完成！

### 您的后端系统现在运行在：

- **Supabase API**：https://YOUR_PROJECT_REF.supabase.co
- **Edge Functions**：
  - 金价抓取：`/functions/v1/fetch-gold-prices`
  - 邮件发送：`/functions/v1/send-email-notification`
  - 定时任务：`/functions/v1/cron-daily-update`

### 验证部署

1. **检查数据库**
   - Supabase Dashboard → Table Editor
   - 查看gold_prices表是否有数据

2. **测试邮件功能**
   - 运行上面的curl命令测试邮件
   - 检查两个邮箱是否收到邮件

3. **检查定时任务**
   - Database → Cron Jobs
   - 查看执行历史和状态

### 使用API

您可以通过以下方式调用API：

**手动触发金价抓取**：
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/fetch-gold-prices \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**发送测试邮件**：
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-email-notification \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"emailType": "test"}'
```

---

## 💰 免费额度详情

### Supabase免费计划
- ✅ 500MB PostgreSQL数据库
- ✅ 5GB文件存储
- ✅ 50GB带宽/月
- ✅ 500K Edge Function调用/月
- ✅ 无限API请求
- ✅ 2个并发数据库连接
- ✅ 50GB数据传输

### Gmail SMTP免费额度
- ✅ 每天500封邮件（免费账号）
- ✅ 无需付费API key
- ✅ 可靠的送达率

### 预估使用量（您的金价监控系统）

| 资源 | 预估使用 | 免费额度 | 状态 |
|------|---------|---------|------|
| 数据库存储 | < 50MB | 500MB | ✅ 充足 |
| Edge Function调用 | ~750次/月 | 500K/月 | ✅ 充足 |
| 邮件发送 | ~60封/月 | 15,000封/月 | ✅ 充足 |
| 数据带宽 | < 1GB/月 | 50GB/月 | ✅ 充足 |

**计算说明**：
- **Edge Functions**: 每小时抓取金价（720次/月）+ 每日邮件报告（30次/月）= 750次
- **邮件**: 每天发送到2个邮箱 × 30天 = 60封/月
- **数据库**: 每小时1条记录 × 24小时 × 365天 × 0.5KB = ~4MB/年

**结论：完全在免费额度内，可以永久免费运行！** 🎉

---

## 🔧 后续维护

### 更新Edge Functions

```bash
# 修改Edge Function代码后
cd E:\gitrepo\goldmonitor

# 重新部署单个函数
npx supabase functions deploy send-email-notification

# 或部署所有函数
npx supabase functions deploy fetch-gold-prices
npx supabase functions deploy send-email-notification
npx supabase functions deploy cron-daily-update
```

### 监控日志

**Supabase Edge Function日志**
1. 访问：Dashboard → Logs → Edge Functions
2. 选择要查看的函数
3. 查看执行日志、错误和性能指标

**定时任务日志**
1. Dashboard → Database → Cron Jobs
2. 查看每个任务的执行历史
3. 检查成功/失败状态

### 查看邮件发送历史

```sql
-- 在Supabase SQL Editor中运行
SELECT * FROM email_logs
ORDER BY created_at DESC
LIMIT 20;
```

---

## 🌐 API访问（适用于前端开发）

当您开发前端应用时，可以使用以下Supabase配置：

**环境变量**：
```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

**API端点**：
```javascript
// 获取金价数据
GET https://YOUR_PROJECT_REF.supabase.co/rest/v1/gold_prices
  ?order=timestamp.desc
  &limit=20

// 调用Edge Function
POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/fetch-gold-prices

Headers:
  Authorization: Bearer YOUR_ANON_KEY
  apikey: YOUR_ANON_KEY
```

**Supabase客户端示例**（JavaScript）：
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://YOUR_PROJECT_REF.supabase.co',
  'YOUR_ANON_KEY'
)

// 获取金价数据
const { data, error } = await supabase
  .from('gold_prices')
  .select('*')
  .order('timestamp', { ascending: false })
  .limit(20)

// 调用Edge Function发送邮件
const { data: emailData, error: emailError } = await supabase.functions
  .invoke('send-email-notification', {
    body: { emailType: 'test' }
  })
```

---

## ⚠️ 常见问题

### Q: Edge Function超时？
A: 免费计划有10秒超时限制。如果抓取金价超时，考虑：
- 减少同时抓取的网站数量
- 分批抓取（创建多个小函数）

### Q: 邮件发送失败？
A: 检查：
1. Gmail Secrets是否正确配置
2. 查看Edge Function日志
3. 检查email_logs表的错误信息

### Q: 定时任务没有执行？
A:
1. 确认Cron Job已正确创建
2. 检查时区设置（UTC vs 本地时间）
3. 查看Supabase Logs → Cron Jobs

### Q: 数据库连接失败？
A:
1. 检查项目是否处于活跃状态（免费项目7天无活动会暂停）
2. 验证API keys是否正确
3. 查看Edge Function日志获取详细错误

---

## 📞 获取帮助

- **Vercel文档**：https://vercel.com/docs
- **Supabase文档**：https://supabase.com/docs
- **项目配置指南**：查看 GMAIL_SETUP_GUIDE.md

---

## 🎯 快速部署检查清单

### 必须完成 ✅
- [ ] Supabase项目已创建
- [ ] 数据库迁移已执行（运行init_schema.sql）
- [ ] Gmail SMTP Secrets已配置（GMAIL_USER, GMAIL_APP_PASSWORD）
- [ ] Edge Functions已部署
  - [ ] send-email-notification
  - [ ] fetch-gold-prices
  - [ ] cron-daily-update
- [ ] Cron Jobs已配置
  - [ ] 每小时抓取金价
  - [ ] 每日邮件报告
- [ ] 测试邮件发送成功（收到测试邮件）
- [ ] 金价数据正常抓取（gold_prices表有数据）

### 可选完成 📋
- [ ] 代码推送到GitHub（用于备份）
- [ ] 配置自定义抓取频率
- [ ] 调整邮件发送时间
- [ ] 开发前端应用

---

## ✨ 完成！

完成所有必须步骤后，您的金价监控系统将：
- ✅ 24/7自动运行在Supabase云端
- ✅ 每小时自动抓取金价数据
- ✅ 每天自动发送邮件报告到您的两个邮箱
- ✅ 完全免费（永久在免费额度内）
- ✅ 无需服务器维护

**享受您的自动化金价监控系统！** 🎉💰
