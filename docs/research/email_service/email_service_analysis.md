# 邮件推送服务技术方案调研与实施蓝图

## 1. 执行摘要

在现代产品增长与用户运营中,事务性邮件(如注册确认、密码重置、账单通知)与营销邮件(如活动推广、用户唤醒)是触达用户的两条主干道。要在工程上稳定、可扩展地把邮件“送对人、送得好、送得到”,我们需要将“发信能力”“模板与个性化”“调度与节流”“送达率与合规”“成本与扩展性”五个维度统筹设计。

本研究聚焦于以下范围:在 Supabase Edge Functions(边缘函数)中集成第三方邮件服务(Email Service Provider,ESP);对 Resend、SendGrid、Mailgun 的能力、定价、免费额度与适配场景进行对比;制定邮件模板设计与个性化推送的工程化方案;设计定时任务调度与频率控制;梳理送达率与反垃圾策略;完成成本分析与免费额度评估;最终给出在 Supabase 环境中落地 Edge Functions + Resend 的参考实现与运维策略。

关键结论与推荐如下:
- 首选集成路线:以 Supabase Edge Functions 为统一发信边缘层,集成 Resend 作为默认 ESP。其优点是开发者体验(Developer Experience,DX)良好、API 简洁、Webhook 完备、默认包含基础送达能力(域名认证、抑制列表、事件追踪),在中小规模场景下具备较高的性价比与实施速度[^1][^2]。
- 备选与迁移路径:当进入规模化运营、需要细粒度的子账户管理、强营销自动化或专用 IP 池策略时,可评估 SendGrid 或 Mailgun。SendGrid 在 Email API 与营销自动化上提供成熟套件与可视化能力;Mailgun 在事务性邮件与日志、入站路由、验证等方面具备工程友好特性[^3][^4]。
- 2024/2025 合规要点:确保发信域名完成 SPF、DKIM、DMARC 配置,并满足一键取消订阅、低投诉率、身份认证等要求;Gmail/Yahoo 对批量发件人提出更明确规则,建议建立持续的信誉监控与反馈回路[^5][^6][^7][^8]。
- 成本与免费额度:Resend 免费层每月 3,000 封(每日上限 100 封),Pro $20/月含 50,000 封;SendGrid Email API 免费试用 60 天(每日 100 封、最多 3,000 封),Essentials 起步 $19.95/月含 50,000 封;Mailgun 免费 $0(每日 100 封),Foundation $35/月含 50,000 封,Scale $90/月含 100,000 封。超量计费与专用 IP 附加费用需纳入长期预算[^2][^3][^4]。
- 落地里程碑:域名认证 → Edge Function 发信最小闭环 → 模板与个性化 → Webhook 事件采集与抑制列表 → 调度与节流 → 监控与告警 → 成本与容量规划。

本报告以官方文档与可信行业资源为依据,重点参考了 Supabase Edge Functions 官方示例与最佳实践,以及 Resend、SendGrid、Mailgun 的定价与功能说明[^1][^2][^3][^4]。

## 2. 研究方法与信息源说明

本研究以 2025-10-27 为时间基线,优先采用官方文档、定价页与权威行业报告,并以技术博客与教程作为补充。信息源分级如下:
- 官方文档与定价页:用于确认功能、接口、套餐与限制(例如 Supabase Edge Functions 指南、Resend/SendGrid/Mailgun 定价与功能说明)[^1][^2][^3][^4]。
- 行业报告与权威博客:用于把握宏观趋势与合规要求(例如 Radicati 邮件市场报告、Litmus 客户端份额、GrowLeads/DuoCircle/Email Industries 的认证指南、RedSift 的批量发件人规则解读)[^5][^6][^7][^8][^9][^10]。
- 技术实践文章与教程:用于落地细节与工程注意事项(例如 Supabase + Resend 的集成示例、Bejamas 的触发器实践、Pulsecron 的 Node 定时任务指南)[^11][^12][^13][^14]。

数据取舍与交叉验证原则:
- 定价与配额以官方页面为准,第三方汇总仅作辅助参考。
- 合规与认证规则以官方与权威渠道为准,技术博客用于实践提示。
- 模板与个性化以权威测试平台与行业最佳实践为依据,结合工程可行性进行取舍。

