# 🎨 前端快速开始指南

## ✨ 前端已创建完成！

我已经为您创建了一个完整的金价追踪Web应用，包含以下功能：

### 📱 功能特性

- ✅ **实时金价显示** - 精美的卡片展示国际金价
- ✅ **价格走势图** - 可视化LBMA金价趋势
- ✅ **首饰金价表格** - 对比各大品牌金价
- ✅ **一键抓取按钮** - 手动触发金价更新
- ✅ **测试邮件按钮** - 立即发送测试邮件
- ✅ **响应式设计** - 手机、平板、电脑完美适配
- ✅ **现代UI设计** - 基于Tailwind CSS的精美界面

---

## 🚀 两种使用方式

### 方式1：本地测试（5分钟）

在PowerShell中运行：

```powershell
# 进入前端目录
cd E:\gitrepo\goldmonitor\frontend

# 安装依赖（首次需要，约2分钟）
npm install

# 创建环境变量文件
copy .env.local.example .env.local

# 启动开发服务器
npm run dev
```

然后访问: **http://localhost:3000**

您会看到完整的金价追踪界面！

---

### 方式2：部署到Vercel（免费托管）

#### 步骤1：推送到GitHub

```powershell
cd E:\gitrepo\goldmonitor

# 初始化Git
git init
git add .
git commit -m "Add gold price tracker"

# 创建GitHub仓库并推送（需要先在GitHub创建仓库）
git remote add origin https://github.com/YOUR_USERNAME/goldmonitor.git
git branch -M main
git push -u origin main
```

#### 步骤2：登录Vercel并导入

1. 访问: https://vercel.com
2. 使用GitHub登录
3. 点击 "Add New..." → "Project"
4. 选择 goldmonitor 仓库
5. **重要**: Root Directory 设置为 `frontend`
6. 添加环境变量：
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://nkclbvqlssilfxoybowx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rY2xidnFsc3NpbGZ4b3lib3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjgyODIsImV4cCI6MjA3NzE0NDI4Mn0.FRzUDxQ1aFAUjFH4s-aVz3l2ojbdDbGrtNGO2OWKaps
   ```
7. 点击 "Deploy"
8. 等待2-3分钟，部署完成！

**详细步骤**: 查看 `frontend/DEPLOY_TO_VERCEL.md`

---

## 📂 项目结构

```
goldmonitor/
├── frontend/                    # 前端应用（新建）
│   ├── app/
│   │   ├── globals.css         # 全局样式
│   │   ├── layout.tsx          # 根布局
│   │   └── page.tsx            # 主页（金价展示）
│   ├── components/
│   │   ├── PriceCard.tsx       # 金价卡片组件
│   │   ├── PriceChart.tsx      # 价格走势图组件
│   │   ├── RefreshButton.tsx   # 刷新按钮
│   │   └── TestEmailButton.tsx # 测试邮件按钮
│   ├── package.json            # 依赖配置
│   ├── .env.local.example      # 环境变量示例
│   ├── README.md               # 前端说明
│   └── DEPLOY_TO_VERCEL.md     # 详细部署指南
├── supabase/                    # 后端（已部署）
│   ├── functions/              # Edge Functions
│   └── migrations/             # 数据库
└── deploy-email-function.ps1   # 后端部署脚本
```

---

## 🎯 界面预览

访问前端后，您会看到：

### 顶部导航栏
- 💰 **金价追踪系统** 标题
- 📧 **发送测试邮件** 按钮（蓝色）
- 🔄 **抓取最新金价** 按钮（金色）
- ⏰ 最后更新时间

### 主内容区

**1. 国际金价卡片**
```
┌────────────────────┐  ┌────────────────────┐
│ LBMA          ↑   │  │ COMEX         ↑   │
│ Spot               │  │ Futures            │
│ 3957.40           │  │ 3965.31           │
│ USD/oz            │  │ USD/oz            │
│ +0.00 (+0.00%)    │  │ +7.91 (+0.20%)    │
└────────────────────┘  └────────────────────┘
```

**2. 价格走势图**
```
LBMA金价走势 (USD/oz)
┌────────────────────────────────┐
│     📈 折线图显示历史价格      │
│                                │
└────────────────────────────────┘
```

**3. 首饰金价表格**
```
┌─────────┬──────────┬──────────┬────────────┐
│ 品牌    │ 品类     │ 价格     │ 涨跌       │
├─────────┼──────────┼──────────┼────────────┤
│ 周大福  │ 足金饰品 │ 1309.99  │ +9.17 (+0.70%) │
│ 周生生  │ 足金饰品 │ 1309.99  │ +9.17 (+0.70%) │
└─────────┴──────────┴──────────┴────────────┘
```

---

## 🎮 功能演示

### 测试邮件按钮
1. 点击 "发送测试邮件"
2. 按钮显示 "发送中..."
3. 弹出提示 "✅ 测试邮件发送成功！"
4. 检查您的两个邮箱：
   - yqiubc@connect.ust.hk
   - y15205207533@163.com

### 抓取金价按钮
1. 点击 "抓取最新金价"
2. 按钮显示 "抓取中..."
3. 系统调用后端API获取最新金价
4. 页面自动刷新显示新数据

---

## 💡 技术栈

- **框架**: Next.js 14（最新版App Router）
- **语言**: TypeScript（类型安全）
- **样式**: Tailwind CSS（现代CSS框架）
- **图表**: Recharts（React图表库）
- **后端**: Supabase（已部署）
- **部署**: Vercel（免费）

---

## 🎨 界面特点

### 颜色主题
- **金色系**: 主题色为金色（#f59e0b）
- **涨跌颜色**:
  - 上涨：红色 ↑
  - 下跌：绿色 ↓

### 响应式设计
- **电脑端**: 4列卡片布局
- **平板端**: 2列卡片布局
- **手机端**: 1列卡片布局

### 动画效果
- 按钮悬停效果
- 卡片阴影过渡
- 加载动画
- 平滑滚动

---

## 🔧 自定义

### 修改主题颜色
编辑 `frontend/tailwind.config.ts` 第12行:
```typescript
colors: {
  gold: {
    600: '#f59e0b',  // 改成您喜欢的颜色
  }
}
```

### 修改邮件收件人
编辑后端函数（已配置好）:
- yqiubc@connect.ust.hk
- y15205207533@163.com

### 添加更多数据源
编辑 `supabase/functions/fetch-gold-prices/index.ts`

---

## 📊 完整系统架构

```
┌──────────────────────────────────────────────┐
│           Vercel（前端托管 - 免费）          │
│                                               │
│  💻 Web界面 → 显示金价、图表、按钮          │
│  📱 响应式设计 → 手机、平板、电脑适配        │
│                     ↓                         │
└──────────────────┬───────────────────────────┘
                   │ API调用
                   ↓
