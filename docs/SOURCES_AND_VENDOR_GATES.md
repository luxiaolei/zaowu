# 外部依赖核查与来源

核查日期：2026-11-11。事实来源和产品设计假设分开。前面对话出现的供应商案例、费率、汇率或监管表述未经本次逐项核实，不作为上线许可或财务报价。

## 本次可核查来源

- DeepTutor 官方仓库：https://github.com/HKUDS/DeepTutor 。用于确认项目及官方入口；没有固定“最新版”断言，也未把其代码复制到本仓库。未来适配必须锁定具体版本与许可。
- GitHub Pages 官方创建说明：https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site 。Pages 托管静态内容，不能承担服务端 Python API；公开部署目录不能含敏感数据。

## 待重新核查的入口

- Vivix 文档：https://docs.vivix.ai/overview/introduction
- Session 管理：https://docs.vivix.ai/streaming-avatar/integrate/sessions
- 价格：https://www.vivix.ai/pricing
- 条款：https://www.vivix.ai/research/terms-of-service
- 隐私：https://www.vivix.ai/research/privacy-policy

本次浏览工具未能成功读取 Vivix Session 文档页面。前面对话读到的路径/字段只能作接入候选，不能被当作本次已实测 API；实际接入前验证当前文档和账户能力。

## 供应商准入清单

明确 API 对目标地区和终端年龄的授权；家长签约是否覆盖儿童端不是自行推定。确认数据处理地/分包方、训练用途/退出、保留/删除、计费粒度/闲置/失败/重试/并发、商业再分发、素材版权、输出审核与事件关闭语义。保留正式书面答复，敏感合同和凭据放私有系统，不进入公开 repo。

本仓库中的个性化策略、阈值、价格试验、性能目标均为设计假设或实现规则，不伪装成外部研究验证的结论。
