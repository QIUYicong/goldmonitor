import urllib.request
import json

# 测试Supabase API访问
url = "https://qelpltgfwazlmtlahfbf.supabase.co/rest/v1/gold_prices?order=timestamp.desc&limit=5"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlbHBsdGdmd2F6bG10bGFoZmJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjgyMDIsImV4cCI6MjA3NzE0NDIwMn0.OsEEqRYQ4HPq8E2hG2bJBPhlKAnfiXQIpbnSwV8eHZs"
}

print("测试1: 金价数据API")
try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        print(f"✅ 成功！获取到 {len(data)} 条金价记录")
        for item in data[:3]:
            print(f"  - {item['source_name']} {item.get('product_category', '')}: {item['price']} {item['price_unit']}")
except Exception as e:
    print(f"❌ 失败: {e}")

print("\n测试2: 数据源状态API")
try:
    url2 = "https://qelpltgfwazlmtlahfbf.supabase.co/rest/v1/data_sources"
    req2 = urllib.request.Request(url2, headers=headers)
    with urllib.request.urlopen(req2) as response:
        data2 = json.loads(response.read().decode())
        print(f"✅ 成功！获取到 {len(data2)} 个数据源")
        for source in data2[:3]:
            print(f"  - {source['source_name']}: {source['status']}")
except Exception as e:
    print(f"❌ 失败: {e}")

print("\n测试3: 邮件设置API")
try:
    url3 = "https://qelpltgfwazlmtlahfbf.supabase.co/rest/v1/email_settings"
    req3 = urllib.request.Request(url3, headers=headers)
    with urllib.request.urlopen(req3) as response:
        data3 = json.loads(response.read().decode())
        print(f"✅ 成功！获取到 {len(data3)} 条邮件设置")
        if data3:
            print(f"  - 邮箱: {data3[0]['user_email']}")
            print(f"  - 推送频率: {data3[0]['push_frequency']}")
except Exception as e:
    print(f"❌ 失败: {e}")