局限与信息缺口:
- Mailgun 官网定价页未成功提取,定价与配额采用第三方汇总(Apidog),建议上线前以官网为准进行复核。
- 各 ESP 的实际送达率、IP 预热时长与 SLA 缺少统一量化对比,建议以试点数据与监控结果校准。
- Supabase 官方 Edge Functions 文档页存在提取失败,实施时需回到官方文档核对细节(认证、限制、Secrets 管理)。
- Gmail/Yahoo 2024 批量发件人规则的官方链接未直接收集,采用权威第三方解读作为实施参考。
- 不同区域的邮件客户端份额数据未系统收集,若需地区化策略需追加 Litmus 或类似来源的数据。

## 3. Supabase Edge Functions 集成邮件服务

在 Supabase 中,Edge Functions 提供全球分布式的边缘执行能力,适合承载服务端逻辑、第三方 API 调用与密钥保护。将发信能力下沉到 Edge Functions,既能避免在前端暴露敏感凭据,又可统一实现节流、重试与事件收集,从而构建稳定、可观测的发信管道[^1]。

推荐架构:前端(触发)→ Edge Functions(鉴权、节流、调用 ESP API)→ 第三方 ESP(Resend/SendGrid/Mailgun)→ Webhook 事件(投递、打开、点击、退回、投诉)→ 数据库(事件与抑制列表)。

### 3.1 架构与职责边界

- 前端触发:前端仅发起业务事件或调用函数,不接触 ESP 密钥。典型触发包括注册成功、支付完成、定时任务触发的营销推送。
- Edge Functions:承担密钥保管、请求鉴权、节流与重试策略、调用 ESP API、记录审计日志与指标。函数应幂等,避免重复发送;对可恢复错误实施指数退避重试。
- ESP:负责实际投递、事件追踪与反馈(打开、点击、退回、投诉),并提供抑制列表与域名认证能力。
- 数据库:存储事件与用户偏好、抑制名单、黑/灰名单,供后续调度与策略优化使用。

### 3.2 环境与密钥管理

- Secrets 管理:将 ESP 的 API Key 等敏感变量置于 Edge Functions 的 Secrets 存储中,按环境(本地、生产)隔离管理,避免硬编码与泄露风险[^1]。
- 本地测试与生产一致性:在本地开发阶段,使用 .env 或函数提供的环境配置进行模拟;部署后通过生产 Secrets 注入,确保一致性与可追溯性[^1]。

### 3.3 参考实现(Resend)

最小闭环步骤(以 Supabase + Resend 为例):
1. 创建 Resend API Key,并验证发信域名;
2. 初始化 Supabase Edge Function,配置 RESEND_API_KEY;
3. 在函数中调用 Resend API,设置 from、to、subject、html 等参数;
4. 本地测试与生产部署,验证发信与事件回调;
5. 逐步扩展模板、个性化、Webhook 事件采集与抑制列表管理[^11][^12]。

示例(简化):
- from: onboarding@yourdomain.com
- to: user@example.com
- subject: Welcome
- html: 欢迎注册,点击验证邮箱

参考实现与官方示例可从 Supabase 文档与 Resend 的教程中获取,包含本地服务、生产部署与密钥管理的完整流程[^11][^12]。

### 3.4 常见错误与排查

- RLS(Row Level Security)策略:当 Edge Functions 访问数据库时,若策略仅允许 service_role 而前端以 anon 角色调用,会出现 “new row violates row-level security policy” 错误。正确做法是在策略中允许 anon 与 service_role 两类角色,确保边缘调用与前端调用均可落地[^1]。
- CORS:跨域请求需在函数响应中正确设置 CORS 头,避免浏览器拦截。
- 响应格式:函数返回结构需统一约定(如 data/error 包装),便于前端与监控消费。
- 域名认证:未完成 SPF/DKIM/DMARC 配置会导致投递失败或进入垃圾箱,需优先完成认证并验证记录生效。

## 4. 第三方邮件服务提供商(ESP)对比

