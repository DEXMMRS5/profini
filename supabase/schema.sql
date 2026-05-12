-- ProFini — Supabase Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── ARTISANS ─────────────────────────────────────────────────────────────────
create table if not exists artisans (
  id         uuid references auth.users on delete cascade primary key,
  nom        text not null,
  email      text not null,
  tel        text,
  created_at timestamptz default now()
);

alter table artisans enable row level security;

create policy "Artisan can read own profile"
  on artisans for select using (auth.uid() = id);

create policy "Artisan can update own profile"
  on artisans for update using (auth.uid() = id);

create policy "Artisan can insert own profile"
  on artisans for insert with check (auth.uid() = id);

-- ─── CHANTIERS ────────────────────────────────────────────────────────────────
create table if not exists chantiers (
  id              uuid primary key default gen_random_uuid(),
  artisan_id      uuid references artisans on delete cascade not null,
  nom_client      text not null,
  tel_client      text not null,
  email_client    text,
  adresse         text not null,
  type_travaux    text not null,
  description     text,
  numero_devis    text,
  montant_ttc     numeric(10,2) not null,
  status          text not null default 'encours'
                  check (status in ('encours', 'impaye', 'paye', 'cloture')),
  paiement_recu   boolean default false,
  demande_avis    boolean default true,
  sig_artisan_url text,
  sig_client_url  text,
  pdf_url         text,
  created_at      timestamptz default now(),
  closed_at       timestamptz
);

alter table chantiers enable row level security;

create policy "Artisan can read own chantiers"
  on chantiers for select using (auth.uid() = artisan_id);

create policy "Artisan can insert own chantiers"
  on chantiers for insert with check (auth.uid() = artisan_id);

create policy "Artisan can update own chantiers"
  on chantiers for update using (auth.uid() = artisan_id);

create policy "Artisan can delete own chantiers"
  on chantiers for delete using (auth.uid() = artisan_id);

-- ─── PHOTOS ───────────────────────────────────────────────────────────────────
create table if not exists photos (
  id          uuid primary key default gen_random_uuid(),
  chantier_id uuid references chantiers on delete cascade not null,
  url         text not null,
  path        text not null,
  created_at  timestamptz default now()
);

alter table photos enable row level security;

create policy "Artisan can read own photos"
  on photos for select
  using (exists (select 1 from chantiers where chantiers.id = photos.chantier_id and chantiers.artisan_id = auth.uid()));

create policy "Artisan can insert own photos"
  on photos for insert
  with check (exists (select 1 from chantiers where chantiers.id = photos.chantier_id and chantiers.artisan_id = auth.uid()));

create policy "Artisan can delete own photos"
  on photos for delete
  using (exists (select 1 from chantiers where chantiers.id = photos.chantier_id and chantiers.artisan_id = auth.uid()));

-- ─── STORAGE BUCKETS ──────────────────────────────────────────────────────────
-- Run these in Supabase Storage settings or SQL:

insert into storage.buckets (id, name, public) values ('photos', 'photos', false) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('signatures', 'signatures', false) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('pdfs', 'pdfs', false) on conflict do nothing;

-- Storage RLS
create policy "Artisan can upload photos"
  on storage.objects for insert
  with check (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Artisan can read own photos"
  on storage.objects for select
  using (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Artisan can delete own photos"
  on storage.objects for delete
  using (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Artisan can upload signatures"
  on storage.objects for insert
  with check (bucket_id = 'signatures' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Artisan can read own signatures"
  on storage.objects for select
  using (bucket_id = 'signatures' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Service role manages pdfs"
  on storage.objects for all
  using (bucket_id = 'pdfs');

-- ─── TRIGGER: auto-create artisan profile on signup ───────────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into artisans (id, nom, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nom', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
