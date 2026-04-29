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

`supabase/schema.sql` 包含第一版核心表和 RLS 草案。未配置 Supabase URL/anon key 时，前端保持本地演示模式；配置后可替换为真实同步。
