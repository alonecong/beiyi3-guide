# 北医三院就医指南

一个简洁的静态网站，分享北京大学第三医院（北医三院）的就医经验。

## 本地编辑

```bash
# 启动编辑服务器（需要 Node.js）
node dev-server.cjs

# 访问编辑页面
http://localhost:8084/admin.html

# 访问网站
http://localhost:8084/
```

## 部署

本项目是纯静态网站，可以部署到：
- Vercel
- Netlify
- GitHub Pages
- 任何静态网站托管服务

## 文件说明

- `index.html` - 主页面
- `data.js` - 内容数据
- `app.js` - 前端逻辑
- `style.css` - 样式
- `admin.html` / `admin.js` - 编辑界面（仅本地使用）
