export function createSupabaseAdapter(config = {}) {
  const url = config.url ?? window.__SUPABASE_URL__ ?? "";
  const anonKey = config.anonKey ?? window.__SUPABASE_ANON_KEY__ ?? "";

  return {
    mode: url && anonKey ? "supabase" : "local-demo",
    async syncTrip(trip) {
      if (!url || !anonKey) {
        return {
          ok: true,
          mode: "local-demo",
          message: `本地演示模式：${trip.members.length} 位成员，未连接 Supabase`
        };
      }

      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.49.4");
      const client = createClient(url, anonKey);
      const { error } = await client.from("trips").upsert({
        id: trip.id,
        name: trip.name,
        destination_template: trip.destinationTemplate,
        starts_on: trip.startDate,
        ends_on: trip.endDate,
        updated_at: new Date().toISOString()
      });

      if (error) {
        return { ok: false, mode: "supabase", message: `同步失败：${error.message}` };
      }
      return { ok: true, mode: "supabase", message: "已同步到 Supabase" };
    }
  };
}
