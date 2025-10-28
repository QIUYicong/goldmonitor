// 每日定时更新任务
// 自动获取金价数据并发送邮件通知

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    // 1. 调用金价获取函数
    const fetchResponse = await fetch(`${supabaseUrl}/functions/v1/fetch-gold-prices`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!fetchResponse.ok) {
      throw new Error('Failed to fetch gold prices');
    }

    // 2. 获取启用邮件推送的用户设置
    const settingsResponse = await fetch(
      `${supabaseUrl}/rest/v1/email_settings?is_active=eq.true`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      }
    );

    if (!settingsResponse.ok) {
      throw new Error('Failed to fetch email settings');
    }

    const settings = await settingsResponse.json();

    // 3. 检查当前时间是否在推送时间窗口内
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    // 4. 为每个用户发送邮件
    const emailPromises = settings
      .filter(setting => {
        // 检查推送频率
        if (setting.push_frequency === 'off') return false;
        if (setting.push_frequency === 'weekly' && now.getDay() !== 1) return false; // 仅周一推送

        // 检查时间窗口
        const [startHour, startMinute] = setting.push_time_start.split(':').map(Number);
        const [endHour, endMinute] = setting.push_time_end.split(':').map(Number);
        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;

        return currentTime >= startTime && currentTime <= endTime;
      })
      .map(setting => 
        fetch(`${supabaseUrl}/functions/v1/send-email-notification`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            emailType: 'daily_report',
            recipientEmail: setting.user_email
          })
        })
      );

    await Promise.all(emailPromises);

    return new Response(JSON.stringify({
      data: {
        message: 'Daily update completed',
        emailsSent: emailPromises.length,
        timestamp: now.toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Daily update error:', error);

    return new Response(JSON.stringify({
      error: {
        code: 'DAILY_UPDATE_FAILED',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
