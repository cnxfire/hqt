# 红蜻蜓 - Cloudflare Pages + KV 存储项目

一个基于 Vue.js 3 构建的现代化 Web 应用，集成 Cloudflare KV 键值存储，专为 Cloudflare Pages 部署优化。

## 🚀 特性

- ⚡ **极速加载** - 基于 Vite 构建工具，开发和生产环境都极其快速
- 🌍 **全球 CDN** - 利用 Cloudflare 的全球网络确保快速访问
- 🔒 **自动 HTTPS** - Cloudflare Pages 自动提供 SSL 证书
- 📱 **响应式设计** - 完美适配各种设备和屏幕尺寸
- 🎨 **现代 UI** - 美观的渐变色彩和流畅的动画效果
- 🗄️ **KV 存储** - 集成 Cloudflare Workers KV 实现数据持久化
- 📝 **待办事项** - 完整的 CRUD 操作演示 KV 存储功能

## 🛠️ 技术栈

- **前端框架**: Vue.js 3
- **构建工具**: Vite
- **部署平台**: Cloudflare Pages
- **后端服务**: Cloudflare Pages Functions
- **数据存储**: Cloudflare Workers KV
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

**注意**: 在本地开发环境中，KV 存储功能会自动降级到使用浏览器的 localStorage，所有待办事项功能都能正常工作。

### 本地测试 KV 功能（可选）

如果你想在本地环境中测试真实的 KV 存储，可以使用 Wrangler CLI：

1. 安装 Wrangler:
   ```bash
   npm install -g wrangler
   ```

2. 登录 Cloudflare:
   ```bash
   wrangler login
   ```

3. 创建本地 KV 命名空间:
   ```bash
   wrangler kv:namespace create "HONGQINGTING_KV" --preview
   ```

4. 使用 Wrangler 启动开发服务器:
   ```bash
   wrangler pages dev dist --kv HONGQINGTING_KV
   ```

### 构建生产版本

```bash
npm run build
```

构建后的文件将在 `dist` 目录中。

## 🗄️ KV 存储配置

### 创建 KV 命名空间

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** > **KV**
3. 点击「创建命名空间」
4. 命名空间名称建议：`hongqingting-kv`
5. 记录生成的命名空间 ID

### 配置 KV 绑定

#### 方法一：通过 Dashboard 配置

1. 在 Cloudflare Pages 项目中，进入 **设置** > **Functions**
2. 点击「KV 命名空间绑定」> **添加绑定**
3. 配置绑定：
   - **变量名**: `HONGQINGTING_KV`
   - **KV 命名空间**: 选择刚创建的命名空间
4. 保存并重新部署项目

#### 方法二：通过 wrangler.toml 配置

更新 `wrangler.toml` 文件中的命名空间 ID：

```toml
[[kv_namespaces]]
binding = "HONGQINGTING_KV"
preview_id = "your-preview-namespace-id"
id = "your-production-namespace-id"
```

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
8. **重要**: 部署完成后，按照上述步骤配置 KV 绑定

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
├── functions/             # Cloudflare Pages Functions
│   └── api/              # API 端点
│       ├── todos.js      # 待办事项 CRUD API
│       └── status.js     # KV 状态检查 API
├── public/               # 静态资源
│   └── vite.svg         # 项目图标
├── src/                  # 源代码
│   ├── App.vue          # 主组件（包含待办事项功能）
│   ├── main.js          # 入口文件
│   └── style.css        # 全局样式
├── index.html           # HTML 模板
├── package.json         # 项目配置
├── vite.config.js       # Vite 配置
├── wrangler.toml        # Cloudflare Workers 配置
└── README.md           # 项目说明
```

## 🔌 API 端点

项目提供以下 API 端点来演示 KV 存储功能：

### 待办事项 API (`/api/todos`)

- **GET** `/api/todos` - 获取所有待办事项
- **POST** `/api/todos` - 创建新的待办事项
  ```json
  {
    "text": "待办事项内容"
  }
  ```
- **PUT** `/api/todos` - 更新待办事项状态
  ```json
  {
    "id": "待办事项ID",
    "completed": true
  }
  ```
- **DELETE** `/api/todos?id=待办事项ID` - 删除待办事项

### 状态检查 API (`/api/status`)

- **GET** `/api/status` - 检查 KV 存储连接状态和数据统计
- **DELETE** `/api/status` - 清空所有 KV 数据（仅用于测试）

## 💡 功能演示

### 待办事项管理

1. **添加待办事项** - 在输入框中输入内容，点击「添加」或按回车键
2. **标记完成** - 点击复选框切换完成状态
3. **删除事项** - 点击「删除」按钮移除待办事项
4. **实时同步** - 所有操作都会实时保存到 Cloudflare KV 存储
5. **状态检查** - 点击「检查KV状态」查看存储连接状态和数据统计

### 开发环境支持

在本地开发环境中，如果 KV API 不可用，应用会自动降级到使用浏览器的 localStorage，确保功能正常运行。

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