┌──────────────────────────────────────────────┐
│        Supabase（后端 + 数据库 - 免费）       │
│                                               │
│  🗄️  PostgreSQL数据库 → 存储金价历史        │
│  ⚙️  Edge Functions → 抓取金价、发送邮件    │
│  ⏰ Cron Jobs → 每小时抓取、每天发邮件       │
│                     ↓                         │
└──────────────────┬───────────────────────────┘
                   │
                   ↓
┌──────────────────────────────────────────────┐
│       Gmail SMTP（邮件服务 - 免费）          │
│                                               │
│  📧 发送到: yqiubc@connect.ust.hk           │
│  📧 发送到: y15205207533@163.com            │
└──────────────────────────────────────────────┘
```

---

## 💰 总成本

| 服务 | 功能 | 成本 |
|------|------|------|
| Vercel | 前端托管 | **$0/月** |
| Supabase | 后端+数据库 | **$0/月** |
| Gmail SMTP | 邮件发送 | **$0/月** |
| **总计** | | **$0/月** ✅ |

**完全免费运行！永久！**

---

## ✅ 下一步

### 立即开始

**选择A：本地测试**
```powershell
cd E:\gitrepo\goldmonitor\frontend
npm install
npm run dev
```
访问 http://localhost:3000

**选择B：部署到云端**
查看详细指南: `frontend/DEPLOY_TO_VERCEL.md`

---

## 🎉 您现在拥有

- ✅ 完整的前端Web应用（精美UI）
- ✅ 自动化后端系统（每小时更新）
- ✅ 邮件通知功能（每天早上8点）
- ✅ 完全免费运行（$0/月）
- ✅ 24/7云端托管

**恭喜您！这是一个完整的、生产级的、全栈金价监控系统！** 🎊💰📊

---

## 📞 需要帮助？

- **前端文档**: `frontend/README.md`
- **部署指南**: `frontend/DEPLOY_TO_VERCEL.md`
- **后端配置**: `GMAIL_SETUP_GUIDE.md`
- **免费部署**: `FREE_CLOUD_DEPLOYMENT.md`

**祝您使用愉快！** 🚀
