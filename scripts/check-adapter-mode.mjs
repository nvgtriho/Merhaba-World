#!/usr/bin/env node
import { createSupabaseAdapter } from "../src/lib/supabaseAdapter.js";

console.log("🔍 检查应用使用的适配器模式...\n");

// 模拟浏览器环境（不设置任何存储的 URL/key，使用默认）
const adapter = createSupabaseAdapter({
  storage: {
    getItem: (key) => null, // 模拟空 localStorage
    setItem: (key, value) => {}
  }
});

console.log("1️⃣ 适配器配置信息：");
console.log(`   模式: ${adapter.mode}`);
console.log(`   表名: ${adapter.tableName}\n`);

if (adapter.mode === "supabase") {
  console.log("✅ 应用运行在 Supabase 模式");
  console.log("   会连接到云端 trip_snapshots 表\n");
  
  console.log("2️⃣ 检查内置配置：");
  console.log("   URL: https://dzbvfsjeuqjjhxiyavyt.supabase.co");
  console.log("   Key: sb_publishable_13qf67r3pdiLyWF5R-7J-g_DuIu8dpr\n");
  
  console.log("3️⃣ 如果应用显示「云端已清空」，但云端快照正常：");
  console.log("   原因可能是：");
  console.log("   • 首次加载时的异步拉取条件不满足");
  console.log("   • 或者初始 trip.id 与数据库中的 ID 不匹配");
  console.log("   • 或者拉取时 trip 对象已改变（React 闭包问题）\n");
  
} else {
  console.log("❌ 应用运行在本地演示模式");
  console.log("   只会使用 localStorage，不会连接云端\n");
  
  console.log("可能原因：");
  console.log("   URL 或 Key 为空或无效\n");
}

// 现在测试一次拉取
console.log("4️⃣ 尝试拉取 turkey-2026...");
adapter.pullTrip("turkey-2026")
  .then((result) => {
    if (result.ok) {
      console.log("   ✅ 拉取成功");
      console.log(`      版本: ${result.version}`);
      console.log(`      行程: ${result.trip.name}`);
    } else if (result.cleared) {
      console.log("   ⚠️ 云端标记为已清空");
    } else if (result.missing) {
      console.log("   ℹ️ 云端无快照");
    } else {
      console.log(`   ❌ 错误: ${result.message}`);
    }
  })
  .catch((err) => console.log(`   ❌ 异常: ${err.message}`));