在选择 ESP 时,应综合考量:API 能力与 DX、模板与个性化支持、Webhook 与事件分析、送达工具与专用 IP、免费额度与价格曲线、合规与支持能力。以下对 Resend、SendGrid、Mailgun 进行对比。

### 4.1 Resend 概览

Resend 以开发者体验为中心,提供简洁的 REST API 与 SMTP Relay,官方 SDK 与 React Email 支持,Webhook 事件与签名校验,内置打开/点击跟踪与抑制列表,支持多区域与自定义域名。免费层每月 3,000 封(每日 100 封),Pro $20/月含 50,000 封,Scale $90/月含 100,000 封,Enterprise 为定制;专用 IP 为付费附加项($30/月),并提供 IP 预热与监控能力[^2]。

### 4.2 SendGrid 概览

SendGrid 的 Email API 提供 SMTP 与 API 集成、动态模板、事件 Webhook、抑制管理、域名认证与专用 IP 能力,营销自动化(Marketing Campaigns)单独计费。Email API 免费试用 60 天(无需信用卡),每日 100 封、最多 3,000 封;Essentials 起步 $19.95/月(50,000 封),Pro 起步 $89.95/月(300,000 封),Premier 为定制(700,000 封以上)。支持专用 IP、子账户管理、单点登录与数据驻留(EU)等企业特性[^3]。

### 4.3 Mailgun 概览

Mailgun 提供强大的邮件 API 与 SMTP 中继、追踪与列表管理、入站路由、模板构建器、Webhooks 与分析。免费层每日 100 封;Foundation $35/月含 50,000 封;Scale $90/月含 100,000 封。超量费用从 $1.30/千封起(不同套餐有差异),并提供专用 IP 池、发送时间优化与 SAML SSO 等企业功能。日志与消息保留期随套餐变化(例如 Scale 提供 30 天日志保留)[^4]。

### 4.4 对比结论与选型建议

- 中小规模与快速集成:优先 Resend,凭借简洁 API、良好 DX 与合理免费额度,能迅速搭建稳定发信能力。
- 规模化与营销自动化:评估 SendGrid,尤其在动态模板、子账户管理、事件分析与专用 IP 策略上具备成熟能力;营销活动可使用 Marketing Campaigns 单独计费。
- 事务性邮件与工程细节:评估 Mailgun,其在入站路由、日志与验证方面工程友好,适合复杂事件流与后端集成。

为便于快速比较,以下表格汇总三家 ESP 的关键能力与定价结构(以公开资料为准)。

表 1:Resend vs SendGrid vs Mailgun 功能与定价对比(摘要)

| 维度 | Resend | SendGrid | Mailgun |
|---|---|---|---|
| API/SMTP | REST API 与 SMTP Relay;官方 SDK | SMTP 与 API;客户端库与交互式文档 | REST API 与 SMTP 中继;完整文档 |
| 模板/个性化 | React Email 支持;打开/点击跟踪 | 动态模板与内容测试;A/B 支持 | 模板构建器与 API;细分与追踪 |
| Webhook/事件 | Webhook 与签名;投递/打开/点击/退回/投诉 | 事件 Webhook;实时分析与抑制管理 | Webhooks;入站路由;分析报告 |
| 域名认证 | SPF/DKIM/DMARC 支持 | SPF/DKIM;专用 IP;反向 DNS | SPF/DKIM;专用 IP 池 |
| 免费额度 | 3,000 封/月;每日 100 封 | Email API 试用:60 天;每日 100 封;最多 3,000 封/月 | 每日 100 封 |
| 套餐与价格 | Pro $20/月(50,000 封);Scale $90/月(100,000 封);企业定制 | Essentials $19.95/月(50,000 封);Pro $89.95/月(300,000 封);Premier 定制 | Foundation $35/月(50,000 封);Scale $90/月(100,000 封) |
| 专用 IP | 付费附加项 $30/月;支持预热与监控 | 支持专用 IP 与 IP 池;自动化预热 | 支持专用 IP 池;发送时间优化 |
| 数据保留 | 免费 1 天;Pro 3 天;Scale 7 天;企业灵活 | 定价页未明确;提供分析与投递洞察 | 日志保留期随套餐变化(例如 Scale 30 天) |
| 合规与支持 | GDPR、SOC 2 Type II;票务与 Slack 支持 | GDPR;SOC 2 Type II;数据驻留 EU;多渠道支持 | 企业级支持;SAML SSO;验证 API |

