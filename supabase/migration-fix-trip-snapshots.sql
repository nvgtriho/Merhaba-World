-- Supabase 迁移脚本：修复 trip_snapshots 主键

-- 步骤 1: 备份现有数据
CREATE TABLE public.trip_snapshots_backup AS SELECT * FROM public.trip_snapshots;

-- 步骤 2: 删除旧表
DROP TABLE public.trip_snapshots CASCADE;

-- 步骤 3: 创建新表（复合主键）
CREATE TABLE public.trip_snapshots (
  id text not null,
  version integer not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text not null default 'traveler',
  primary key (id, version)
);

-- 步骤 4: 恢复数据
INSERT INTO public.trip_snapshots (id, version, payload, updated_at, updated_by)
SELECT id, version, payload, updated_at, updated_by FROM public.trip_snapshots_backup;

-- 步骤 5: 启用行级安全
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
