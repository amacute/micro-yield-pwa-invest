-- Create sign_in table
CREATE TABLE public.sign_in (
    id bigint primary key generated always as identity,
    email text not null,
    password text not null,
    created_at timestamp with time zone default now()
);

-- Enable Row Level Security
ALTER TABLE public.sign_in ENABLE ROW LEVEL SECURITY;

-- Create policies for sign_in table
CREATE POLICY "Users can view their own sign in data"
    ON public.sign_in
    FOR SELECT
    USING (auth.uid() IN (
        SELECT id::text 
        FROM auth.users 
        WHERE email = sign_in.email
    ));

CREATE POLICY "Users can update their own sign in data"
    ON public.sign_in
    FOR UPDATE
    USING (auth.uid() IN (
        SELECT id::text 
        FROM auth.users 
        WHERE email = sign_in.email
    ));

-- Create index for better performance
CREATE INDEX idx_sign_in_email ON public.sign_in(email);

-- Add foreign key constraint to ensure email exists in auth.users
ALTER TABLE public.sign_in
    ADD CONSTRAINT fk_sign_in_email
    FOREIGN KEY (email)
    REFERENCES auth.users(email)
    ON DELETE CASCADE; 