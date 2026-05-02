#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://dzbvfsjeuqjjhxiyavyt.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_13qf67r3pdiLyWF5R-7J-g_DuIu8dpr";

async function diagnoseVersioning() {
  console.log("🔍 诊断版本计算问题...\n");

  const client = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);

  console.log("1️⃣ 查询所有 turkey-2026 快照...");
  const { data: allSnapshots, error: allError } = await client
    .from("trip_snapshots")
    .select("id, version, updated_at, updated_by, payload->cloudCleared as cleared")
    .eq("id", "turkey-2026")
    .order("version", { ascending: false });

  if (allError) {
    console.log(`   ❌ 查询错误: ${allError.message}\n`);
    return;
  }

  if (!allSnapshots || allSnapshots.length === 0) {
    console.log("   ℹ️ 没有快照\n");
    return;
  }

  console.log(`   找到 ${allSnapshots.length} 个快照：\n`);
  for (const snap of allSnapshots) {
    const cleared = snap.cleared ? "✓ 已清空" : "✗ 正常";
    const date = new Date(snap.updated_at).toLocaleString("zh-CN");
    console.log(`   版本 ${snap.version} (${snap.updated_by}) ${date} [${cleared}]`);
  }

  // 2. 最高版本计算
  console.log("\n2️⃣ 推送时的版本计算...");
  const { data: versionQuery, error: versionError } = await client
    .from("trip_snapshots")
    .select("version")
    .eq("id", "turkey-2026")
    .order("version", { ascending: false })
    .limit(1);

  if (versionError) {
    console.log(`   ❌ 版本查询错误: ${versionError.message}\n`);
  } else {
    console.log("   select('version') 查询返回：");
    console.log(`   ${JSON.stringify(versionQuery)}\n`);
    
    if (versionQuery && versionQuery.length > 0) {
      const latest = versionQuery[0];
      const nextVersion = (latest?.version ?? 0) + 1;
      console.log(`   最高版本: ${latest?.version}`);
      console.log(`   下次推送版本: ${nextVersion}\n`);
    }
  }

  // 3. 拉取时的版本
  console.log("3️⃣ 拉取时的版本...");
  const { data: pullData, error: pullError } = await client
    .from("trip_snapshots")
    .select("*")
    .eq("id", "turkey-2026")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (pullError) {
    console.log(`   ❌ 拉取错误: ${pullError.message}\n`);
  } else if (!pullData) {
    console.log("   ❌ 没有找到快照\n");
  } else {
    console.log(`   拉取最高版本: ${pullData.version}`);
    console.log(`   cloudCleared: ${pullData.payload?.cloudCleared ?? false}\n`);
  }

  // 4. 版本逻辑分析
  console.log("4️⃣ 逻辑分析...");
  
  if (allSnapshots.length > 0) {
    const maxVersion = Math.max(...allSnapshots.map(s => s.version));
    console.log(`   最高版本（从所有快照）: ${maxVersion}`);
    
    if (versionQuery && versionQuery.length > 0) {
      const queryVersion = versionQuery[0]?.version;
      console.log(`   最高版本（从查询）: ${queryVersion}`);
      
      if (maxVersion !== queryVersion) {
        console.log(`   ⚠️ 不匹配！查询可能返回了错误的数据结构\n`);
      }
    }

    console.log(`   下次正确推送版本应该是: ${maxVersion + 1}`);
  }
}

diagnoseVersioning().catch(console.error);
