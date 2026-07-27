# SPACEAI — 官网 + 金本位星际银行 DApp

Vite + React 19 + TypeScript + wagmi/viem，部署于 BNB Smart Chain (56)。

## 结构

| 路径 | 内容 |
|---|---|
| `/` | 落地页：愿景 / 六大核心机制 / 经济模型 / 团队体系 / 路线图 |
| `/app` | 星际银行控制台：质押 · 我的仓位 · 团队 |

设计取向：深空近黑底 `#04030c` + 紫罗兰 `#7c5cff` / 青 `#22d3ee` / 品红 `#c026d3` 渐变，
玻璃拟态卡片、极淡描边、Manrope 字体、星空画布与滚动显现动效。配色取自品牌海报。

## 开发

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build -> dist/
```

## 接入已部署的银行合约

合约地址通过环境变量注入，**未填写时控制台自动显示「即将开放」**，不会对空地址发起调用：

```bash
# .env
VITE_BANK_ADDRESS=0x……
```

填好后重新 `npm run build` 并部署即可。ABI 位于 `src/lib/bankAbi.json`
（由 `spaceai-bank/out/SpaceAIBank.sol/SpaceAIBank.json` 提取，合约改动后需重新提取）。

## 多语言

中文 / English / 日本語 / 한국어，字典在 `src/lib/i18n.tsx`（扁平 key → 四语），
导航栏右侧切换。首次访问按 `navigator.language` 自动判断，选择后写入 localStorage。

> 排版注意：`*.title1` 系列紧邻渐变 `<span>` 渲染，**英文与韩文的值末尾带一个空格**，
> 中日文以全角标点结尾故不带。改这些文案时别把尾部空格删了。

## 不对外展示的内容

按运营要求，**费率档位表与团队/级差体系不在落地页展示**。
团队面板仍保留在控制台，但**不出现在标签栏**，仅通过深链访问：

```
/app?tab=team
```

这样推广人员照常拿得到推荐链接，普通访客看不到这套结构。
（推荐关系本身照常工作：访客打开 `/app?ref=0x…` 即记录，首次质押时链上绑定。）

## 控制台功能

- **质押**：选择 90/180/360 天档位，实时显示锁定的美金价值与满期账户价值；
  自动处理 ERC20 授权；支持填写推荐人（仅首次绑定）
- **我的仓位**：每个仓位显示锁定本金（USD）、可领利息、到期倒计时；
  支持**全额领取**与**指定金额部分领取**（剩余部分继续复利）；到期后一次性赎回本金
- **团队**：当前级别与级差、团队总业绩 / 小区（计级）/ 大区（烧伤）、
  一键复制专属推荐链接（`/app?ref=你的地址`，落地后写入 localStorage）

## 推荐链接

`https://<域名>/app?ref=0x你的地址` —— 访客打开后地址被记住，
首次质押时自动填入推荐人字段并在链上绑定。

## 部署

静态站，任意托管均可。仓库内 `vercel.json` 已配置 SPA 路由重写
（`/app` 直接访问不会 404）与静态资源长缓存。

## 已处理的坑

- **内嵌浏览器 / 预渲染环境 `visibilityState=hidden`**：此时 rAF 与 IntersectionObserver
  都不触发、页面也无法滚动，滚动显现动效会让整页停在 opacity 0（白屏）。
  `useReveal` 检测到该状态时直接跳过动画显示内容。
- **星空画布首帧尺寸为 0**：`clientWidth` 在首次 effect 时可能尚未布局完成，
  已回退到视口尺寸并在 120ms 后重新测量。

## 注意

- `public/brand/` 下为品牌方提供的 logo 与海报素材。
- 落地页展示的档位、费率、级差数字与合约默认参数一致；
  若链上调整了参数（`setRate` / `setFeeTiers` / `setLevels`），需同步更新
  `src/lib/contracts.ts` 与落地页表格。
