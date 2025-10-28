import React, { useEffect, useState } from 'react'
import { supabase, EmailSettings } from '../lib/supabase'

const EmailSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<EmailSettings>({
    id: 0,
    user_email: 'carlomayacsk@gmail.com',
    push_frequency: 'daily',
    price_threshold: 2.0,
    monitored_brands: [],
    push_time_start: '08:00',
    push_time_end: '22:00',
    is_active: true,
    created_at: '',
    updated_at: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const brands = [
    '周大福', '周生生', '老凤祥', '周大生', '中国黄金'
  ]

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .eq('user_email', 'carlomayacsk@gmail.com')
        .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('email_settings')
        .upsert({
          ...settings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_email'
        })

      if (error) throw error

      setMessage({ type: 'success', text: '设置保存成功' })
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: '保存失败，请重试' })
    } finally {
      setLoading(false)
    }
  }

  const handleTestEmail = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: {
          emailType: 'test',
          recipientEmail: settings.user_email
        }
      })

      if (error) throw error

      setMessage({ type: 'success', text: '测试邮件已发送，请检查您的收件箱' })
    } catch (error) {
      console.error('Error sending test email:', error)
      setMessage({ type: 'error', text: '发送失败，请检查邮箱地址' })
    } finally {
      setLoading(false)
    }
  }

  const toggleBrand = (brand: string) => {
    setSettings(prev => ({
      ...prev,
      monitored_brands: prev.monitored_brands.includes(brand)
        ? prev.monitored_brands.filter(b => b !== brand)
        : [...prev.monitored_brands, brand]
    }))
  }

  return (
    <div className="max-w-[800px] mx-auto px-lg py-2xl">
      <h1 className="text-headline font-bold mb-xl">邮件推送设置</h1>

      {message && (
        <div className={`mb-md p-md border ${
          message.type === 'success' 
            ? 'bg-neutral-100 border-success text-success' 
            : 'bg-neutral-100 border-primary text-primary'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-lg">
        {/* Email Address */}
        <div>
          <label className="block text-body font-medium mb-sm">用户邮箱</label>
          <input
            type="email"
            value={settings.user_email}
            disabled
            className="w-full px-sm py-sm border border-neutral-300 text-body bg-neutral-100"
            style={{ height: '48px' }}
          />
          <div className="text-small text-neutral-500 mt-xs">当前邮箱为只读</div>
        </div>

        {/* Push Frequency */}
        <div>
          <label className="block text-body font-medium mb-sm">推送频率</label>
          <div className="space-y-xs">
            {[
              { value: 'realtime', label: '实时推送' },
              { value: 'daily', label: '每日摘要' },
              { value: 'weekly', label: '每周摘要' },
              { value: 'off', label: '关闭' }
            ].map(option => (
              <label key={option.value} className="flex items-center gap-sm cursor-pointer">
                <input
                  type="radio"
                  name="frequency"
                  value={option.value}
                  checked={settings.push_frequency === option.value}
                  onChange={(e) => setSettings({ ...settings, push_frequency: e.target.value as any })}
                  className="w-sm h-sm"
                />
                <span className="text-body">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Threshold */}
        <div>
          <label className="block text-body font-medium mb-sm">价格阈值</label>
          <div className="flex items-center gap-sm">
            <input
              type="number"
              value={settings.price_threshold}
              onChange={(e) => setSettings({ ...settings, price_threshold: parseFloat(e.target.value) })}
              step="0.1"
              min="0"
              max="100"
              className="w-32 px-sm py-sm border border-neutral-300 text-body"
              style={{ height: '48px' }}
            />
            <span className="text-body">% 时推送</span>
          </div>
          <div className="text-small text-neutral-500 mt-xs">
            当金价涨跌超过此百分比时发送通知
          </div>
        </div>

        {/* Monitored Brands */}
        <div>
          <label className="block text-body font-medium mb-sm">监控品牌</label>
          <div className="flex flex-wrap gap-sm">
            {brands.map(brand => (
              <label key={brand} className="flex items-center gap-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.monitored_brands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="w-sm h-sm"
                />
                <span className="text-body">{brand}</span>
              </label>
            ))}
          </div>
          <div className="text-small text-neutral-500 mt-xs">
            仅推送选中品牌的价格变化
          </div>
        </div>

        {/* Push Time Window */}
        <div>
          <label className="block text-body font-medium mb-sm">推送时间窗口</label>
          <div className="flex items-center gap-sm">
            <input
              type="time"
              value={settings.push_time_start}
              onChange={(e) => setSettings({ ...settings, push_time_start: e.target.value })}
              className="px-sm py-sm border border-neutral-300 text-body"
              style={{ height: '48px' }}
            />
            <span className="text-body">至</span>
            <input
              type="time"
              value={settings.push_time_end}
              onChange={(e) => setSettings({ ...settings, push_time_end: e.target.value })}
              className="px-sm py-sm border border-neutral-300 text-body"
              style={{ height: '48px' }}
            />
          </div>
          <div className="text-small text-neutral-500 mt-xs">
            仅在此时间段内发送推送通知
          </div>
        </div>

        {/* Active Toggle */}
        <div>
          <label className="flex items-center gap-sm cursor-pointer">
            <input
              type="checkbox"
              checked={settings.is_active}
              onChange={(e) => setSettings({ ...settings, is_active: e.target.checked })}
              className="w-sm h-sm"
            />
            <span className="text-body font-medium">启用邮件推送</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-sm pt-md">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-md py-sm bg-primary text-white font-bold text-small uppercase tracking-wider hover:bg-primary-700 transition-colors duration-fast disabled:bg-neutral-400"
            style={{ height: '48px' }}
          >
            {loading ? '保存中...' : '保存设置'}
          </button>
          <button
            onClick={handleTestEmail}
            disabled={loading}
            className="px-md py-sm bg-white text-neutral-900 font-bold text-small uppercase tracking-wider border-medium border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors duration-fast disabled:border-neutral-400 disabled:text-neutral-400"
            style={{ height: '48px' }}
          >
            {loading ? '发送中...' : '发送测试邮件'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmailSettingsPage
