# 情侣应用（React + TypeScript + Vite）

本项目是一个基于 React + TypeScript + Vite 的前端应用，已适配移动端，内置 PWA 支持，可添加到主屏并离线使用。支持后续通过 Capacitor 打包为原生应用（Android/iOS）。

## 功能概览

- 首页、个人中心、好友、时刻/动态
- 便签、纪念日、时间表（周视图、冲突校验、本地存储）
- 转盘随机、吃什么/电影、电影播放器等
- PWA：离线缓存、添加到主屏、主题色

## 本地开发

```bash
npm install
npm run dev
# 手机调试（同一局域网）：http://<电脑IP>:5173
```

## 构建

```bash
npm run build
npm run preview
```

## 移动端与 PWA

- 已启用 `public/manifest.json` 与 `public/sw.js`
- 在 `index.html` 中注册 Service Worker
- 手机浏览器访问后可“添加到主屏幕”，支持离线

## 云端部署（不要求同一 WiFi）

- Vercel：`vercel --prod`（需 `vercel login`）
- Netlify Drop：将 `dist/` 拖拽到 `https://app.netlify.com/drop`
- GitHub Pages：见 `deploy-github.md`

## 打包原生（Capacitor）

> 说明：iOS 需要在 macOS + Xcode 环境下构建。

```bash
# 初始化
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init "情侣应用" "com.couple.app"

# 构建 Web 资源
npm run build

# 添加平台并同步
npx cap add android
npx cap add ios
npx cap sync

# 打开原生工程
npx cap open android
npx cap open ios
```

## 目录结构

- `src/` 源码
  - `pages/` 页面：`Schedule.tsx`、`Anniversary.tsx`、`Notes.tsx` 等
  - `components/` 组件：`Icon.tsx`、`TabBar.tsx`
  - `utils/` 工具：`storage.ts`、`weather.ts`、`apiTest.ts`、`debugApi.ts`
  - `config/` 配置：`api.ts`
  - 根文件：`main.tsx`、`App.tsx`、`index.css`
- `public/` 静态资源：`manifest.json`、`sw.js`、图标、SVG
- `android/`（可选）Android 原生工程（由 Capacitor 生成）
- `vite.config.ts`、`tsconfig*.json`、`eslint.config.js`

## 常见问题

1) 手机打不开本地开发地址？需要与电脑在同一 WiFi，或部署到云端。
2) 构建报 `setInterval` 类型错误？已在 `MoviePlayer.tsx` 修复为 `NodeJS.Timeout | number`。
3) PWA 未生效？请通过 `npm run preview` 或部署到 HTTPS 域名测试。

## 许可证

仅用于学习与交流用途，若需商用请自查合规。