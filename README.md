# 红蜻蜓 - Cloudflare Pages 项目

一个基于 Vue.js 3 构建的现代化 Web 应用，专为 Cloudflare Pages 部署优化。

## 🚀 特性

- ⚡ **极速加载** - 基于 Vite 构建工具，开发和生产环境都极其快速
- 🌍 **全球 CDN** - 利用 Cloudflare 的全球网络确保快速访问
- 🔒 **自动 HTTPS** - Cloudflare Pages 自动提供 SSL 证书
- 📱 **响应式设计** - 完美适配各种设备和屏幕尺寸
- 🎨 **现代 UI** - 美观的渐变色彩和流畅的动画效果

## 🛠️ 技术栈

- **前端框架**: Vue.js 3
- **构建工具**: Vite
- **部署平台**: Cloudflare Pages
- **样式**: 原生 CSS（响应式设计）

## 📦 安装和运行

### 本地开发

1. 克隆项目
```bash
git clone <your-repo-url>
cd hongqingting
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 在浏览器中打开 `http://localhost:3000`

### 构建生产版本

```bash
npm run build
```

构建后的文件将在 `dist` 目录中。

## 🌐 部署到 Cloudflare Pages

### 方法一：通过 GitHub 连接（推荐）

1. 将代码推送到 GitHub 仓库
2. 访问 [Cloudflare Pages](https://pages.cloudflare.com/)
3. 点击「创建项目」
4. 连接你的 GitHub 账户
5. 选择这个仓库
6. 配置构建设置：
   - **构建命令**: `npm run build`
   - **构建输出目录**: `dist`
   - **Root directory**: `/`（如果项目在根目录）
7. 点击「保存并部署」

### 方法二：直接上传

1. 运行 `npm run build` 构建项目
2. 在 Cloudflare Pages 中选择「直接上传」
3. 上传 `dist` 目录中的所有文件

### 构建配置

Cloudflare Pages 会自动检测到这是一个 Node.js 项目并安装依赖。确保你的构建设置如下：

```
构建命令: npm run build
构建输出目录: dist
Node.js 版本: 18 (推荐)
```

## 🔧 自定义域名

1. 在 Cloudflare Pages 项目设置中点击「自定义域名」
2. 添加你的域名
3. 按照提示更新 DNS 记录
4. 等待 SSL 证书自动配置完成

## 📁 项目结构

```
hongqingting/
├── public/                 # 静态资源
├── src/                   # 源代码
│   ├── App.vue           # 主组件
│   ├── main.js           # 入口文件
│   └── style.css         # 全局样式
├── index.html            # HTML 模板
├── package.json          # 项目配置
├── vite.config.js        # Vite 配置
└── README.md            # 项目说明
```

## 🎨 自定义样式

项目使用原生 CSS，主要特色：

- 渐变色背景
- 响应式网格布局
- 流畅的悬停动画
- 移动端优化

你可以在 `src/style.css` 和 `src/App.vue` 中修改样式。

## 🚀 性能优化

- **代码分割**: Vite 自动进行代码分割
- **资源压缩**: 生产构建自动压缩 CSS 和 JS
- **CDN 加速**: Cloudflare 全球 CDN 网络
- **缓存策略**: 静态资源长期缓存

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系

如有问题，请通过以下方式联系：

- 创建 GitHub Issue
- 发送邮件到 [your-email@example.com]

---

**享受使用 Cloudflare Pages 的快速部署体验！** 🎉