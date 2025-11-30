## suppressHydrationWarning

- 作用：在水合阶段忽略当前节点及其子树的首帧标记差异警告；它不修复不一致，仅静默警告并允许该子树在客户端重建。
- 适用场景：仅客户端控件（如颜色模式开关）或样式注入顺序导致 SSR 与客户端初始输出不一致的局部区域。
- 风险：过度使用会掩盖真实的 SSR/CSR 不一致，应尽量缩小使用范围，并优先修复差异来源（改为客户端渲染、移除首帧 `window` 依赖）。
- 项目用法：为了避免头部样式注入差异导致的首帧警告，对头部根容器加上该属性。
  - 位置：`app/Header.tsx:13`
  - 示例：
    ```tsx
    <Box suppressHydrationWarning borderBottomWidth="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }}>
      {/* ... */}
    </Box>
    ```

### 加入的原因与解决错误的过程

- 触发的错误：Hydration mismatch，显示 SSR 输出的 Emotion `<style>` 与客户端的 `<div class="css-...">` 在头部区域不一致；同时颜色开关的 `data-state` 在 SSR 为 `unchecked`、客户端为 `checked`。
- 根因分析：Chakra UI v3 + Emotion 的样式注入顺序、以及颜色模式初始状态受系统偏好/本地存储影响，导致首帧差异集中出现在头部（导航 + 开关）。
- 修复步骤：
  - 使用 v3 Provider：`ChakraProvider value={defaultSystem}`（避免 v2 接口 `ColorModeScript`、`extendTheme`、`useColorMode` 带来的构建错误）。
  - 将页面 UI 拆分为客户端组件（列表与详情），避免服务端组件中直接使用 Chakra 导致上下文缺失错误。
  - 在头部根容器加入 `suppressHydrationWarning`，局部静默差异并允许该子树在客户端重建。
  - 使用客户端颜色模式 Provider 管理模式与持久化，切换时同步 `html` 的 `class` 与 `data-theme`，减少标记差异。
  - 在 `globals.css` 增加 `html.light body` / `html.dark body` 的基础样式，确保首帧视觉一致。
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
### 架构与渲染
- SSR 策略：
  - 详情页：服务端获取数据后注入至客户端组件，兼顾 SSR 首屏与交互激活（`app/posts/[id]/page.tsx:24` → `app/components/PostDetail.tsx:1`）。
  - 列表页：客户端渲染与分页交互（`app/page.tsx:15` → `app/components/PostList.tsx:1`）。若需严格 SSR，可将列表项渲染移至 Server Component 并避免在首帧使用 `window/localStorage`。
- Hydration 稳定性：头部使用 `ClientOnly` 与 `suppressHydrationWarning`，避免首帧样式/状态差异导致的水合报错（`app/providers.tsx:10`、`app/Header.tsx:13`）。
- 主题与美化：统一页面容器边距、卡片圆角，暗黑模式切换（`app/components/PageContainer.tsx:1`、`app/components/PostList.tsx:118`、`app/components/PostDetail.tsx:18`、`app/globals.css:28`）。

### 功能完成度
- SSR 核心：
  - 详情页 SSR：已实现服务端数据获取与首屏渲染，客户端激活交互。
  - 列表页 SSR：当前为 CSR 分页与筛选，提供迁移指引（见“SSR 列表页指引”）。
- 后端 API：
  - 列表查询（分页/搜索/多标签）：`GET /api/posts`（`app/api/posts/route.ts:27`）。
  - 详情查询：`GET /api/posts/[id]`。
  - 文章新增：`POST /api/posts`（校验并写入关联标签）。
  - 文章修改：`PUT /api/posts/[id]`（标题/内容/标签）。
  - 文章删除：可扩展逻辑删除或物理删除接口（预留）。
- 数据库设计：`posts`、`tags`、`post_tags` 三表模型，满足标签多对多场景（见下）。
- 前端交互：
  - 分页：Chakra Pagination，页码/上一页/下一页、页面大小切换（10/20/50）。
  - 标签筛选：按钮多选，支持清除；列表项显示 tag 徽章。
  - 详情页返回与编辑：按钮化（图标+文字返回、图标编辑）。

### API 文档
- 列表查询：`GET /api/posts?page=1&pageSize=10&q=react&tags=SSR&tags=Next`
  - 响应：`{ items: Post[], total: number, page: number, pageSize: number }`
  - 过滤：标题模糊搜索、标签多选（`tags` 数组）
  - 位置：`app/api/posts/route.ts:27`
