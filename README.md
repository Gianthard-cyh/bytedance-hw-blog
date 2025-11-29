This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

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