说明:表中“价格与配额”以官方定价页与可信第三方汇总为依据,Mailgun 官网定价需上线前复核。专用 IP 与数据驻留等企业能力按套餐可用性与区域而定[^2][^3][^4]。

## 5. 邮件模板设计与个性化推送

邮件模板设计在工程上需兼顾“渲染一致性与客户端兼容性”“可访问性与可读性”“内容相关性与动态个性化”。2024 年行业数据显示,超过 50% 的邮件在移动设备上打开,响应式设计从可选变为必需;邮件客户端对现代 Web 标准支持有限,表格布局与内联 CSS 仍是主流实践[^15]。动态内容与个性化能显著提升参与度与转化率,行业案例显示个性化邮件在 ROI 与参与指标上优于通用内容[^16]。

### 5.1 设计规范与兼容性

- 布局与样式:采用基于表格的布局,避免依赖 div/grid 等不完全支持的特性;使用内联 CSS,确保跨客户端渲染一致;控制最小字体与对比度,保证可读性[^15]。
- 响应式策略:以 600px 为移动断点,使用百分比宽度与媒体查询;图片需压缩与响应式缩放,合理设置 alt 文本与占位,避免加载慢与可访问性问题[^15]。
- 客户端差异:主流客户端对 JavaScript、复杂 CSS 与外部字体支持不一,需在 Litmus/Email on Acid 等平台进行跨客户端测试与调优[^15]。

### 5.2 个性化与动态内容

- 数据源与触发:结合用户属性(姓名、位置、偏好)、行为数据(浏览、点击、购买)、上下文数据(时间、天气、设备)与第三方数据(人口统计或行业特定数据),构建动态内容生成逻辑[^16]。
- 场景与效果:典型场景包括基于浏览历史的商品推荐、放弃购物车的提醒、限时优惠的倒计时、基于地理位置的门店信息、生命周期阶段的差异化内容。行业实践表明,动态个性化有助于提升打开率、点击率与转化率[^16]。
- 工程实现:在模板引擎或 React Email 中定义组件与占位符;在 Edge Functions 中根据用户画像与事件数据渲染个性化内容;通过 Webhook 事件持续优化个性化策略。

## 6. 定时任务调度与频率控制

批量发送与定时推送需要稳定的调度机制与节流策略,以避免触发 ESP 的速率限制并维持域名信誉。Cron 表达式是主流调度方式;在 Node.js 生态中,可借助 Pulsecron 等库实现任务编排、并发控制与失败恢复[^17][^18]。

### 6.1 调度模式与实现

- Cron 表达式:用于定义每日/每周/每月的固定时刻或间隔执行任务,例如每日早 8 点发送营销邮件。Cron 表达式的语义可参考 CronTab.guru 的解释与示例[^17]。
- Node 定时任务:使用 Pulsecron 可在 Node.js 环境下配置并发数、处理间隔与重启恢复;结合 Nodemailer 或直接调用 ESP API 实现发信;支持事件监听与回调,便于审计与告警[^18]。

### 6.2 频率控制与节流策略

- 批量分片:将大批量发送按用户分群或地理区域分片,控制每批大小与发送速率,避免瞬时流量冲击。
- 退避与重试:对可恢复错误(如临时性 5xx、限流)实施指数退避重试;对不可恢复错误(如无效邮箱)直接记录并抑制。
- 速率限制:遵循 ESP 的速率与并发限制,结合队列与令牌桶算法实现平滑发送;对营销与事务性邮件分别设置不同的节流参数。
- 合规边界:满足 Gmail/Yahoo 对批量发件人的规则,包括身份认证、一键取消订阅与低投诉率等要求;建立投诉与退订的快速响应机制[^19][^20]。

## 7. 邮件送达率与反垃圾策略