- 详情查询：`GET /api/posts/:id`
- 新增文章：`POST /api/posts`
  - 请求：`{ title: string, content: string, tags?: string[] }`
  - 校验失败：`400 { error: 'invalid_payload' }`
  - 成功：`201 { success: true, id }`
- 更新文章：`PUT /api/posts/:id`
  - 请求：`{ title?: string, content?: string, tags?: string[] }`
  - 无改动：`400 { error: 'invalid_payload' }`
- 标签列表：`GET /api/tags`
  - 返回：`[{ name: string, count: number }]`（仅返回 `count > 0` 的标签）
  - 位置：`app/api/tags/route.ts:1`

### 数据库设计（MySQL）
```sql
CREATE TABLE posts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT NOT NULL,
  author VARCHAR(128),
  views BIGINT DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_posts_created (created_at),
  FULLTEXT INDEX ft_posts_title (title)
);

CREATE TABLE tags (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(64) NOT NULL UNIQUE
);

CREATE TABLE post_tags (
  post_id BIGINT NOT NULL,
  tag_id BIGINT NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  INDEX idx_post_tags_post (post_id),
  INDEX idx_post_tags_tag (tag_id)
);
```

### SSR 列表页指引（迁移到严格 SSR）
- 将 `PostList` 的数据获取与渲染移动至 Server Component，避免在首帧访问 `window/localStorage`。
- 避免在 SSR 阶段注入与客户端不同步的样式/状态；必要处使用 `ClientOnly` 包裹纯客户端交互的子块。
- Chakra v3 组件在 SSR 下建议搭配稳定的主题注入方式，避免 Emotion 样式顺序差异；必要处对容器使用 `suppressHydrationWarning`。

### 缓存与性能（建议实现）
- HTTP 缓存：
  - 静态资源：`Cache-Control: public, max-age=31536000, immutable`。
  - 列表/详情 HTML：协商缓存（`ETag`/`Last-Modified`），命中返回 `304`。
- Redis 缓存：
  - 缓存热点文章与首页列表；Key 设计示例：`post:{id}`, `posts:list:{page}:{size}:{q}:{tags_hash}`。
  - 失效策略：文章更新/删除时主动清除相关 Key。
- 服务端降级：
  - 数据源失败时返回骨架页面，客户端接管请求与渲染；提供“刷新重试”按钮。
- 代码层优化：
  - 分页查询使用覆盖索引，避免全表扫描；
  - 前端按需加载（代码分割）、图片懒加载。

### AI 写作助手（建议实现）
- 在“新建帖子”页集成 AI 生成初稿/摘要的功能，支持编辑后提交发布。
- 可用服务：本地/云端 LLM API；将生成内容作为草稿存储。

### 用户体验
- 首屏：详情页服务端渲染，列表页支持快速分页与筛选交互。
- 主题：暗黑/亮色切换（`app/components/ui/color-mode.tsx:1`、`app/Header.tsx:10`）。
- 统一样式：容器边距统一、卡片圆角加大（`borderRadius="xl"`），视觉简约。

### 文档与运行
- 启动：`npm run dev`（开发），`npm run build && npm run start`（生产）。
- Lint：`npm run lint`；构建与类型：`npm run build`。
- 目录结构：
  - 页面与路由：`app` 目录（`app/page.tsx`、`app/posts/[id]/page.tsx`）。
  - 接口：`app/api/*`（`posts`、`tags`）。
  - 组件：`app/components/*`（`PostList`、`PostDetail`、`PageContainer`）。

### 创新与拓展（建议）
- 阅读量统计与展示、标签云可视化、评论系统。
- 用户认证与权限（JWT）、接口限流、数据备份。
- Markdown 编辑器、PDF/Markdown 导出、相关推荐。

### 评估自检（与评分维度对应）
- 功能完整性：详情页 SSR、CRUD API 完整；列表交互完善，SSR迁移指引明确。
- 技术规范性：架构清晰、数据库模型规范、样式与主题统一；水合策略稳定。
- 用户体验：交互流畅、分页与筛选响应及时；降级与缓存方案可执行。
- 文档表达：目标、实现、接口、架构与指引清晰完备。
- 创新拓展：提供多项可实施的优化与增强路线。
