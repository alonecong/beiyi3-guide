# 免费部署指南 - 国内可访问

## 推荐方案 1：Vercel（最简单）

### 优点
- ✅ 完全免费
- ✅ 国内访问速度可以（使用自定义域名更好）
- ✅ 自动 HTTPS
- ✅ 每次推送代码自动部署

### 部署步骤

1. **安装 Vercel CLI**
```bash
npm install -g vercel
```

2. **登录**
```bash
vercel login
```

3. **部署**
```bash
cd beiyi3-guide
vercel
```

按提示操作即可！部署后会得到一个 `.vercel.app` 域名。

---

## 推荐方案 2：Cloudflare Pages

### 优点
- ✅ 完全免费
- ✅ 国内访问较好
- ✅ 自动 HTTPS
- ✅ CDN 加速

### 部署步骤

1. 访问 https://pages.cloudflare.com
2. 连接你的 GitHub 仓库
3. 选择 `beiyi3-guide` 文件夹
4. 构建命令留空
5. 输出目录设为 `.`
6. 点击部署

---

## 方案 3：GitHub Pages（可能需要 VPN）

### 部署步骤

1. **创建仓库**
   - 在 GitHub 创建仓库（如 `beiyi3-guide`）

2. **推送代码**
```bash
cd beiyi3-guide
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/beiyi3-guide.git
git branch -M main
git push -u origin main
```

3. **启用 GitHub Pages**
   - 仓库设置 → Pages
   - Source 选 `main` 分支
   - 保存

访问地址：`https://你的用户名.github.io/beiyi3-guide/`

---

## 方案 4：Gitee Pages（国内最稳定）

### 优点
- ✅ 国内访问最快
- ✅ 不需要 VPN
- ⚠️ 免费版需要实名认证

### 部署步骤

1. 在 Gitee 创建仓库
2. 推送代码（类似 GitHub）
3. 服务 → Gitee Pages → 启动

---

## 重要提醒

### Admin 编辑功能
部署到公网后，**Admin 页面（admin.html）无法保存**，因为浏览器不能直接写文件。

**解决方案**：
1. 本地编辑：用 `node dev-server.cjs` 在本地编辑
2. 编辑完后重新部署
3. 或者：隐藏 admin.html（在服务器配置中阻止访问）

### 需要部署的文件
只需要这些文件：
```
beiyi3-guide/
├── index.html
├── data.js
├── app.js
├── style.css
└── admin.html (可选)
```

**不需要**：
- `dev-server.cjs`
- `node_modules/`
- `package.json`