送达率是邮件系统的生命线。2024 年起,Gmail/Yahoo 等邮箱提供商对批量发件人提出了更严格的认证与行为要求,行业报告也显示“远离垃圾箱”是发件人的首要挑战[^6][^19][^20]。提升送达率需要技术认证、内容与行为策略、基础设施与监控的协同。

### 7.1 认证配置(SPF/DKIM/DMARC)

- SPF(Sender Policy Framework):在 DNS 中声明授权发信服务器,防止域名被未授权服务器冒用。
- DKIM(DomainKeys Identified Mail):为邮件添加签名,确保内容在传输中不被篡改,提升可信度。
- DMARC(Domain-based Message Authentication, Reporting & Conformance):声明策略与报告机制,指导接收方如何处理未通过 SPF/DKIM 的邮件,并提供聚合与ruf报告通道。
- 记录与生效:完成 DNS 记录配置后,需验证记录生效与对齐(SPF/DKIM 的域对齐、DMARC 策略与 pct 逐步放行),持续监控报告并调整策略[^7][^8]。

### 7.2 信誉与内容优化

- 域名信誉:避免共享 IP 的不良邻居效应,必要时评估专用 IP;对新 IP 进行预热,逐步提升发送量并监控退回与投诉。
- 抑制列表:对硬退回、投诉与退订用户自动抑制,避免重复投递导致信誉受损。
- 一键取消订阅:在营销邮件中提供明显的一键取消订阅入口,符合合规要求并降低投诉率。
- 内容策略:避免垃圾词汇与过度图片;提升主题与正文相关性,优化首屏加载与可访问性。
- 反馈回路:加入 ISP 的反馈循环(Feedback Loop),及时获取投诉数据并调整策略。
- 监控与洞察:利用 ESP 的投递洞察与事件分析,持续跟踪打开/点击/退回/投诉,形成数据驱动的优化闭环[^2][^3][^4]。

表 2:认证配置清单与检查项

| 检查项 | 说明 | 验证方法 |
|---|---|---|
| SPF 记录 | 在 DNS 中声明授权发信服务器 | 使用 DNS 查询工具检查记录;发送测试邮件查看头信息 |
| DKIM 签名 | 为邮件添加签名并验证 | ESP 控制台生成选择器;检查邮件头中的 d= 与 s= 字段 |
| DMARC 策略 | 设定对齐与处置策略(p=none/quarantine/reject),启用聚合与ruf报告 | DNS 检查 _dmarc 记录;审阅 DMARC 报告并调整 pct 与策略 |
| 域对齐 | SPF/DKIM 的域与发信域对齐 | 检查 From 与 Return-Path 域一致性;审阅 DMARC 对齐结果 |
| 记录生效 | 验证 DNS 传播与生效时间 | 使用多地 DNS 查询与工具;等待传播完成并复测 |
| 报告审阅 | 定期审阅 DMARC 报告与 ESP 投递洞察 | 建立报告审阅流程;异常触发分析与整改 |

## 8. 成本分析与免费额度

成本不仅取决于套餐价格,还受超量计费、专用 IP 附加、验证 API 与日志保留等因素影响。以下基于官方与可信第三方数据,对免费额度与典型用量成本进行对比(以公开信息为准)。

表 3:免费额度与套餐价格对比(摘要)

| 服务商 | 免费额度 | 入门套餐 | 中量套餐 | 备注 |
|---|---|---|---|---|
| Resend | 3,000 封/月;每日 100 封 | Pro $20/月(50,000 封) | Scale $90/月(100,000 封) | 专用 IP $30/月;数据保留期随套餐变化(免费 1 天、Pro 3 天、Scale 7 天)[^2] |
| SendGrid | Email API 试用 60 天;每日 100 封;最多 3,000 封/月 | Essentials $19.95/月(50,000 封) | Pro $89.95/月(300,000 封) | 超量会产生按邮件计算的小额费用;Premier 定制(700,000 封以上);营销自动化单独计费[^3] |
| Mailgun | 每日 100 封 | Foundation $35/月(50,000 封) | Scale $90/月(100,000 封) | 超量费用从 $1.30/千封起(不同套餐不同);日志保留期随套餐变化(Scale 30 天);专用 IP 池与 SSO 等企业功能[^4] |

