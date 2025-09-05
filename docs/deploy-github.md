# 部署到GitHub Pages

## 步骤：
1. 在GitHub上创建一个新仓库
2. 将代码推送到GitHub
3. 在仓库设置中启用GitHub Pages
4. 选择部署分支为 `gh-pages`

## 命令：
```bash
# 安装gh-pages
npm install --save-dev gh-pages

# 在package.json中添加部署脚本
"scripts": {
  "deploy": "gh-pages -d dist"
}

# 部署
npm run deploy
```

## 结果：
应用将在 `https://你的用户名.github.io/仓库名` 上运行
