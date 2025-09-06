# 情侣应用（React + TypeScript + Vite）

本项目是一个基于 React + TypeScript + Vite 的前端应用，已适配移动端，内置 PWA 支持，可添加到主屏并离线使用。支持后续通过 Capacitor 打包为原生应用（Android/iOS）。

## 技术栈
- 前端框架：React 19 + React Router
- 语言与构建：TypeScript 5 + Vite 7（ESBuild + Rollup）
- 质量保障：ESLint 9 + React Hooks/Refresh 插件
- PWA 能力：Web App Manifest + Service Worker（生产启用）
- 混合应用：Capacitor 7（Android/iOS）
- 可视化：ECharts 6（按需使用）
- 工具库：dayjs（日期处理）

## 架构与亮点
- 目录职责清晰：`src/app`（入口与框架）、`src/pages`（业务页面，已按 core/tools/games/entertainment 分类）、`src/components`（复用组件）、`src/utils`（工具方法分层：api/date/feature/platform）
- 移动端体验优化：禁止 iOS 点按高亮、橡皮筋；Safe-area 适配；点击反馈与触摸优化
- PWA 支持：Manifest + 可选 SW，生产环境自动注册；开发环境自动注销避免缓存干扰
- 小游戏模块化：多款小游戏统一网格入口、统一视觉风格
- 可扩展配置：`src/app/config/api.ts` 支持运行时配置与 API Key 校验
- 类型安全：关键工具与数据结构具备类型定义，利于维护

## 主要功能
- 首页聚合与快捷导航（天气、纪念日置顶卡片、我们认识第N天动画）
- 个人中心（头像、昵称、登录逻辑、退出）
- 好友、动态/时刻（发布、点赞、评论、本地持久化，支持背景图）
- 纪念日、时间表、记事本、存钱罐等实用工具
- 娱乐功能：吃什么、电影推荐与播放器、转盘
- 小游戏集合：五子棋、象棋、消消乐、贪吃蛇、俄罗斯方块、拼图

> 可在 `src/pages` 下按功能查看各页面实现。

## 快速开始（开发环境）
```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器（默认 http://localhost:5173 ）
npm run dev

# 3. 同局域网手机访问（保证同 WiFi）
# 在浏览器打开： http://<电脑IP>:5173
```

### 常见开发启动问题
- 页面空白且控制台提示“Failed to load module script ... MIME type text/html”：
  - 必须通过 Vite 开发服务器访问（npm run dev）。不要用文件协议或打包后的 dist 直开。
  - 若曾注册过 Service Worker，可能缓存旧版 index.html。请在 DevTools → Application → Service Workers → Unregister，随后 Clear storage → Clear site data，再强制刷新（Ctrl+Shift+R）。
  - 确认 `index.html` 的入口脚本指向：`/src/app/main.tsx`。
- 端口占用：修改 `vite.config.ts` 端口或关闭占用进程。

## 构建与本地预览
```bash
# 生产构建
npm run build

# 本地预览（使用 Vite Preview 提供的静态服务）
npm run preview
```
构建产物输出至 `dist/`，适合部署到静态托管（Netlify/Vercel/GitHub Pages 等）。

## 部署
### Netlify（零配置）
- 方式一：Netlify Drop，直接将 `dist/` 拖拽到 `https://app.netlify.com/drop`
- 方式二：连接仓库，设置构建命令 `npm run build`，发布目录 `dist`

### Vercel
- 全局安装并登录：`npm i -g vercel && vercel login`
- 首次 `vercel` 选择 `dist` 为静态目录；生产发布 `vercel --prod`

### GitHub Pages
- 构建后把 `dist/` 推送到 `gh-pages` 分支
- 或使用 Actions 自动化，参考 `deploy-github.md`

## PWA 与 Service Worker
- 生产环境（HTTPS）会注册 `public/sw.js`，支持离线与缓存
- 开发环境会自动注销 SW，避免缓存旧资源导致的模块脚本 MIME 报错
- 如长期离线访问异常：清理 Application → Clear storage 与 Service Workers

## 移动端打包（Capacitor）
> 需要 Android Studio（或 Xcode 用于 iOS）
```bash
# 1) 安装 Capacitor 依赖（如尚未安装）
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

# 2) 构建 Web 资源
npm run build

# 3) 同步到原生工程
npx cap add android   # 首次添加
npx cap add ios       # 可选（macOS + Xcode）
npx cap sync

# 4) 打开原生工程
npx cap open android
npx cap open ios
```
Android 工程位于 `android/`，保留其结构与 Gradle 配置。

## 目录结构
当前（已分类后的关键部分）：
```text
src/
  app/                  # 应用框架与入口
    App.tsx
    main.tsx
    App.css
    index.css
    config/
      api.ts
  components/
    Icon.tsx
    TabBar.tsx
  pages/
    core/               # 核心页面
      Home.tsx
      Login.tsx
      Me.tsx
      Friend.tsx
      Moment.tsx
      Invite.tsx
    tools/              # 工具页面
      Anniversary.tsx
      Schedule.tsx
      Notes.tsx
      Bank.tsx
    entertainment/      # 娱乐功能
      Movie.tsx
      MoviePlayer.tsx
      Food.tsx
      Roulette.tsx
      Elf.tsx
    games/              # 游戏
      Games.tsx
      Gomoku.tsx
      Chess.tsx
      Match3.tsx
      Snake.tsx
      Tetris.tsx
      Puzzle.tsx
  utils/
    api/
      apiTest.ts
      debugApi.ts
    date/
      anniversary.ts
    feature/
      weather.ts
    platform/
      storage.ts
  assets/
  styles/
  types/
```

## 代码规范与性能建议
- 使用语义化命名与类型定义，避免使用 any；导出函数标注签名
- 组件拆分与复用：通用部分抽到 `components/`，减少重复
- 列表渲染提供稳定 key；必要时使用 `useMemo`/`useCallback` 优化
- 图片等静态资源尽量走 `src/assets/` 并合理体积压缩
- 路由懒加载（可选）：对体积较大的页面分包，提升首屏速度

## 常见问题（Troubleshooting）
1) 本地页面空白 + “Expected a JavaScript-or-Wasm module script ... text/html”
- 确保通过 `npm run dev` 的地址访问
- 清理 Service Worker 与站点缓存后强刷
- 确认 `index.html` 入口：`/src/app/main.tsx`

2) 手机无法访问本地开发地址
- 电脑与手机需在同一 WiFi；用 `http://<电脑IP>:5173`

3) PWA 未生效
- 仅生产或 `npm run preview`（HTTPS 推荐）测试

4) 构建报路径错误
- 检查页面与工具的导入是否匹配当前目录：
  - `../../components/...`
  - `../../utils/feature/...`、`../../utils/date/...`、`../../utils/platform/...`

---
若需要接入后端或新增页面/组件，请在 `docs/` 下补充相应的设计与约定文档。