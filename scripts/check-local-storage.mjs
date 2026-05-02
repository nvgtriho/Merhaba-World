#!/usr/bin/env node

// 模拟浏览器 localStorage 的检查需要检查 app 中 local-demo 模式的快照存储
// localStorage key 为: "short-trip-cloud-snapshot:turkey-2026"

import fs from "fs";
import path from "path";

// 由于这是 Node 环境，localStorage 不存在
// 但我们可以提示用户通过浏览器开发工具检查

console.log("🔍 检查本地存储快照...\n");
console.log("由于这是 Node.js 环境，无法直接访问 localStorage。");
console.log("请按以下步骤在浏览器中检查：\n");

console.log("1️⃣ 打开应用网页");
console.log("2️⃣ 按 F12 打开开发工具 → Application → Local Storage");
console.log("3️⃣ 查找以下 key：\n");

const keys = [
  "short-trip-cloud-snapshot:turkey-2026",
  "short-trip-supabase-url",
  "short-trip-supabase-anon-key",
  "short-trip-sync-editor"
];

for (const key of keys) {
  console.log(`   • ${key}`);
}

console.log("\n4️⃣ 如果找到了 short-trip-cloud-snapshot:turkey-2026，复制其值");
console.log("5️⃣ 粘贴到下方来检查快照内容：");
console.log("\n" + "=".repeat(60));
console.log("快照 JSON 结构应该是：");
console.log(JSON.stringify({
  id: "turkey-2026",
  payload: {
    id: "turkey-2026",
    cloudCleared: true, // ← 如果这是 true，就是清空标记
    cleared_at: "ISO时间",
    cleared_by: "用户名"
  },
  version: 0,
  updated_at: "ISO时间",
  updated_by: "用户名"
}, null, 2));

console.log("=".repeat(60));
console.log("\n如果 cloudCleared 是 true，那就是问题所在了。");
console.log("解决方案：在应用中编辑行程后点「推送全行程」来覆盖它。\n");