### 8.1 典型用量场景成本估算

- 3,000 封/月:Resend 免费层即可覆盖;SendGrid 试用期内免费(需在 60 天内评估升级);Mailgun 免费层每日 100 封,若集中在单日发送需拆分或升级。
- 50,000 封/月:Resend Pro($20/月)与 SendGrid Essentials($19.95/月)均可覆盖;Mailgun Foundation($35/月)亦可覆盖。专用 IP 若需单独购买(Resend $30/月;SendGrid/Mailgun 按套餐与用量评估)。
- 100,000 封/月:Resend Scale($90/月);SendGrid 需 Pro($89.95/月)或更高;Mailgun Scale($90/月)。超量与专用 IP 费用需根据实际发送曲线与信誉策略进行预算。

### 8.2 成本优化策略

- 模板与内容优化:提升打开与点击率,减少无效发送与投诉带来的抑制与信誉损害。
- 事件驱动发送:以行为触发替代定时批量,降低冗余投递。
- 分群与节流:按用户价值与活跃度分群,控制频率与批量大小,平滑发送曲线。
- 专用 IP 预热与池化:在需要时采用专用 IP 并进行预热,避免信誉骤降;根据发送规模与区域策略合理配置 IP 池。
- 日志与数据保留:结合套餐限制与合规要求,设置合适的数据保留期,避免不必要的数据存储成本。

## 9. 参考实施蓝图(Supabase + Resend)

在 Supabase 环境中,以 Edge Functions 为发信边缘层,集成 Resend 作为默认 ESP,构建端到端的发信与观测闭环。

实施步骤:
1. 域名认证:完成 SPF/DKIM/DMARC 记录与对齐,验证生效。
2. Edge Function 开发与 Secrets 配置:创建发信函数,配置 RESEND_API_KEY,实现幂等与重试。
3. 模板与个性化:基于 React Email 构建模板,集成用户属性与行为数据的占位符与条件渲染。
4. Webhook 事件采集与抑制列表:对投递、打开、点击、退回、投诉事件进行签名校验与入库,维护抑制列表。
5. 调度与节流:使用 Cron 或任务库实现批量与定时发送,按分片与速率控制执行。
6. 监控与告警:跟踪关键指标(退回率、投诉率、打开/点击率),设定阈值与告警策略。
7. 成本与容量规划:基于发送曲线与套餐价格,优化分群与频率,评估专用 IP 与日志保留策略[^11][^2][^1]。

表 4:实施里程碑与交付清单

| 里程碑 | 交付物 | 验收标准 |
|---|---|---|
| 域名认证 | SPF/DKIM/DMARC 记录与对齐报告 | DNS 记录生效;DMARC 报告对齐;测试邮件通过认证 |
| 函数上线 | Edge Function 发信最小闭环 | 本地与生产发信成功;幂等与重试策略验证 |
| 模板与个性化 | 模板组件库与个性化渲染 | 跨客户端渲染一致;个性化内容按数据正确生成 |
| 事件与抑制 | Webhook 签名校验与事件表;抑制列表 | 事件入库完整;抑制策略生效;无重复投递 |
| 调度与节流 | Cron/任务库配置与分片策略 | 批量发送稳定;速率与并发受控;失败重试正确 |
| 监控与告警 | 指标面板与告警规则 | 指标可观测;告警及时;异常有回溯 |
| 成本与容量 | 套餐与超量预算;IP 与保留策略 | 成本在预算内;容量满足峰值;策略可调整 |

## 10. 风险、合规与运维

- 合规要求:遵循 GDPR 与 CAN-SPAM 等隐私与反垃圾法规;提供一键取消订阅与投诉处理机制;保护用户数据与 API 密钥安全[^3][^2]。
- 运维与监控:建立日志保留策略与审计;对关键指标(退回率、投诉率、打开/点击)设定阈值与告警;出现异常时触发降频与内容优化。
- 切换与冗余:为关键业务配置多 ESP 备援与切换策略;在切换时保持模板与事件模型的兼容,避免观测断层。

## 11. 结论与后续工作

