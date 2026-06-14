-- 001_core.sql

create extension if not exists pgcrypto;

do $$
begin
  create type user_role_enum as enum ('owner', 'doctor', 'staff', 'customer');
exception when duplicate_object then
  null;
end
$$;

do $$
begin
  create type module_key_enum as enum ('clinic', 'monitoring', 'inpatient', 'grooming', 'petshop', 'inventory', 'accounting', 'website');
exception when duplicate_object then
  null;
end
$$;

do $$
begin
  create type appointment_status_enum as enum ('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show');
exception when duplicate_object then
  null;
end
$$;

do $$
begin
  create type customer_status_enum as enum ('active', 'inactive', 'vip', 'blacklisted');
exception when duplicate_object then
  null;
end
$$;

do $$
begin
  create type cage_status_enum as enum ('available', 'occupied', 'cleaning', 'maintenance');
exception when duplicate_object then
  null;
end
$$;

do $$
begin
  create type payment_method_enum as enum ('cash', 'card', 'bank-transfer', 'e-wallet');
exception when duplicate_object then
  null;
end
$$;

do $$
begin
  create type stock_movement_type_enum as enum ('inbound', 'outbound', 'adjustment');
exception when duplicate_object then
  null;
end
$$;

do $$
begin
  create type notification_provider_enum as enum ('email', 'whatsapp', 'sms');
exception when duplicate_object then
  null;
end
$$;

do $$
begin
  create type account_type_enum as enum ('asset', 'liability', 'equity', 'revenue', 'expense');
exception when duplicate_object then
  null;
end
$$;

do $$
begin
  create type transaction_type_enum as enum ('credit', 'debit');
exception when duplicate_object then
  null;
end
$$;

do $$
begin
  create type invoice_status_enum as enum ('draft', 'paid', 'pending', 'cancelled', 'refunded');
exception when duplicate_object then
  null;
end
$$;

do $$
begin
  create type medical_record_type_enum as enum ('consultation', 'follow-up', 'emergency', 'surgery');
exception when duplicate_object then
  null;
end
$$;

do $$
begin
  create type vaccination_channel_enum as enum ('email', 'whatsapp', 'sms');
exception when duplicate_object then
  null;
end
$$;

do $$
begin
  create type resume_status_enum as enum ('scheduled', 'completed', 'cancelled');
exception when duplicate_object then
  null;
end
$$;

create table IF NOT EXISTS profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  whatsapp text,
  role user_role_enum not null default 'customer',
  is_active boolean not null default true,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table IF NOT EXISTS settings (
  id uuid primary key default gen_random_uuid(),
  key varchar not null unique,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references profiles(id) on delete set null
);

create table IF NOT EXISTS modules (
  id uuid primary key default gen_random_uuid(),
  key module_key_enum not null unique,
  is_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

create table IF NOT EXISTS audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  action varchar not null,
  table_name varchar not null,
  record_id uuid,
  old_value jsonb,
  new_value jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);

create table IF NOT EXISTS notifications_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  channel notification_provider_enum not null,
  recipient text not null,
  template_key varchar not null,
  payload jsonb not null default '{}'::jsonb,
  status varchar not null,
  error_message text,
  sent_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table settings enable row level security;
alter table modules enable row level security;
alter table audit_logs enable row level security;
alter table notifications_log enable row level security;

create policy profiles_owner_full on profiles for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy profiles_doctor_read on profiles for select using (auth.role() = 'doctor');
create policy profiles_staff_read on profiles for select using (auth.role() = 'staff');
create policy profiles_customer_own on profiles for select using (id = auth.uid());

create policy settings_owner_full on settings for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy settings_staff_read on settings for select using (auth.role() = 'staff');
create policy settings_doctor_read on settings for select using (auth.role() = 'doctor');
create policy settings_customer_none on settings for select using (false);

create policy modules_owner_full on modules for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy modules_staff_read on modules for select using (auth.role() = 'staff' or auth.role() = 'doctor');
create policy modules_customer_none on modules for select using (false);

create policy audit_logs_owner_full on audit_logs for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy audit_logs_doctor_read on audit_logs for select using (auth.role() = 'doctor');
create policy audit_logs_staff_read on audit_logs for select using (auth.role() = 'staff');
create policy audit_logs_customer_none on audit_logs for select using (false);

create policy notifications_log_owner_full on notifications_log for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy notifications_log_staff_access on notifications_log for select using (auth.role() = 'staff');
create policy notifications_log_doctor_access on notifications_log for select using (auth.role() = 'doctor');
create policy notifications_log_customer_none on notifications_log for select using (false);
