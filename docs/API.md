# 接口与适配器契约

**状态：下一阶段设计，当前静态试用不提供以下 HTTP API。** 不要把此文档中的路径当成已上线服务。

## 应用 API（版本 v1）

| 方法与路径 | 作用 | 核心约束 |
|---|---|---|
| POST /v1/families/children | 创建受管档案 | 家长认证，最少信息 |
| PATCH /v1/children/{id}/profile | 修改偏好/支持 | 只能当前家庭；修改可审计 |
| GET /v1/children/{id}/learning-context | 取当前任务相关快照 | 最小化，带 snapshot_version |
| POST /v1/children/{id}/teaching-plans | 下一步教学计划 | 课程包/预算/授权校验 |
| POST /v1/projects | 创建局部种子作品 | 不一键生成最终成品 |
| POST /v1/projects/{id}/events | 记录操作证据 | Idempotency-Key + schema |
| POST /v1/projects/{id}/actions | 执行受限 patch | expected_version；失败不记完成 |
| POST /v1/evidence/{id}/retract | 纠正观察 | 重算摘要/失效计划/删派生索引 |
| POST /v1/projects/{id}/image-jobs | 生图 | 预占预算+输入审核，返回 job |
| GET /v1/jobs/{id} | 查询生成状态 | 尚未审核不得给图片 URL |
| POST /v1/jobs/{id}/cancel | 取消 | 迟到结果不覆盖作品 |
| POST /v1/avatar-sessions | 打开短时角色 | 年龄/地区/授权/预算联合准入 |
| POST /v1/avatar-sessions/{id}/close | 关闭并对账 | 等待终态，不能只断前端视频 |
| POST /v1/children/{id}/export | 导出私有档案 | 二次家长确认，短期下载凭证 |
| DELETE /v1/children/{id} | 删除全部相关数据 | 返回 deletion_job 与范围 |

## 教学适配器

```ts
interface TutorProvider {
  plan(context: TeachingContext, limits: BudgetLimits): Promise<TeachingPlan>;
  utterance(plan: TeachingPlan, turn: ChildTurn): Promise<TutorUtterance>;
}
```

计划由应用校验；语言输出不拥有状态修改权。LLM 选择 `request_hint`、`propose_patch`、`record_observation_candidate` 等受限工具，不能任意 SQL/HTTP/shell。证据事实仍由作品引擎/明确验证结果写入。

## 图像与角色适配器

```ts
interface ImageProvider {
  capabilities(): ProviderCapabilities;
  generate(brief: ImageBrief, requestId: string): Promise<ProviderJob>;
  cancel(jobId: string): Promise<void>;
}
interface AvatarProvider {
  create(input: ApprovedAvatarInput): Promise<AvatarSession>;
  speak(sessionId: string, approvedText: string): Promise<void>;
  close(sessionId: string): Promise<CloseResult>;
}
```

纯渲染模式也属于第三方处理并可能计费。`capabilities()` 的年龄/地区支持必须来自合同核查，不由模型推断。

## 错误与重试

401 AUTH_REQUIRED；403 CHILD_SCOPE_DENIED / CONSENT_REQUIRED / PROVIDER_INELIGIBLE；409 VERSION_CONFLICT / IDEMPOTENCY_CONFLICT；422 INVALID_PLAN / INVALID_PATCH；429 BUDGET_EXCEEDED / RATE_LIMITED；503 PROVIDER_UNAVAILABLE。

失败响应不反射密钥或儿童原文。重复同 idempotency key 返回同结果；同 key 不同 payload 返回冲突。超时未知状态先查询，不盲目重复创建付费会话/图片。预算不足返回可继续创作的本地降级方案。

## 合约文件

`contracts/types.ts`、`contracts/learner-evidence.schema.json`、`contracts/teaching-plan.schema.json`、`contracts/image-brief.schema.json`。当前 JS 校验不是通用 JSON Schema 执行器；联网版必须在边界真正执行 schema 校验与授权。
