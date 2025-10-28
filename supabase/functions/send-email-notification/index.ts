// 发送邮件通知的Edge Function
// 使用Gmail SMTP发送金价变动通知

import { createTransport } from 'npm:nodemailer@6.9.7';

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { emailType, recipientEmail } = await req.json();

    const gmailUser = Deno.env.get('GMAIL_USER');
    const gmailPassword = Deno.env.get('GMAIL_APP_PASSWORD');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!gmailUser || !gmailPassword) {
      throw new Error('Gmail credentials not configured');
    }

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    // 获取最新金价数据
    const pricesResponse = await fetch(
      `${supabaseUrl}/rest/v1/gold_prices?order=timestamp.desc&limit=20`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      }
    );

    if (!pricesResponse.ok) {
      throw new Error('Failed to fetch gold prices');
    }

    const prices = await pricesResponse.json();

    // 构建邮件内容
    const subject = emailType === 'test' 
      ? '金价追踪 - 测试邮件' 
      : '金价追踪 - 每日报告';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 20px; text-align: center; }
          .content { background: #f5f5f5; padding: 20px; }
          .price-section { background: #fff; margin: 15px 0; padding: 15px; border-left: 3px solid #DC143C; }
          .price-value { font-size: 24px; font-weight: bold; color: #000; }
          .price-change-up { color: #DC143C; }
          .price-change-down { color: #0057B7; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ccc; }
          th { background: #f5f5f5; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>金价追踪 Gold Price Tracker</h1>
            <p>更新时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</p>
          </div>
          
          <div class="content">
            <h2>国际金价</h2>
            ${prices
              .filter(p => p.source_type === 'international')
              .map(p => `
                <div class="price-section">
                  <strong>${p.source_name} ${p.product_category || ''}</strong><br>
                  <span class="price-value">${p.price} ${p.price_unit}</span><br>
                  <span class="${p.change_amount >= 0 ? 'price-change-up' : 'price-change-down'}">
                    ${p.change_amount >= 0 ? '+' : ''}${p.change_amount} (${p.change_percent}%)
                  </span>
                </div>
              `).join('')}

            <h2>首饰金价</h2>
            <table>
              <thead>
                <tr>
                  <th>品牌</th>
                  <th>品类</th>
                  <th>价格</th>
                  <th>涨跌</th>
                </tr>
              </thead>
              <tbody>
                ${prices
                  .filter(p => p.source_type === 'jewelry')
                  .map(p => `
                    <tr>
                      <td>${p.source_name}</td>
                      <td>${p.product_category}</td>
                      <td>${p.price} ${p.price_unit}</td>
                      <td class="${p.change_amount >= 0 ? 'price-change-up' : 'price-change-down'}">
                        ${p.change_amount >= 0 ? '+' : ''}${p.change_amount} (${p.change_percent}%)
                      </td>
                    </tr>
                  `).join('')}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>此邮件由金价追踪系统自动发送</p>
            <p>如需修改推送设置，请访问应用设置页面</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // 配置收件人列表
    const recipients = recipientEmail
      ? [recipientEmail]
      : ['yqiubc@connect.ust.hk', 'y15205207533@163.com'];

    // 创建Gmail SMTP传输器
    const transporter = createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // 使用STARTTLS
      auth: {
        user: gmailUser,
        pass: gmailPassword
      }
    });

    // 发送到所有收件人
    const emailResults = [];
    for (const recipient of recipients) {
      try {
        // 发送邮件
        const info = await transporter.sendMail({
          from: `"Gold Price Tracker" <${gmailUser}>`,
          to: recipient,
          subject: subject,
          html: htmlContent
        });

        console.log(`Email sent to ${recipient}: ${info.messageId}`);
        emailResults.push({ recipient, status: 'sent', messageId: info.messageId });

        // 记录邮件日志
        await fetch(`${supabaseUrl}/rest/v1/email_logs`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            recipient_email: recipient,
            email_type: emailType || 'daily_report',
            subject: subject,
            status: 'sent'
          })
        });
      } catch (error) {
        console.error(`Failed to send to ${recipient}:`, error);
        emailResults.push({ recipient, status: 'failed', error: error.message });

        // 记录失败日志
        await fetch(`${supabaseUrl}/rest/v1/email_logs`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            recipient_email: recipient,
            email_type: emailType || 'daily_report',
            subject: subject,
            status: 'failed',
            error_message: error.message
          })
        });
      }
    }

    return new Response(JSON.stringify({
      data: {
        message: 'Emails processed',
        results: emailResults,
        totalSent: emailResults.filter(r => r.status === 'sent').length,
        totalFailed: emailResults.filter(r => r.status === 'failed').length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Send email error:', error);

    // 记录失败日志
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      await fetch(`${supabaseUrl}/rest/v1/email_logs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient_email: 'carlomayacsk@gmail.com',
          email_type: 'error',
          subject: 'Email send failed',
          status: 'failed',
          error_message: error.message
        })
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(JSON.stringify({
      error: {
        code: 'EMAIL_SEND_FAILED',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
