## 训练营课题 - 抖音激励前端方向 - 作业2报告
### 技术选型
- 前端：
  - 框架：React。个人认为在 React 和 Vue 的选择上其实没有太大的差别，二者作为比较成熟的前端框架都能很好的满足简单的博客项目需求。由于之前的项目都是基于Vue开发的，对Vue已经有了比较深的了解。在训练营中我第一次接触到React，也希望更多的锻炼自己的能力，所以选择了自己比较不熟悉的React作为前端框架，这样能够更加熟悉React的开发流程，也能够在之后的项目中更加灵活地使用React。
  - SSR：由于项目需要支持SSR，所以选择了Next.js这样比较成熟的库作为SSR框架。
  - 路由：Next.js App Router：Next.js 提供的路由系统比较简单，同时也支持动态路由，这在博客项目中是比较常用的。
  - 组件库：chakra-ui。之前在电商作业中选择了shadcn这样比较特殊的组件库，它的组件并非是预先打包好，而是生成在项目中。它的好处是可以根据项目非常自由地自定义组件，而传统的组件库要做到这一点必须要修改组件库的代码，缺点是组件放在项目中会有性能问题，因为每次渲染都要加载这些组件的代码。chakra-ui是之前了解过的比较成熟的组件库，所以希望能够尝试使用一下。
- 后端：
  - 框架：项目要求中要求使用Express.js，但是Next.js作为一个全栈框架，也可以进行后端API的开发，而且这也是非常主流的实现。这个项目目前的需求其实比较简单，并且是由我一个人维护，我认为现阶段没有必要分出Express.js的后端，因此直接使用Next.js作为后端框架。当然，为了项目后续的扩展和维护，我在项目中严格保证了所有的数据访问都是通过Next.js的API路由进行的（包括服务端组件），而不是在SSR代码中直接访问数据库。这样一来之后如果要换成Express.js后端，只需要把当前的后端部分迁移过去就可以了，本质上还是一个前后端分离的项目。
  - 数据库：PostgreSQL。项目中要求使用MySQL，但是我个人比较熟悉PostgreSQL，所以就选择了PostgreSQL作为数据库。项目中统一使用Kysely SQL构建器来进行数据库操作。Kysely作为一个抽象层屏蔽了数据库的具体实现，同时也提供了类型安全的查询接口，这在项目中是非常方便的。在之后如果要切换到MySQL，只需要对Kysely的数据库连接配置进行修改就可以了。

### 项目结构
- `app/`：Next.js 应用目录，包含路由、组件、API 路由等。
  - `components/`：可复用组件（如分页、筛选）。
  - `api/`：Next.js API 路由，处理数据库交互（列表查询、详情查询、新增文章、更新文章）。
  - `pages/`：Next.js 页面路由，包含详情页（`/posts/[id]`）与列表页（`/`）。
- `db/`：数据库相关代码，包含数据库连接配置、Kysely SQL 构建器、数据库迁移脚本等。
- `public/`：静态资源目录

### 核心特性
- 浏览文章（首屏 SSR）
  - 首次访问时服务端获取数据并渲染首屏，客户端激活交互
  - 支持从详情页返回列表、进入编辑
- 浏览与筛选文章列表
  - 标签多选筛选、关键词搜索
  - 分页浏览，页码/上一页/下一页，页面大小切换（10/20/50）
  - 列表项显示标签徽章
- 作者管理文章
  - 新建文章：提交标题/内容/标签，校验后写入并建立标签关联
  - 编辑文章：更新标题/内容/标签
  - 删除文章：删除文章（逻辑删除）

### SSR实现
- 详情页：详情页的SSR实现是比较简单的。因为没有交互组件，所以直接做成服务端组件即可。
- 列表页：列表页的SSR相对复杂。因为列表页需要支持分页、搜索、标签筛选等功能。思考了一段时间，在列表做成服务端组件的情况应下，分页、搜索等数据应该怎么传递的问题。我最后决定将分页、搜索、标签筛选作为客户端组件，因为这些组件需要与用户交互。当用户在这些组件中进行操作时，组件会更新URL参数，从而触发列表页的重新渲染，此时列表组件在服务端就可以通过URL参数来知道当前的分页和筛选。

### API 文档
- 列表查询：`GET /api/posts?page=1&pageSize=10&q=react&tags=SSR,Next`
  - 响应：`{ items: Post[], total: number, page: number, pageSize: number }`
- 详情查询：`GET /api/posts/:id`
- 新增文章：`POST /api/posts`
  - 请求：`{ title: string, content: string, tags?: string[] }`
  - 校验失败：`400 { error: 'invalid_payload' }`
  - 成功：`201 { success: true, id }`
- 更新文章：`PUT /api/posts/:id`
  - 请求：`{ title?: string, content?: string, tags?: string[], status?: number }`
  - 无改动：`400 { error: 'invalid_payload' }`
- 标签列表：`GET /api/tags`
  - 返回：`[{ name: string, count: number }]`（仅返回 `count > 0` 的标签）
  - 位置：`app/api/tags/route.ts:1`

### 数据库模型（字段说明）
- posts: 文章表
  - `id`：主键，自增
  - `title`：标题，检索与展示
  - `content`：正文内容
  - `author`：作者，允许空
  - `status`：发布状态（0草稿/1发布）
  - `views`：浏览计数，默认 0
  - `created_at`：创建时间
  - `updated_at`：更新时间
  - `deleted_at`：软删除时间，NULL 表示未删除
- tags: 标签表
  - `id`：主键
  - `name`：标签名，唯一
  - `created_at`：创建时间
- post_tags: 文章标签关联表
  - `post_id`：文章 ID，外键，级联删除
  - `tag_id`：标签 ID，外键，级联删除
- 索引与约束
  - `posts.title`、`posts.created_at`：为了支持全文检索与按创建时间分页，分别创建了索引。
  - 唯一约束：`tags.name`、`post_tags(post_id, tag_id)`：确保标签名唯一，同时也防止重复关联。
  - 外键：`post_tags.post_id → posts.id`、`post_tags.tag_id → tags.id`（ON DELETE CASCADE）：确保关联的文章与标签在删除时也会级联删除。
- 说明：运行环境为 PostgreSQL，表结构由 Kysely 自动初始化（`lib/init.ts`）。

### 用户体验
- 首屏：详情页服务端渲染，列表页支持快速分页与筛选交互。
- 主题：暗黑/亮色切换（`app/components/ui/color-mode.tsx`、`app/Header.tsx`）。
- 统一样式：容器边距统一、卡片圆角加大（`borderRadius="xl"`），视觉简约。

### 本地调试运行
- 安装依赖：`pnpm install`。
- 启动数据库（Docker）：`docker compose up -d`
- 配置环境：在项目根目录创建 `.env.local` 并填写：
  ```
  DATABASE_URL=postgresql://blog:blog@localhost:5432/blog
  DATABASE_SSL=false
  ```
- 首次访问自动建表：调用接口时触发 Kysely schema 初始化（`lib/init.ts:8`）。
- 启动：`pnpm run dev`（开发），`pnpm run build && pnpm run start`（生产）。
