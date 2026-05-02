#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://dzbvfsjeuqjjhxiyavyt.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_13qf67r3pdiLyWF5R-7J-g_DuIu8dpr";

async function checkSupabaseStatus() {
  console.log("🔍 检查 Supabase 状态...\n");

  try {
    const client = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);

    // 1. 检查连接
    console.log("1️⃣ 测试数据库连接...");
    const { data: tableData, error: tableError } = await client
      .from("trip_snapshots")
      .select("id", { count: "exact" })
      .limit(0);

    if (tableError && tableError.code === "PGRST116") {
      console.log("❌ trip_snapshots 表不存在\n");
      console.log("需要执行步骤：");
      console.log("   1. 打开 https://supabase.com/dashboard");
      console.log("   2. 进入项目: dzbvfsjeuqjjhxiyavyt");
      console.log("   3. SQL Editor 页面粘贴并执行 supabase/schema.sql");
      return;
    }

    if (tableError) {
      console.log(`❌ 数据库错误: ${tableError.message}\n`);
      return;
    }

    console.log("✅ 数据库连接成功\n");

    // 2. 检查表中的数据
    console.log("2️⃣ 查询 trip_snapshots 表中的行程快照...");
    const { data: snapshots, error: queryError } = await client
      .from("trip_snapshots")
      .select("id, version, updated_at, updated_by")
      .order("updated_at", { ascending: false })
      .limit(10);

    if (queryError) {
      console.log(`❌ 查询错误: ${queryError.message}\n`);
      return;
    }

    if (!snapshots || snapshots.length === 0) {
      console.log("⚠️  trip_snapshots 表为空，还没有上传任何行程快照\n");
      console.log("下一步：");
      console.log("   1. 在应用中打开「旅伴协作」面板");
      console.log("   2. 编辑行程信息后点击「推送全行程」");
      return;
    }

    console.log(`✅ 找到 ${snapshots.length} 份行程快照\n`);
    console.log("最近的快照：");
    for (const snap of snapshots.slice(0, 5)) {
      const date = snap.updated_at ? new Date(snap.updated_at).toLocaleString("zh-CN") : "未知";
      console.log(`   - ID: ${snap.id}`);
      console.log(`     版本: ${snap.version}, 更新者: ${snap.updated_by}`);
      console.log(`     时间: ${date}\n`);
    }

    // 3. 测试写入权限
    console.log("3️⃣ 测试写入权限（临时快照）...");
    const testId = `test-${Date.now()}`;
    const { data: insertData, error: insertError } = await client
      .from("trip_snapshots")
      .insert({
        id: testId,
        payload: { test: true, timestamp: new Date().toISOString() },
        version: 0,
        updated_by: "系统测试"
      })
      .select();

    if (insertError) {
      console.log(`❌ 写入失败: ${insertError.message}\n`);
      console.log("这可能是权限问题，请检查 Row Level Security 策略。\n");
      return;
    }

    console.log("✅ 写入成功\n");

    // 4. 清理测试数据
    console.log("4️⃣ 清理测试数据...");
    const { error: deleteError } = await client
      .from("trip_snapshots")
      .delete()
      .eq("id", testId);

    if (deleteError) {
      console.log(`⚠️ 删除失败: ${deleteError.message}\n`);
    } else {
      console.log("✅ 测试数据已清理\n");
    }

    console.log("=".repeat(50));
    console.log("✅ Supabase 状态检查完成");
    console.log("=".repeat(50));
  } catch (err) {
    console.log(`❌ 致命错误: ${err.message}\n`);
    console.log("请检查网络连接或 Supabase 项目配置。");
  }
}

checkSupabaseStatus();
