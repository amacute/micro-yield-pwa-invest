-- Create sign_up table
CREATE TABLE public.sign_up (
    id bigint primary key generated always as identity,
    full_name text not null,
    username text not null unique,
    country text not null,
    phone_number text not null,
    address text not null,
    email_address text not null unique,
    created_at timestamp with time zone default now()
);

-- Enable Row Level Security
ALTER TABLE public.sign_up ENABLE ROW LEVEL SECURITY;

-- Create policies for sign_up table
CREATE POLICY "Users can view their own sign up data"
    ON public.sign_up
    FOR SELECT
    USING (auth.uid()::text = username);

CREATE POLICY "Users can update their own sign up data"
    ON public.sign_up
    FOR UPDATE
    USING (auth.uid()::text = username);

-- Create index for better performance
CREATE INDEX idx_sign_up_username ON public.sign_up(username);
CREATE INDEX idx_sign_up_email ON public.sign_up(email_address); 