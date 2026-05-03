-- ============================================================
-- Telegram Saver — Database Schema v2
-- Запускати в Supabase SQL Editor
-- ============================================================

-- ОЧИЩЕННЯ (видаляємо старе якщо є)
drop table if exists public.media_files cascade;
drop table if exists public.item_tags cascade;
drop table if exists public.tags cascade;
drop table if exists public.saved_items cascade;
drop table if exists public.profiles cascade;
drop type if exists public.item_type cascade;

-- 1. ТАБЛИЦЯ ПРОФІЛІВ КОРИСТУВАЧІВ
-- Зберігає дані з Telegram Login Widget
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  telegram_user_id bigint unique not null,
  telegram_username text,
  telegram_first_name text,
  telegram_photo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. ОСНОВНА ТАБЛИЦЯ ЗБЕРЕЖЕНЬ
-- Все що бот зберігає: посилання, фото, PDF, текст, forward
create type public.item_type as enum ('link', 'pdf', 'photo', 'text', 'forward');

create table public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.item_type not null,
  source_url text,
  storage_path text,
  title text,
  description text,
  full_text text,
  summary text,
  ai_analysis jsonb,
  forward_origin jsonb,
  is_favorite boolean not null default false,
  created_at timestamptz default now()
);

-- 3. ТАБЛИЦЯ ТЕГІВ
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  color text default '#6366f1',
  created_at timestamptz default now(),
  unique(user_id, name)
);

-- 4. ЗВ'ЯЗОК МІЖ ЗБЕРЕЖЕННЯМИ І ТЕГАМИ (many-to-many)
create table public.item_tags (
  item_id uuid not null references public.saved_items(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (item_id, tag_id)
);

-- 5. МЕДІАФАЙЛИ (для альбомів фото)
create table public.media_files (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.saved_items(id) on delete cascade,
  storage_path text not null,
  mime_type text,
  extracted_text text,
  vision_description text,
  order_index int default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Кожен користувач бачить тільки свої дані
-- ============================================================

alter table public.profiles enable row level security;
alter table public.saved_items enable row level security;
alter table public.tags enable row level security;
alter table public.item_tags enable row level security;
alter table public.media_files enable row level security;

-- Policies для profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Policies для saved_items
create policy "Users can view own items"
  on public.saved_items for select
  using (auth.uid() = user_id);

create policy "Users can insert own items"
  on public.saved_items for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own items"
  on public.saved_items for delete
  using (auth.uid() = user_id);

-- Policies для tags
create policy "Users can view own tags"
  on public.tags for select
  using (auth.uid() = user_id);

create policy "Users can insert own tags"
  on public.tags for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own tags"
  on public.tags for delete
  using (auth.uid() = user_id);

-- Policies для item_tags
create policy "Users can view own item_tags"
  on public.item_tags for select
  using (
    exists (
      select 1 from public.saved_items
      where id = item_id and user_id = auth.uid()
    )
  );

create policy "Users can insert own item_tags"
  on public.item_tags for insert
  with check (
    exists (
      select 1 from public.saved_items
      where id = item_id and user_id = auth.uid()
    )
  );

create policy "Users can delete own item_tags"
  on public.item_tags for delete
  using (
    exists (
      select 1 from public.saved_items
      where id = item_id and user_id = auth.uid()
    )
  );

-- Policies для media_files
create policy "Users can view own media_files"
  on public.media_files for select
  using (
    exists (
      select 1 from public.saved_items
      where id = item_id and user_id = auth.uid()
    )
  );

create policy "Users can insert own media_files"
  on public.media_files for insert
  with check (
    exists (
      select 1 from public.saved_items
      where id = item_id and user_id = auth.uid()
    )
  );

-- ============================================================
-- ІНДЕКСИ для прискорення запитів
-- ============================================================

create index on public.saved_items (user_id, created_at desc);
create index on public.saved_items (user_id, type);
create index on public.saved_items (user_id, is_favorite) where is_favorite = true;
create index on public.tags (user_id);
create index on public.media_files (item_id);
