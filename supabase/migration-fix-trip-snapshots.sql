-- Supabase 迁移脚本：修复 trip_snapshots 主键

-- 清理可能的残留表
DROP TABLE IF EXISTS public.trip_snapshots_backup;
DROP TABLE IF EXISTS public.trip_snapshots_rebuild;

-- 备份现有数据
CREATE TABLE public.trip_snapshots_backup AS SELECT * FROM public.trip_snapshots;

-- 使用备份表重建新表，按每个 id 分配唯一递增版本号
CREATE TABLE public.trip_snapshots_rebuild AS
SELECT
  id,
  row_number() OVER (PARTITION BY id ORDER BY COALESCE(version, 0), updated_at, updated_by, payload::text) AS version,
  payload,
  updated_at,
  updated_by
FROM public.trip_snapshots_backup
ORDER BY id, updated_at;

-- 删除旧表并重命名重建表
DROP TABLE IF EXISTS public.trip_snapshots CASCADE;
ALTER TABLE public.trip_snapshots_rebuild RENAME TO trip_snapshots;

-- 添加主键约束
ALTER TABLE public.trip_snapshots
  ADD PRIMARY KEY (id, version);

-- 启用行级安全
ALTER TABLE public.trip_snapshots ENABLE ROW LEVEL SECURITY;

-- 步骤 6: 恢复策略（所有用户都可以读写）
CREATE POLICY "public can read trips"
  ON public.trip_snapshots FOR SELECT
  USING (true);

CREATE POLICY "public can insert trips"
  ON public.trip_snapshots FOR INSERT
  WITH CHECK (true);

CREATE POLICY "public can update trips"
  ON public.trip_snapshots FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 完成后可删除备份表
-- DROP TABLE public.trip_snapshots_backup;
