'use client'

import { createClient } from '@supabase/supabase-js'
import { useState } from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function TestEmailButton() {
  const [sending, setSending] = useState(false)

  const handleSendTestEmail = async () => {
    setSending(true)
    try {
      const response = await supabase.functions.invoke('send-email-notification', {
        body: { emailType: 'test' }
      })

      if (response.error) throw response.error

      alert('✅ 测试邮件发送成功！请检查您的邮箱（也查看垃圾邮件文件夹）')
    } catch (error) {
      console.error('Error sending test email:', error)
      alert('❌ 发送失败，请稍后重试')
    } finally {
      setSending(false)
    }
  }

  return (
    <button
      onClick={handleSendTestEmail}
      disabled={sending}
      className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
        sending
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
      }`}
    >
      {sending ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          发送中...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          发送测试邮件
        </span>
      )}
    </button>
  )
}
