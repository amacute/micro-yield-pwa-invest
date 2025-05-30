-- Drop existing triggers
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists update_profiles_updated_at on profiles;
drop trigger if exists update_investments_updated_at on investments;

-- Drop existing functions
drop function if exists handle_new_user();
drop function if exists public.handle_new_user();
drop function if exists update_updated_at_column();

-- Drop existing policies
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can view own investments" on investments;
drop policy if exists "Users can create investments" on investments;
drop policy if exists "Users can update own investments" on investments;
drop policy if exists "Users can view own transactions" on transactions;
drop policy if exists "Users can create transactions" on transactions;

-- Drop existing tables
drop table if exists transactions;
drop table if exists investments;
drop table if exists profiles; 