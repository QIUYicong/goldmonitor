# ⚡ 金价监控系统 - 5分钟快速部署

## 🎯 目标

在5分钟内将您的金价监控系统部署到云端，实现：
- 自动抓取金价数据
- 自动发送邮件到 yqiubc@connect.ust.hk 和 y15205207533@163.com
- 完全免费运行

---

## 📋 前置要求

1. ✅ Supabase账号（如无，访问 https://supabase.com 注册）
2. ✅ Gmail应用密码：`ayow syzx hkus fywd`（已有）
3. ✅ 本地已安装Node.js

---

## 🚀 5步部署

### 步骤1：创建Supabase项目（2分钟）

1. 访问：https://supabase.com/dashboard
2. 点击"New Project"
3. 填写信息：
   - **Name**: goldmonitor
   - **Database Password**: 设置一个强密码（记住它！）
   - **Region**: Northeast Asia (Tokyo)
   - **Pricing Plan**: Free
4. 点击"Create new project"
5. 等待项目创建完成（约1-2分钟）

### 步骤2：初始化数据库（30秒）

1. 在Supabase Dashboard中，点击左侧 **SQL Editor**
2. 点击"New query"
3. 复制粘贴 `supabase/migrations/init_schema.sql` 的全部内容
4. 点击"Run"执行

**验证**：左侧 **Table Editor** 应该显示以下表：
- gold_prices
- email_settings
- data_sources
- email_logs

### 步骤3：配置Gmail密钥（30秒）

1. 在Supabase Dashboard中，点击 **Project Settings** → **Edge Functions**
2. 找到"Secrets"选项卡
3. 点击"Add secret"，添加：

```
Name: GMAIL_USER
Value: carlomayacsk@gmail.com
```

4. 再次点击"Add secret"，添加：

```
Name: GMAIL_APP_PASSWORD
Value: ayowsyzxhkusfywd
```

（注意：密码去掉了空格）

### 步骤4：部署Edge Functions（1分钟）

在PowerShell中运行：

```powershell
cd E:\gitrepo\goldmonitor

# 运行部署脚本（会自动设置所有Secrets和部署函数）
.\deploy-email-function.ps1
```

**如果脚本提示需要Access Token**：
1. 访问：https://supabase.com/dashboard/account/tokens
2. 点击"Generate New Token"
3. 复制Token
4. 粘贴到脚本提示中

**或者手动部署**：

```powershell
# 登录Supabase CLI
npx supabase login

# 链接项目（获取project-ref：Dashboard → Settings → General → Reference ID）
npx supabase link --project-ref YOUR_PROJECT_REF

# 部署函数
npx supabase functions deploy send-email-notification
npx supabase functions deploy fetch-gold-prices
npx supabase functions deploy cron-daily-update
```

### 步骤5：配置定时任务（1分钟）

1. 在Supabase Dashboard中，点击 **Database** → **Cron Jobs**
2. 点击"Create a new cron job"

**任务1：每小时抓取金价**

```sql
SELECT cron.schedule(
  'hourly-gold-price-fetch',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/fetch-gold-prices',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

**任务2：每天早上8点发送报告**

```sql
SELECT cron.schedule(
  'daily-gold-report',
  '0 0 * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/cron-daily-update',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

**替换参数**（在 Dashboard → Settings → API 中找到）：
- `YOUR_PROJECT_REF`：项目引用ID
- `YOUR_ANON_KEY`：匿名公钥（anon public）

---

## ✅ 验证部署

### 测试1：手动抓取金价

在PowerShell中运行：

```powershell
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/fetch-gold-prices `
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**预期结果**：返回成功JSON

**验证**：在 Dashboard → Table Editor → gold_prices 中应该看到数据

### 测试2：发送测试邮件

```powershell
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-email-notification `
  -H "Authorization: Bearer YOUR_ANON_KEY" `
  -H "Content-Type: application/json" `
  -d '{\"emailType\": \"test\"}'
```

**预期结果**：
- API返回成功
- 收到邮件在：yqiubc@connect.ust.hk 和 y15205207533@163.com

### 测试3：检查定时任务

1. Dashboard → Database → Cron Jobs
2. 应该看到两个任务：
   - hourly-gold-price-fetch（每小时）
   - daily-gold-report（每天0点UTC = 8点北京时间）

---

## 🎉 完成！

您的金价监控系统现已24/7运行在云端！

### 系统会自动：

- ✅ 每小时抓取最新金价
- ✅ 存储历史数据到数据库
- ✅ 每天早上8点发送邮件报告
- ✅ 完全免费（永久）

### 下一步可以做什么？

1. **查看数据**
   - Dashboard → Table Editor → gold_prices
   - 查看实时金价数据

2. **查看邮件日志**
   - Dashboard → Table Editor → email_logs
   - 查看邮件发送历史

3. **调整定时任务**
   - 修改Cron表达式改变抓取频率
   - 修改邮件发送时间

4. **开发前端应用**
   - 参考 FREE_CLOUD_DEPLOYMENT.md 中的API文档
   - 使用Supabase客户端库连接数据库

---

## 📊 系统架构

```
┌─────────────────────────────────────────────┐
│         Supabase Cloud (免费)                │
│                                              │
│  ┌──────────────┐      ┌─────────────────┐ │
│  │ PostgreSQL   │◄─────┤ Edge Functions  │ │
│  │   数据库      │      │  - 抓取金价      │ │
│  │              │      │  - 发送邮件      │ │
│  └──────────────┘      └─────────────────┘ │
│         ▲                      ▲            │
│         │                      │            │
│  ┌──────┴──────┐      ┌────────┴─────────┐ │
│  │ Cron Jobs   │      │  Gmail SMTP      │ │
│  │ 定时任务     │      │  carlomayacsk@   │ │
│  └─────────────┘      │  gmail.com       │ │
│                       └──────────────────┘ │
└─────────────────────────────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │   您的邮箱     │
         │ yqiubc@...    │
         │ y15205...@... │
         └───────────────┘
```

---

## 🆘 遇到问题？

### 邮件没收到？
1. 检查垃圾邮件文件夹
2. 查看 email_logs 表的错误信息
3. 验证Gmail Secrets是否正确

### Edge Function部署失败？
1. 确认已运行 `npx supabase login`
2. 确认项目已正确链接
3. 查看详细错误信息

### 定时任务不执行？
1. 检查Cron表达式是否正确
2. 验证API keys和URLs
3. 查看Cron Jobs日志

### 需要更多帮助？
- **完整部署指南**：FREE_CLOUD_DEPLOYMENT.md
- **Gmail配置**：GMAIL_SETUP_GUIDE.md
- **Supabase文档**：https://supabase.com/docs

---

## 💡 常用命令

```powershell
# 查看项目信息
npx supabase status

# 查看函数日志
npx supabase functions serve send-email-notification

# 重新部署函数
npx supabase functions deploy send-email-notification

# 测试本地函数
npx supabase functions serve
```

---

**恭喜！您的金价监控系统已成功部署！** 🎊💰
