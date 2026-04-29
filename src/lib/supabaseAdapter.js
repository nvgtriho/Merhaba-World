const SNAPSHOT_TABLE = "trip_snapshots";
const LOCAL_PREFIX = "short-trip-cloud-snapshot:";
export const SUPABASE_URL_STORAGE_KEY = "short-trip-supabase-url";
export const SUPABASE_ANON_KEY_STORAGE_KEY = "short-trip-supabase-anon-key";

export function createTripSnapshot(trip, options = {}) {
  return {
    id: trip.id,
    payload: trip,
    version: options.version ?? 1,
    updated_at: options.updatedAt ?? new Date().toISOString(),
    updated_by: options.updatedBy ?? "旅伴"
  };
}

export function createSupabaseAdapter(config = {}) {
  const runtimeWindow = typeof window === "undefined" ? {} : window;
  const storage = config.storage ?? runtimeWindow.localStorage;
  const storedUrl = readStorageValue(storage, SUPABASE_URL_STORAGE_KEY);
  const storedAnonKey = readStorageValue(storage, SUPABASE_ANON_KEY_STORAGE_KEY);
  const url = config.url ?? runtimeWindow.__SUPABASE_URL__ ?? storedUrl ?? "";
  const anonKey = config.anonKey ?? runtimeWindow.__SUPABASE_ANON_KEY__ ?? storedAnonKey ?? "";
  const now = config.now ?? (() => new Date().toISOString());
  const mode = url && anonKey ? "supabase" : "local-demo";

  async function getClient() {
    if (config.clientFactory) return config.clientFactory({ url, anonKey });
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.49.4");
    return createClient(url, anonKey);
  }

  async function pullTrip(tripId) {
    if (!tripId) return { ok: false, mode, message: "缺少行程 ID" };
    if (mode === "local-demo") return pullLocalSnapshot(tripId, storage, mode);

    const client = await getClient();
    const { data, error } = await client
      .from(SNAPSHOT_TABLE)
      .select("*")
      .eq("id", tripId)
      .maybeSingle();

    if (error) return { ok: false, mode, message: `云端读取失败：${error.message}` };
    if (!data) return { ok: false, mode, missing: true, message: "云端还没有这份行程" };
    return normalizeSnapshotResult(data, mode, "已拉取云端版本");
  }

  async function pushTrip(trip, options = {}) {
    if (!trip?.id) return { ok: false, mode, message: "缺少行程 ID" };

    const remote = await pullTrip(trip.id);
    if (isStalePush(remote, options.baseVersion)) {
      return {
        ok: false,
        mode,
        conflict: true,
        remoteVersion: remote.version,
        message: `云端已有第 ${remote.version} 版，先拉取再决定是否覆盖`
      };
    }

    const nextVersion = (remote.version ?? 0) + 1;
    const row = createTripSnapshot(trip, {
      version: nextVersion,
      updatedAt: now(),
      updatedBy: options.updatedBy
    });

    if (mode === "local-demo") {
      writeLocalSnapshot(row, storage);
      return normalizeSnapshotResult(row, mode, `本地演示云端已保存第 ${row.version} 版`);
    }

    const client = await getClient();
    const { data, error } = await client
      .from(SNAPSHOT_TABLE)
      .upsert(row)
      .select()
      .maybeSingle();

    if (error) return { ok: false, mode, message: `云端同步失败：${error.message}` };
    return normalizeSnapshotResult(data ?? row, mode, `已推送云端第 ${row.version} 版`);
  }

  return {
    mode,
    tableName: SNAPSHOT_TABLE,
    pushTrip,
    pullTrip,
    syncTrip: pushTrip
  };
}

function readStorageValue(storage, key) {
  try {
    return storage?.getItem?.(key) ?? "";
  } catch {
    return "";
  }
}

function isStalePush(remote, baseVersion) {
  return remote.ok && Number.isFinite(baseVersion) && remote.version > baseVersion;
}

function pullLocalSnapshot(tripId, storage, mode) {
  const raw = storage?.getItem?.(`${LOCAL_PREFIX}${tripId}`);
  if (!raw) return { ok: false, mode, missing: true, message: "本地演示云端还没有这份行程" };
  try {
    return normalizeSnapshotResult(JSON.parse(raw), mode, "已拉取本地演示云端版本");
  } catch {
    return { ok: false, mode, message: "本地演示云端数据无法解析" };
  }
}

function writeLocalSnapshot(row, storage) {
  storage?.setItem?.(`${LOCAL_PREFIX}${row.id}`, JSON.stringify(row));
}

function normalizeSnapshotResult(row, mode, message) {
  return {
    ok: true,
    mode,
    message,
    trip: row.payload,
    version: row.version ?? 1,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by
  };
}
