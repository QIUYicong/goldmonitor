# Gmail SMTP 邮件功能部署脚本
# 自动配置Gmail凭证并部署Edge Function

Write-Host "=== 金价监控 - Gmail SMTP 配置部署 ===" -ForegroundColor Green
Write-Host ""

# 检查是否已设置Supabase Access Token
if (-not $env:SUPABASE_ACCESS_TOKEN) {
    Write-Host "⚠️  未检测到 SUPABASE_ACCESS_TOKEN" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "请按以下步骤获取Access Token：" -ForegroundColor Cyan
    Write-Host "1. 访问：https://supabase.com/dashboard/account/tokens" -ForegroundColor White
    Write-Host "2. 点击 'Generate New Token'" -ForegroundColor White
    Write-Host "3. 复制Token" -ForegroundColor White
    Write-Host ""
    $token = Read-Host "请粘贴您的Supabase Access Token"

    if ($token) {
        $env:SUPABASE_ACCESS_TOKEN = $token
        Write-Host "✅ Access Token已设置" -ForegroundColor Green
    } else {
        Write-Host "❌ 未提供Token，退出部署" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📧 配置Gmail SMTP凭证..." -ForegroundColor Cyan

# 设置Gmail用户名（发件邮箱）
$gmailUser = "carlomayacsk@gmail.com"
Write-Host "Gmail发件邮箱: $gmailUser" -ForegroundColor White

# 设置Gmail应用密码（移除空格）
$gmailPassword = "ayowsyzxhkusfywd"
Write-Host "Gmail密码: ****" -ForegroundColor White

Write-Host ""
Write-Host "⬆️  上传Secrets到Supabase..." -ForegroundColor Cyan

# 上传Gmail用户名
try {
    npx supabase secrets set GMAIL_USER=$gmailUser
    Write-Host "✅ GMAIL_USER 设置成功" -ForegroundColor Green
} catch {
    Write-Host "❌ GMAIL_USER 设置失败: $_" -ForegroundColor Red
}

# 上传Gmail密码
try {
    npx supabase secrets set GMAIL_APP_PASSWORD=$gmailPassword
    Write-Host "✅ GMAIL_APP_PASSWORD 设置成功" -ForegroundColor Green
} catch {
    Write-Host "❌ GMAIL_APP_PASSWORD 设置失败: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "🚀 部署Edge Function..." -ForegroundColor Cyan

# 部署send-email-notification函数
try {
    npx supabase functions deploy send-email-notification
    Write-Host "✅ send-email-notification 部署成功" -ForegroundColor Green
} catch {
    Write-Host "❌ 部署失败: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== 部署完成 ===" -ForegroundColor Green
Write-Host ""
Write-Host "📬 邮件将发送到：" -ForegroundColor Cyan
Write-Host "  • yqiubc@connect.ust.hk" -ForegroundColor White
Write-Host "  • y15205207533@163.com" -ForegroundColor White
Write-Host ""
Write-Host "🧪 测试邮件发送：" -ForegroundColor Cyan
Write-Host "  访问应用 → 设置 → 发送测试邮件" -ForegroundColor White
Write-Host ""
Write-Host "📖 详细配置说明请查看：GMAIL_SETUP_GUIDE.md" -ForegroundColor Yellow
