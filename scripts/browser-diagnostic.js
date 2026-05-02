// 诊断脚本 - 在浏览器控制台运行
// 复制以下代码到浏览器 DevTools 的 Console 标签页，按 Enter 执行

console.log("🔍 短途行程云端同步诊断\n");

// 1. 检查 localStorage 配置
console.log("1️⃣ 检查 localStorage 配置:");
const supabaseUrl = localStorage.getItem("short-trip-supabase-url");
const supabaseKey = localStorage.getItem("short-trip-supabase-anon-key");
console.log(`   Supabase URL: ${supabaseUrl || "未设置（使用内置）"}`);
console.log(`   Supabase Key: ${supabaseKey ? "已设置" : "未设置（使用内置）"}\n`);

// 2. 检查本地存储的快照
console.log("2️⃣ 检查本地 localStorage 快照：");
const localSnapshot = localStorage.getItem("short-trip-cloud-snapshot:turkey-2026");
if (localSnapshot) {
  try {
    const parsed = JSON.parse(localSnapshot);
    console.log(`   找到快照，版本: ${parsed.version}`);
    console.log(`   cloudCleared: ${parsed.payload?.cloudCleared ?? false}`);
    console.log(`   更新者: ${parsed.updated_by}`);
    if (parsed.payload?.cloudCleared) {
      console.log("   ⚠️ 这个快照被标记为已清空！");
    }
  } catch (e) {
    console.log("   快照数据解析失败");
  }
} else {
  console.log("   在 localStorage 中找不到快照\n");
}

// 3. 查看应用的 React 状态（如果可能）
console.log("\n3️⃣ 应用状态检查：");
console.log("   在应用的「旅伴协作」面板中查看：");
console.log("   - 模式：应显示 Supabase 而非本地演示");
console.log("   - 行程 ID：应为 turkey-2026");
console.log("   - 云端：应显示版本号而非「尚未确认」\n");

// 4. 建议步骤
console.log("4️⃣ 如果仍显示「云端已清空」：");
console.log("   选项 A - 清理本地存储：");
console.log(`   localStorage.removeItem('short-trip-cloud-snapshot:turkey-2026')`);
console.log("   然后刷新页面\n");
console.log("   选项 B - 推送新版本覆盖：");
console.log("   在应用中编辑行程后点「推送全行程」\n");

// 5. 执行诊断网络请求
console.log("5️⃣ 测试云端连接...");
const SUPABASE_URL = "https://dzbvfsjeuqjjhxiyavyt.supabase.co";
const SUPABASE_KEY = "sb_publishable_13qf67r3pdiLyWF5R-7J-g_DuIu8dpr";

fetch(`${SUPABASE_URL}/rest/v1/trip_snapshots?id=eq.turkey-2026`, {
  headers: {
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "apikey": SUPABASE_KEY
  }
})
  .then(r => r.json())
  .then(data => {
    if (Array.isArray(data) && data.length > 0) {
      console.log("   ✅ 云端快照检索成功");
      console.log(`   版本: ${data[0].version}`);
      console.log(`   cloudCleared: ${data[0].payload?.cloudCleared ?? false}`);
    } else {
      console.log("   ℹ️ 云端未找到快照");
    }
  })
  .catch(err => console.log(`   ❌ 网络错误: ${err.message}`));
