# 验证记录

2026-11-11，v0.1.0 初始交付。

## 已执行

- Node.js v22.16.0 与授权开发设备 Node.js v24.4.0：30 项单元测试全部通过。
- `npm run check`：静态安全与文档存在检查通过。这不是安全认证。
- `npm run cost`：参数化计算器执行成功；全部价格、汇率、利用率为规划假设，不是实际供应商报价。
- Chromium 浏览器端到端验收：三个项目全部完成，覆盖家长引导、真实创作选择、首次错误/提示/重试、新情境验证、反思、保存、历史、插画导出、家长撤回证据、刷新续作和删除。
- 桌面视口 1365×1000；移动视口 390×844。无页面脚本错误、无非预期外部请求。移动视口通过布局检查，不等于真实手机验收。
- 已目视检查桌面首页、家长空间与移动项目页截图。
- GitHub Pages 公开站点 https://luxiaolei.github.io/zaowu/ 返回 HTTP 200，并使用同一端到端脚本再次通过三类项目、刷新续作与数据删除流程。
- GitHub Actions CI 与 Pages 部署工作流均成功。浏览器脚本显式等待路由切换，避免同步断言造成的时序误报。

## 复现

```bash
npm test
npm run check
npm start
# 在另一个终端中，安装 Playwright 到隔离环境后：
CHROMIUM_PATH=/path/to/chrome ZAOWU_TEST_URL=http://127.0.0.1:4173 \
  ZAOWU_TEST_OUTPUT=/tmp/zaowu-browser python tests/browser_smoke.py
```

浏览器报告包含 `projects_completed: 3`、`page_errors: []`、`unexpected_network_requests: []`。验收档案是合成数据，不是真实儿童档案。初始工作容器的浏览器导航受环境策略限制，因此没有修改或绕过该策略；浏览器验收在用户授权开发设备上的独立测试浏览器中完成。

## 未验证 / 不作承诺

- 未调用真实 LLM、DeepTutor、图像模型或 Vivix；没有宣称这些功能已接通。
- 未执行生产 SQL 迁移或生产家庭认证测试。
- 未完成真实 iOS/Android 设备测试、大陆网络可达性测试。
- 未进行真实儿童教学效果研究；当前规则不代表校准的知识掌握模型。
- 公开站点的发布状态以 GitHub Pages 的成功部署记录为准。
