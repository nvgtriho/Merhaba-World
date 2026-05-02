#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://dzbvfsjeuqjjhxiyavyt.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_13qf67r3pdiLyWF5R-7J-g_DuIu8dpr";

async function testPushLogic() {
  console.log("🔍 测试完整推送流程（直接调用 Supabase）...\n");

  const client = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);

  console.log(`1️⃣ 连接到 Supabase...\n`);

  // 模拟行程数据
  const testTrip = {
    id: "turkey-2026",
    name: "测试行程",
    items: [{ id: "item-1", title: "Test" }],
    places: [],
    members: [],
    destinationTemplate: "test",
    startDate: "2026-05-02",
    endDate: "2026-05-06",
    days: []
  };

  console.log("2️⃣ 查询最高版本...");
  const { data: versionQuery, error: versionError } = await client
    .from("trip_snapshots")
    .select("version")
    .eq("id", testTrip.id)
    .order("version", { ascending: false })
    .limit(1);

  console.log(`   查询结果: ${JSON.stringify(versionQuery)}`);
  console.log(`   查询错误: ${versionError ? versionError.message : "无"}\n`);

  if (versionQuery && Array.isArray(versionQuery) && versionQuery.length > 0) {
    const currentVersion = versionQuery[0].version;
    const nextVersion = currentVersion + 1;
    console.log(`   当前最高版本: ${currentVersion}`);
    console.log(`   下次推送版本: ${nextVersion}\n`);

    // 3. 查询最新快照（pullTrip 逻辑）
    console.log("3️⃣ 拉取最新快照...");
    const { data: pullData, error: pullError } = await client
      .from("trip_snapshots")
      .select("*")
      .eq("id", testTrip.id)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log(`   拉取版本: ${pullData?.version}`);
    console.log(`   拉取错误: ${pullError ? pullError.message : "无"}\n`);

    // 4. 验证逻辑
    console.log("4️⃣ 版本一致性检查...");
    console.log(`   最高版本查询得到: ${currentVersion}`);
    console.log(`   拉取查询得到: ${pullData?.version}`);
    console.log(`   是否一致: ${currentVersion === pullData?.version ? "是" : "否"}\n`);

    if (currentVersion !== pullData?.version) {
      console.log("❌ 版本不一致！可能导致版本计算错误");
    } else {
      console.log(`✅ 版本一致，下次推送应该创建版本 ${nextVersion}`);
    }
  } else {
    console.log("❌ 没有找到任何版本\n");
  }

}

testPushLogic().catch(console.error);
