# 🚀 部署到Vercel - 完整指南

## 📋 前置准备

1. ✅ GitHub账号
2. ✅ Vercel账号（免费）
3. ✅ 代码已推送到GitHub

---

## 🎯 部署步骤（5分钟）

### 第一步：推送代码到GitHub

如果还没推送，在PowerShell中运行：

```powershell
cd E:\gitrepo\goldmonitor

# 初始化Git（如果还没初始化）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Add frontend and backend"

# 推送到GitHub（替换成您的仓库地址）
git remote add origin https://github.com/YOUR_USERNAME/goldmonitor.git
git branch -M main
git push -u origin main
```

---

### 第二步：登录Vercel

1. 访问: https://vercel.com
2. 点击 **"Sign Up"** 或 **"Log In"**
3. 选择 **"Continue with GitHub"**
4. 授权Vercel访问您的GitHub

---

### 第三步：导入项目

1. 在Vercel Dashboard，点击 **"Add New..."** → **"Project"**

2. 找到您的 **goldmonitor** 仓库，点击 **"Import"**

3. **重要配置**：

   **Root Directory（根目录）**：
   - 点击 "Edit" 按钮
   - 选择或输入: `frontend`
   - 这很重要！必须设置为frontend目录

   **Framework Preset**：
   - 自动检测为 "Next.js" ✅

   **Build Command**：
   - 保持默认: `npm run build`

   **Output Directory**：
   - 保持默认: `.next`

---

### 第四步：配置环境变量

在 **"Environment Variables"** 部分：

1. **添加变量1**：
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://nkclbvqlssilfxoybowx.supabase.co`
   - 点击 "Add"

2. **添加变量2**：
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rY2xidnFsc3NpbGZ4b3lib3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjgyODIsImV4cCI6MjA3NzE0NDI4Mn0.FRzUDxQ1aFAUjFH4s-aVz3l2ojbdDbGrtNGO2OWKaps`
   - 点击 "Add"

---

### 第五步：部署

1. 点击 **"Deploy"** 按钮

2. 等待部署（约2-3分钟）
   - 您会看到部署进度
   - 显示 "Building..." → "Deploying..." → "Ready!"

3. 部署成功！🎉
   - 会显示您的网站URL，类似: `https://goldmonitor-xxxxx.vercel.app`

---

## ✅ 验证部署

### 1. 访问网站

点击Vercel提供的URL，您应该看到：
- 💰 金价追踪系统标题
- 🌍 国际金价卡片
- 📈 价格走势图
- 💍 首饰金价表格

### 2. 测试功能

- **点击"发送测试邮件"按钮**
  - 应该显示"发送中..."
  - 然后弹出"发送成功"提示
  - 检查您的两个邮箱

- **点击"抓取最新金价"按钮**
  - 应该显示"抓取中..."
  - 页面数据自动刷新

---

## 🔧 常见问题

### Q1: 显示"加载中"不消失

**原因**: 环境变量未正确配置

**解决**:
1. Vercel Dashboard → 您的项目
2. Settings → Environment Variables
3. 检查两个变量是否正确添加
4. 重新部署: Deployments → 最新部署 → "Redeploy"

---

### Q2: "Root Directory"找不到frontend

**原因**: 代码结构不对

**解决**:
1. 确认GitHub仓库中有 `frontend` 文件夹
2. frontend文件夹中有 `package.json`
3. 重新Import项目

---

### Q3: 部署失败 - Build Error

**原因**: 依赖安装失败

**解决**:
1. 检查 `frontend/package.json` 是否正确
2. 查看Build日志的详细错误
3. 可能需要在本地先运行 `npm install` 测试

---

### Q4: 功能按钮不工作

**原因**: Supabase配置错误

**解决**:
1. 检查环境变量中的URL和Key是否正确
2. 检查Supabase Edge Functions是否部署
3. 打开浏览器Console查看错误信息

---

## 📱 后续更新

### 更新前端代码

```powershell
# 修改代码后
cd E:\gitrepo\goldmonitor
git add .
git commit -m "Update frontend"
git push

# Vercel会自动检测并重新部署！
```

### 查看部署历史

1. Vercel Dashboard → 您的项目
2. **Deployments** 标签
3. 查看所有部署记录和日志

---

## 🎨 自定义域名（可选）

### 添加自己的域名

1. Vercel Dashboard → 您的项目
2. **Settings** → **Domains**
3. 输入您的域名（如: gold.yourdomain.com）
4. 按照提示配置DNS
5. Vercel自动配置HTTPS证书

---

## 💰 Vercel免费额度

- ✅ 100GB带宽/月
- ✅ 无限部署次数
- ✅ 自动HTTPS
- ✅ 全球CDN
- ✅ 自定义域名
- ✅ Git自动部署

**您的使用量**: < 1GB/月

**结论**: 完全在免费额度内！✅

---

## 🎉 部署完成检查清单

- [ ] 代码已推送到GitHub
- [ ] Vercel项目已创建
- [ ] Root Directory设置为 `frontend`
- [ ] 两个环境变量已添加
- [ ] 部署成功（显示绿色✓）
- [ ] 网站可以正常访问
- [ ] 金价数据正常显示
- [ ] "发送测试邮件"按钮工作正常
- [ ] "抓取最新金价"按钮工作正常

---

## 📞 获取帮助

- **Vercel文档**: https://vercel.com/docs
- **Vercel Discord**: https://vercel.com/discord
- **构建日志**: Vercel Dashboard → Deployments → 点击部署 → Logs

---

**恭喜！您的前端已成功部署到云端！** 🎊💰

**您现在有了：**
- ✅ 完整的Web界面（24/7在线）
- ✅ 自动后端系统（每小时更新）
- ✅ 邮件通知（每天早上8点）
- ✅ 完全免费运行

**享受您的全功能金价追踪系统！** 🚀📊📧
