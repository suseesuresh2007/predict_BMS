create table if not exists public.telemetry_readings (
  id uuid primary key default gen_random_uuid(),
  device_id text not null check (device_id ~ '^[A-Za-z0-9._:-]{1,80}$'),
  temperature_c double precision not null check (temperature_c between -100 and 200),
  battery_voltage_v double precision not null check (battery_voltage_v between 0 and 1000),
  current_a double precision not null check (current_a between -500 and 500),
  temp_rise_c_per_min double precision not null default 0,
  risk_score double precision not null check (risk_score between 0 and 100),
  alert boolean not null default false,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists telemetry_readings_device_recorded_idx
  on public.telemetry_readings (device_id, recorded_at desc);

alter table public.telemetry_readings enable row level security;

drop policy if exists "authenticated users can read telemetry" on public.telemetry_readings;
create policy "authenticated users can read telemetry"
  on public.telemetry_readings
  for select
  to authenticated
  using (true);

grant select on public.telemetry_readings to authenticated;
