# Merhaba-World

短期旅行 PWA 行动面板，面向 Android/iOS 浏览器安装使用。第一版包含行程时间线、Markdown 导入、权威天气多源互校验、地图跳转、土耳其语模板、收藏和旅伴协作入口。

## Run

当前环境没有 npm/pnpm，项目提供了无依赖静态开发服务器：

```powershell
& 'C:\Users\86159\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts/dev-server.mjs
```

有 npm 的环境可以安装依赖后使用 Vite：

```powershell
npm install
npm run dev:vite
```

## Test

```powershell
& 'C:\Users\86159\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests/*.test.mjs
```

## Supabase

`supabase/schema.sql` 包含第一版核心表、`trip_snapshots` 快照表和 RLS 草案。未配置 Supabase URL/anon key 时，前端保持本地演示模式，只会写入当前手机的 `localStorage`，两台手机不会互通。

要启用两个人互连同步：

1. 在 Supabase SQL Editor 执行 `supabase/schema.sql`。
2. 打开网页的“凭证与常用”页，在“旅伴协作”里填写同一个 Supabase URL 和 anon key。
3. 两台手机都保存配置并刷新。
4. 一台手机点“推送当前”，另一台手机点“拉取云端”。

这版是公开快照同步，适合公开旅行页的轻量协作；不要放护照号、支付信息等敏感内容。
