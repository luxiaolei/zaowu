# 数据模型与事实来源

## 当前试用

`zaowu:trial:v1` 存储 `{schemaVersion, profile, consent, evidence, projects, art, updatedAt}`。没有云端同步，没有真正多孩子管理，没有在主线程以外隐藏的画像索引。

profile：随机 id、年龄段、兴趣、过去常做的创作、当下支持偏好及来源。
project：类型、主题、配色、主角、阶段、选择记录、首次/重试/提示标记、完成时间。
evidence：结构化任务观察；最多 500 条，90 天到期不参与计算。
art：结构化场景/主体/配色与变体，不存用户上传照片。

技能摘要和推荐是读取时计算的派生数据，撤回后不继续使用旧摘要。`sanitizeState` 处理损坏/不匹配版本；存储失败向用户显示提醒。

## 联网版关系模型

建议 PostgreSQL，不先引入图/向量数据库。`server/schema.sql` 是未来数据库起点，不是已部署服务。

| 表 | 职责 | 关键隔离 |
|---|---|---|
| families | 家庭租户 | family_id |
| children | 受管孩子档案 | family_id + child_id |
| consents | 按用途/版本授权及撤销 | 家长认证主体、purpose、scope |
| projects | 作品状态及版本 | family/child，乐观锁 version |
| learning_events | 原始结构化操作证据 | family/child/project，幂等 event_key |
| skill_estimates | 可重算的技能摘要 | policy_version、evidence watermark |
| memory_claims | 有来源的记忆候选/确认 | 类型、来源、有效期、审批状态 |
| teaching_plans | 下次怎么教及理由 | context_version、evidence refs |
| assets / media_jobs | 私有素材与生成状态 | child/project 授权，审核前不可见 |
| usage_ledger | 预占、结算、退款/对账 | request_id 唯一，不信前端余额 |
| deletion_jobs | 原始与派生数据删除 | 范围、供应商状态、备份到期 |

## 不可违背的约束

1. 不能只按 project_id 查询而不校验 family/child。
2. 证据不因新模型规则被静默重写；保留原 rubricVersion，派生估计另存版本。
3. 只用真实操作写证据，LLM 自称“孩子理解了”不能写成功事件。
4. 向量条目必须关联原记录，删除与权限变更向下传播。
5. 家长声明、儿童自主选择、程序观察、LLM 假设分开，不能互相冒充。
6. 教学计划不是事实；旧计划引用被撤回证据时必须失效。
7. ID 和时间戳不能泄露真实姓名/生日；日志和 Issue 只使用合成样例。

## 生产演进

本地状态不能未经新授权自动上传。迁移应由家长显式触发，只接受 schema 校验后的数据，上传前显示范围与目的。生产中要添加真正认证、CSRF 防护、服务端授权与审计；SQL RLS 不是完整认证替代品。
