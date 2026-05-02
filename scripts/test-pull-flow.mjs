#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";

async function testPullFlow() {
  console.log("🔍 诊断云端快照拉取问题...\n");

  const DEFAULT_SUPABASE_URL = "https://dzbvfsjeuqjjhxiyavyt.supabase.co";
  const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_13qf67r3pdiLyWF5R-7J-g_DuIu8dpr";

  console.log("1️⃣ 连接 Supabase...");
  const client = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);
  console.log("   ✅ 客户端已创建\n");

  console.log("2️⃣ 查询 turkey-2026 快照...");
  const { data, error } = await client
    .from("trip_snapshots")
    .select("*")
    .eq("id", "turkey-2026")
    .maybeSingle();

  if (error) {
    console.log(`   ❌ 查询错误: ${error.message}\n`);
    return;
  }

  if (!data) {
    console.log("   ❌ 数据库中没有该行程快照\n");
    return;
  }

  console.log("   ✅ 找到快照数据\n");

  // 3. 检查快照内容
  console.log("3️⃣ 分析快照内容...");
  console.log(`   ID: ${data.id}`);
  console.log(`   版本: ${data.version}`);
  console.log(`   更新者: ${data.updated_by}`);
  console.log(`   更新时间: ${data.updated_at}`);
  console.log(`   payload.cloudCleared: ${data.payload?.cloudCleared ?? "未定义"}\n`);

  // 4. 检查是否被标记为已清空
  console.log("4️⃣ 检查清空标记...");
  const isCleared = data?.payload?.cloudCleared === true;

  if (isCleared) {
    console.log("   ⚠️ 快照被标记为 cloudCleared=true");
    console.log("   这就是为什么应用显示「云端已清空」\n");
    console.log("   需要在应用中推送新版本来覆盖这个标记。\n");
  } else {
    console.log("   ✅ 快照正常，包含完整行程数据");
    console.log(`   行程名: ${data.payload?.name}`);
    console.log(`   开始日期: ${data.payload?.startDate}`);
    console.log(`   结束日期: ${data.payload?.endDate}`);
    console.log(`   行程项数: ${data.payload?.items?.length ?? 0}`);
    console.log(`   地点数: ${data.payload?.places?.length ?? 0}\n`);
  }

  // 5. 查看该行程所有快照版本
  console.log("5️⃣ 查看 turkey-2026 的所有快照版本...");
  const { data: allSnapshots, error: allError } = await client
    .from("trip_snapshots")
    .select("version, updated_at, updated_by, payload->cloudCleared as cleared")
    .eq("id", "turkey-2026")
    .order("version", { ascending: false });

  if (allError) {
    console.log(`   ❌ 查询错误: ${allError.message}\n`);
  } else if (!allSnapshots || allSnapshots.length === 0) {
    console.log("   ❌ 没有快照版本\n");
  } else {
    console.log(`   找到 ${allSnapshots.length} 个版本：`);
    for (const snap of allSnapshots) {
      const cleared = snap.cleared ? "✓ 已清空" : "✗ 正常";
      const date = new Date(snap.updated_at).toLocaleString("zh-CN");
      console.log(`   版本 ${snap.version}: ${snap.updated_by} · ${date} [${cleared}]`);
    }
    console.log();
  }

  // 6. 建议
  console.log("6️⃣ 建议流程...\n");
  if (isCleared) {
    console.log("   当前快照被标记为已清空。解决方案：");
    console.log("   1. 在应用中编辑行程信息");
    console.log("   2. 点击「推送全行程」上传新版本");
    console.log("   3. 此时会创建新快照覆盖清空标记");
    console.log("   4. 再点「拉取全行程」就能获取最新数据\n");
  } else {
    console.log("   当前快照正常。如果应用仍显示「云端已清空」：");
    console.log("   1. 尝试手动点击「拉取全行程」");
    console.log("   2. 检查浏览器控制台是否有网络错误");
    console.log("   3. 确认应用模式是 Supabase 而非本地演示\n");
  }
}

testPullFlow().catch(console.error);
