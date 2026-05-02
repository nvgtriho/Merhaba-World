create table if not exists public.trips (
  id text primary key,
  name text not null,
  destination_template text not null default 'generic',
  starts_on date,
  ends_on date,
  updated_at timestamptz not null default now()
);

create table if not exists public.trip_members (
  trip_id text not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('editor')),
  created_at timestamptz not null default now(),
  primary key (trip_id, user_id)
);

create table if not exists public.itinerary_items (
  id text primary key,
  trip_id text not null references public.trips(id) on delete cascade,
  item_date date not null,
  start_time time,
  end_time time,
  item_type text not null,
  title text not null,
  notes jsonb not null default '[]'::jsonb,
  place_name text,
  source text not null default 'manual',
  updated_at timestamptz not null default now()
);

create table if not exists public.places (
  id text primary key,
  trip_id text not null references public.trips(id) on delete cascade,
  name text not null,
  city text,
  address text,
  official_url text,
  weather_source_config jsonb not null default '{}'::jsonb
);

create table if not exists public.links (
  id text primary key,
  trip_id text not null references public.trips(id) on delete cascade,
  title text not null,
  url text not null,
  tag text
);

create table if not exists public.weather_snapshots (
  id text primary key,
  trip_id text not null references public.trips(id) on delete cascade,
  place_id text references public.places(id) on delete set null,
  forecast_date date not null,
  source_id text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.trip_snapshots (
  id text not null,
  version integer not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text not null default 'traveler',
  primary key (id, version)
);

alter table public.trips enable row level security;
alter table public.trip_members enable row level security;
alter table public.itinerary_items enable row level security;
alter table public.places enable row level security;
alter table public.links enable row level security;
alter table public.weather_snapshots enable row level security;
alter table public.trip_snapshots enable row level security;

create policy "members can read trips"
  on public.trips for select
  using (exists (select 1 from public.trip_members m where m.trip_id = id and m.user_id = auth.uid()));

create policy "members can update trips"
  on public.trips for update
  using (exists (select 1 from public.trip_members m where m.trip_id = id and m.user_id = auth.uid()));

create policy "members can read members"
  on public.trip_members for select
  using (exists (select 1 from public.trip_members m where m.trip_id = trip_id and m.user_id = auth.uid()));

create policy "members can edit itinerary"
  on public.itinerary_items for all
  using (exists (select 1 from public.trip_members m where m.trip_id = trip_id and m.user_id = auth.uid()))
  with check (exists (select 1 from public.trip_members m where m.trip_id = trip_id and m.user_id = auth.uid()));

create policy "members can edit places"
  on public.places for all
  using (exists (select 1 from public.trip_members m where m.trip_id = trip_id and m.user_id = auth.uid()))
  with check (exists (select 1 from public.trip_members m where m.trip_id = trip_id and m.user_id = auth.uid()));

create policy "members can edit links"
  on public.links for all
  using (exists (select 1 from public.trip_members m where m.trip_id = trip_id and m.user_id = auth.uid()))
  with check (exists (select 1 from public.trip_members m where m.trip_id = trip_id and m.user_id = auth.uid()));

create policy "members can read weather"
  on public.weather_snapshots for select
  using (exists (select 1 from public.trip_members m where m.trip_id = trip_id and m.user_id = auth.uid()));

create policy "public can read trip snapshots"
  on public.trip_snapshots for select
  using (true);

create policy "public can insert trip snapshots"
  on public.trip_snapshots for insert
  with check (true);

create policy "public can update trip snapshots"
  on public.trip_snapshots for update
  using (true)
  with check (true);
