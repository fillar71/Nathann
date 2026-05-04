-- Create users table
create table public.users (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create messages table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  user_id uuid references public.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable realtime for messages
alter publication supabase_realtime add table public.messages;

-- Note: This table is linked to the Supabase Auth system. 
-- When a new user signs up, we want to copy their details to our public.users table.
-- We can do this using a Supabase trigger.

-- Create a trigger function
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, full_name, avatar_url, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Set up Row Level Security (RLS)
alter table public.users enable row level security;

create policy "Public profiles are viewable by everyone." on public.users
  for select using (true);

create policy "Users can insert their own profile." on public.users
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.users
  for update using (auth.uid() = id);

-- Create a basic generic profiles table if you prefer that naming
-- ...

alter table public.messages enable row level security;

create policy "Users can view their own messages." on public.messages
  for select using (auth.uid() = user_id);

create policy "Users can insert their own messages." on public.messages
  for insert with check (auth.uid() = user_id);
