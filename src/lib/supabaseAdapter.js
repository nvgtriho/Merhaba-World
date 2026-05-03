const SNAPSHOT_TABLE = "trip_snapshots";
const LOCAL_PREFIX = "short-trip-cloud-snapshot:";
export const DEFAULT_SUPABASE_URL = "https://dzbvfsjeuqjjhxiyavyt.supabase.co";
export const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_13qf67r3pdiLyWF5R-7J-g_DuIu8dpr";
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

export function createClearedTripSnapshot(tripId, options = {}) {
  return {
    id: tripId,
    payload: {
      id: tripId,
      cloudCleared: true,
      cleared_at: options.updatedAt ?? new Date().toISOString(),
      cleared_by: options.updatedBy ?? "旅伴"
    },
    version: 0,
    updated_at: options.updatedAt ?? new Date().toISOString(),
    updated_by: options.updatedBy ?? "旅伴"
  };
}

export function createSupabaseAdapter(config = {}) {
  const runtimeWindow = typeof window === "undefined" ? {} : window;
  const storage = config.storage ?? runtimeWindow.localStorage;
  const storedUrl = readStorageValue(storage, SUPABASE_URL_STORAGE_KEY);
  const storedAnonKey = readStorageValue(storage, SUPABASE_ANON_KEY_STORAGE_KEY);
  const url = config.url ?? runtimeWindow.__SUPABASE_URL__ ?? storedUrl ?? DEFAULT_SUPABASE_URL;
  const anonKey = config.anonKey ?? runtimeWindow.__SUPABASE_ANON_KEY__ ?? storedAnonKey ?? DEFAULT_SUPABASE_ANON_KEY;
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
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return { ok: false, mode, tripId, message: `云端读取失败：${error.message}` };
    if (!data) return { ok: false, mode, missing: true, tripId, message: "云端暂无可拉取版本" };
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

    // Query the highest version in all snapshots for this trip, ignoring cleared markers (version 0)
    let nextVersion = 1;
    if (mode === "supabase") {
      try {
        const client = await getClient();
        const { data: allVersions, error } = await client
          .from(SNAPSHOT_TABLE)
          .select("version")
          .eq("id", trip.id)
          .gt("version", 0)  // 忽略 cleared markers
          .order("version", { ascending: false })
          .limit(1);
        
        if (!error && allVersions && allVersions.length > 0) {
          nextVersion = allVersions[0].version + 1;
        }
      } catch {
        // Fallback to computed version based on remote pull result
        nextVersion = (remote.version ?? 0) + 1;
      }
    } else {
      // Local demo mode - use pulled version
      nextVersion = (remote.version ?? 0) + 1;
    }

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
      .upsert(row);

    if (error) return { ok: false, mode, message: `云端同步失败：${error.message}` };
    return normalizeSnapshotResult(data ?? row, mode, `已推送云端第 ${row.version} 版`);
  }

  async function clearTrip(tripId, options = {}) {
    if (!tripId) return { ok: false, mode, message: "缺少行程 ID" };
    const row = createClearedTripSnapshot(tripId, {
      updatedAt: now(),
      updatedBy: options.updatedBy
    });

    if (mode === "local-demo") {
      storage?.removeItem?.(`${LOCAL_PREFIX}${tripId}`);
      return { ok: true, mode, missing: true, cleared: true, tripId, message: "本地演示云端已清空" };
    }

    const client = await getClient();
    const { error } = await client
      .from(SNAPSHOT_TABLE)
      .upsert(row);

    if (error) return { ok: false, mode, tripId, message: `云端清空失败：${error.message}` };
    return { ok: true, mode, missing: true, cleared: true, tripId, message: "云端已清空" };
  }

  return {
    mode,
    tableName: SNAPSHOT_TABLE,
    pushTrip,
    pullTrip,
    clearTrip,
    syncTrip: pushTrip
  };
}

function readStorageValue(storage, key) {
  try {
    const value = storage?.getItem?.(key);
    return value?.trim() || undefined;
  } catch {
    return undefined;
  }
}

function isStalePush(remote, baseVersion) {
  return remote.ok && Number.isFinite(baseVersion) && remote.version > baseVersion;
}

function pullLocalSnapshot(tripId, storage, mode) {
  const raw = storage?.getItem?.(`${LOCAL_PREFIX}${tripId}`);
  if (!raw) return { ok: false, mode, missing: true, tripId, message: "本地演示暂无可拉取版本" };
  try {
    return normalizeSnapshotResult(JSON.parse(raw), mode, "已拉取本地演示云端版本");
  } catch {
    return { ok: false, mode, tripId, message: "本地演示云端数据无法解析" };
  }
}

function writeLocalSnapshot(row, storage) {
  storage?.setItem?.(`${LOCAL_PREFIX}${row.id}`, JSON.stringify(row));
}

function normalizeSnapshotResult(row, mode, message) {
  if (isClearedSnapshot(row)) {
    return {
      ok: false,
      missing: true,
      cleared: true,
      mode,
      message: "云端已清空，暂无可拉取版本",
      tripId: row.id,
      version: row.version ?? 0,
      updatedAt: row.updated_at,
      updatedBy: row.updated_by
    };
  }

  return {
    ok: true,
    mode,
    message,
    tripId: row.id,
    trip: row.payload,
    version: row.version ?? 1,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by
  };
}

function isClearedSnapshot(row) {
  return row?.payload?.cloudCleared === true;
}
