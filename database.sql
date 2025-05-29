-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  wallet_balance numeric default 0 check (wallet_balance >= 0),
  total_invested numeric default 0,
  total_returns numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create investments table
create table if not exists investments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  amount numeric not null check (amount > 0),
  type text not null check (type in ('fixed_income', 'growth', 'high_yield')),
  status text not null check (status in ('active', 'completed', 'cancelled')),
  expected_return numeric not null,
  start_date timestamp with time zone default timezone('utc'::text, now()),
  end_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create transactions table
create table if not exists transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  type text not null check (type in ('deposit', 'withdrawal', 'investment', 'return')),
  amount numeric not null check (amount > 0),
  status text not null check (status in ('pending', 'completed', 'failed')),
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table investments enable row level security;
alter table transactions enable row level security;

-- Create RLS policies
-- Profiles policies
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Investments policies
create policy "Users can view own investments"
  on investments for select
  using (auth.uid() = user_id);

create policy "Users can create investments"
  on investments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own investments"
  on investments for update
  using (auth.uid() = user_id);

-- Transactions policies
create policy "Users can view own transactions"
  on transactions for select
  using (auth.uid() = user_id);

create policy "Users can create transactions"
  on transactions for insert
  with check (auth.uid() = user_id);

-- Create triggers for updating timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();

create trigger update_investments_updated_at
  before update on investments
  for each row
  execute function update_updated_at_column();

-- Create function to handle new user registration
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user registration
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user(); 