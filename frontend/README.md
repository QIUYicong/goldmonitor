# 金价追踪系统 - 前端

实时监控国际金价和首饰金价的Web应用。

## ✨ 功能特性

- 📊 **实时金价显示** - 显示国际金价和首饰金价
- 📈 **价格走势图** - 可视化LBMA金价走势
- 🔄 **一键抓取** - 点击按钮手动抓取最新金价
- 📧 **测试邮件** - 点击按钮发送测试邮件
- 📱 **响应式设计** - 手机、平板、电脑完美适配
- 🎨 **现代UI** - 基于Tailwind CSS的精美界面

## 🚀 本地开发

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local`：

```bash
cp .env.local.example .env.local
```

文件内容（已配置好您的项目）：
```
NEXT_PUBLIC_SUPABASE_URL=https://nkclbvqlssilfxoybowx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问: http://localhost:3000

## 📦 部署到Vercel

### 方法1：通过Vercel Dashboard（推荐）

1. **登录Vercel**
   - 访问: https://vercel.com
   - 使用GitHub登录

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择您的GitHub仓库
   - **Root Directory** 设置为: `frontend`
   - 点击 "Import"

3. **配置环境变量**

   在 "Environment Variables" 中添加：
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://nkclbvqlssilfxoybowx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rY2xidnFsc3NpbGZ4b3lib3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjgyODIsImV4cCI6MjA3NzE0NDI4Mn0.FRzUDxQ1aFAUjFH4s-aVz3l2ojbdDbGrtNGO2OWKaps
   ```

4. **部署**
   - 点击 "Deploy"
   - 等待2-3分钟
   - 部署完成！🎉

### 方法2：通过命令行

```bash
# 安装Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
cd frontend
vercel

# 设置环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# 生产部署
vercel --prod
```

## 📱 功能说明

### 主页面
- 显示国际金价卡片（LBMA、COMEX、SGE、白银）
- 显示价格走势图
- 显示首饰金价表格

### 操作按钮
- **发送测试邮件** - 立即发送测试邮件到您的两个邮箱
- **抓取最新金价** - 手动触发金价抓取

### 自动更新
- 页面会显示最新的20条数据
- 点击抓取按钮后，页面自动刷新

## 🎨 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **图表**: Recharts
- **数据库**: Supabase
- **部署**: Vercel

## 📊 项目结构

```
frontend/
├── app/
│   ├── globals.css          # 全局样式
│   ├── layout.tsx           # 根布局
│   └── page.tsx             # 主页
├── components/
│   ├── PriceCard.tsx        # 金价卡片组件
│   ├── PriceChart.tsx       # 价格走势图组件
│   ├── RefreshButton.tsx    # 刷新按钮组件
│   └── TestEmailButton.tsx  # 测试邮件按钮组件
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🔧 自定义配置

### 修改颜色主题
编辑 `tailwind.config.ts` 中的 `colors.gold` 配置

### 修改图表样式
编辑 `components/PriceChart.tsx`

### 修改页面布局
编辑 `app/page.tsx`

## 💰 成本

- **Vercel免费版**:
  - 100GB带宽/月
  - 无限部署
  - 自动HTTPS
  - 自定义域名

**完全免费！** ✅

## 🆘 故障排查

### 页面显示"加载中"
- 检查Supabase API配置是否正确
- 查看浏览器Console错误信息

### 抓取按钮不工作
- 检查Edge Functions是否部署成功
- 查看Network标签的API响应

### 邮件发送失败
- 检查Gmail SMTP Secrets配置
- 查看Supabase Functions日志

## 📞 获取帮助

- **Vercel文档**: https://vercel.com/docs
- **Next.js文档**: https://nextjs.org/docs
- **Supabase文档**: https://supabase.com/docs

---

**享受您的金价追踪系统！** 💰📊