综合技术、成本与合规维度,建议以 Supabase Edge Functions + Resend 作为首选路线,在中小规模与快速迭代场景下具备最佳的性价比与实施效率。随着规模增长与营销自动化需求提升,可评估 SendGrid 或 Mailgun,利用其成熟的模板体系、子账户管理、专用 IP 与事件分析能力,进一步优化送达率与运营效率[^2][^3][^4]。

后续工作与试点计划:
- 扩展个性化策略:引入预测性推荐与实时内容,提升转化率。
- 强化事件驱动:以行为与生命周期事件为核心,减少无效发送。
- 优化节流算法:完善分片与退避策略,适应不同 ESP 的速率限制。
- 监控与优化:建立持续的指标审阅与内容优化机制,基于数据迭代策略。

上线前检查清单:
- 域名认证与对齐完成;测试邮件通过验证;
- Edge Functions 幂等、重试与 Secrets 管理到位;
- 模板与个性化渲染通过跨客户端测试;
- Webhook 事件与抑制列表正常入库与生效;
- 调度与节流策略按场景配置并验证;
- 监控与告警面板上线,阈值明确;
- 成本与容量预算确认,专用 IP 与日志保留策略设定。

---

## 参考文献

[^1]: Supabase Docs: Sending emails via Edge Functions. https://supabase.com/docs/guides/functions/examples/send-emails  
[^2]: Resend Pricing. https://resend.com/pricing  
[^3]: SendGrid Pricing. https://sendgrid.com/en-us/pricing  
[^4]: Apidog: Mailgun API Guide (Features & Pricing). https://apidog.com/blog/mailgun-api-guide/  
[^5]: Radicati: Email Market 2024-2028 (Executive Summary). https://www.radicati.com/wp/wp-content/uploads/2024/10/Email-Market-2024-2028-Executive-Summary.pdf  
[^6]: Mailgun: State of Email Deliverability 2024/2025 (PDF). https://www.mailgun.com/wp-content/uploads/pdf/SI-State_of_Email-2024_-_v3_1.pdf  
[^7]: GrowLeads: Email Authentication (SPF, DKIM, DMARC) Setup Guide. https://growleads.io/blog/email-authentication-spf-dkim-dmarc-setup-guide/  
[^8]: DuoCircle: How SPF, DKIM, and DMARC help in email authentication (2024). https://www.duocircle.com/dmarc/how-spf-dkim-and-dmarc-help-in-email-authentication-in-2024  
[^9]: Litmus: Email Client Market Share. https://www.litmus.com/email-client-market-share  
[^10]: RedSift: 2025 Guide to Microsoft, Google, Yahoo Bulk Email Sender Requirements. https://redsift.com/guides/bulk-email-sender-requirements  
[^11]: Resend: Send emails with Supabase Edge Functions (Mintlify). https://resend.com/mintlify.dev/docs/send-with-supabase-edge-functions  
[^12]: GitHub: resendlabs/resend-supabase-edge-functions-example. https://github.com/resendlabs/resend-supabase-edge-functions-example  
[^13]: Bejamas: Send emails with Supabase Edge Functions & Database Triggers. https://bejamas.com/hub/guides/send-emails-supabase-edge-functions-database-triggers  
[^14]: Pulsecron Blog: Send Email Using Cron Job in Node.js. https://www.pulsecron.com/blog/posts/send-email-using-cronjob  
[^15]: BassoonAI: Email Template Best Practices for 2024. https://bassoonai.com/blog/post-1/  
[^16]: Litmus: Top Dynamic Email Content Examples. https://www.litmus.com/blog/best-dynamic-email-content-examples  
[^17]: CronTab.guru: Cron Schedule Expression Editor. https://crontab.guru/  
[^18]: Mirasee: The 15 Best Email Service Providers for 2024 (Free + Paid). https://mirasee.com/blog/email-service-providers/  
[^19]: ReeferMail: Google Bulk Sending Requirements (2024). https://reefermail.com/resources/google-bulk-sending-requirements-2024/  
[^20]: Unspam: The Actual State of Email Deliverability. https://unspam.email/articles/state-email-deliverability/