# Gmail SMTP 配置完整指南

## ✅ 已完成
- Edge Function代码已更新为使用Gmail SMTP
- 配置为同时发送到两个邮箱：
  - yqiubc@connect.ust.hk
  - y15205207533@163.com

## 📋 Supabase Secrets 配置步骤

### 方法1：通过Supabase Dashboard（推荐）

1. **登录Supabase Dashboard**
   - 访问：https://supabase.com/dashboard
   - 选择项目：goldmonitor

2. **配置Secrets**
   - 导航到：Project Settings → Edge Functions → Secrets
   - 添加以下两个Secret：

   ```
   GMAIL_USER = carlomayacsk@gmail.com
   GMAIL_APP_PASSWORD = ayowsyzxhkusfywd
   ```

   注意：密码中的空格已移除（ayow syzx hkus fywd → ayowsyzxhkusfywd）

3. **保存设置**
   - 点击"Add Secret"按钮保存
   - 重新部署Edge Function使配置生效

### 方法2：通过CLI配置

如果您有Supabase Access Token，可以运行：

```bash
# 设置Access Token
$env:SUPABASE_ACCESS_TOKEN="your_access_token_here"

# 设置Secrets
npx supabase secrets set GMAIL_USER=carlomayacsk@gmail.com
npx supabase secrets set GMAIL_APP_PASSWORD=ayowsyzxhkusfywd
```

## 🚀 部署更新的Edge Function

```bash
# 部署到Supabase
npx supabase functions deploy send-email-notification
```

## 🧪 测试邮件发送

配置完成后，您可以：

1. **通过应用UI测试**
   - 访问应用 → 设置 → 测试邮件
   - 点击"发送测试邮件"按钮

2. **通过Supabase Dashboard测试**
   - Edge Functions → send-email-notification → Invoke
   - 使用以下测试数据：
   ```json
   {
     "emailType": "test"
   }
   ```

## 📧 邮件发送规则

- **默认收件人**：yqiubc@connect.ust.hk 和 y15205207533@163.com
- **触发时机**：
  - 金价变动超过阈值
  - 每日定时报告
  - 手动测试邮件
- **发件人显示**：Gold Price Tracker <carlomayacsk@gmail.com>

## ⚠️ 重要提示

1. **Gmail应用专用密码安全性**
   - 密码已安全存储在Supabase Secrets中
   - 永远不要在代码中硬编码密码
   - 不要将密码提交到版本控制

2. **Gmail发送限制**
   - 免费账户：每天500封邮件
   - 当前配置每次发送2封（两个收件人）
   - 足够日常监控使用

3. **SMTP端口说明**
   - 使用端口587（STARTTLS）
   - 更安全且兼容性更好
   - 如果587端口被阻止，可改用465（SSL）

## 🔍 故障排查

### 邮件未收到？
1. 检查垃圾邮件/促销邮件文件夹
2. 验证Gmail应用密码是否正确
3. 查看Supabase Edge Function日志
4. 检查email_logs表中的发送记录

### SMTP连接失败？
1. 确认Gmail账号已开启两步验证
2. 确认应用专用密码正确
3. 检查网络是否允许SMTP连接
4. 查看Edge Function日志获取详细错误

### 多收件人问题？
- 当前配置为并发发送到两个邮箱
- 如需添加更多收件人，修改代码第136行的recipients数组

## 📞 获取Supabase Access Token

如果需要通过CLI配置，获取Access Token：

1. 访问：https://supabase.com/dashboard/account/tokens
2. 点击"Generate New Token"
3. 复制Token并设置环境变量：
   ```bash
   $env:SUPABASE_ACCESS_TOKEN="your_token"
   ```

## ✨ 下一步

配置完成后，您的金价监控系统将自动：
- 监控国际金价和首饰金价变动
- 当价格变动超过阈值时发送提醒邮件
- 每日定时发送金价报告
- 所有邮件同时发送到您的两个邮箱
