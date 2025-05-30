-- Drop existing types if they exist
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'investment_status') THEN
        DROP TYPE investment_status CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        DROP TYPE transaction_type CASCADE;
    END IF;
END $$;

-- Create enum for investment status
CREATE TYPE investment_status AS ENUM ('pending', 'active', 'completed', 'defaulted', 'cancelled');

-- Create enum for transaction types
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'investment', 'return', 'fee');

-- Create profiles table to extend auth.users
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT,
    phone_number TEXT,
    country TEXT,
    kyc_status BOOLEAN DEFAULT false,
    risk_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create investment_opportunities table
CREATE TABLE IF NOT EXISTS investment_opportunities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    amount_required DECIMAL(19,2) NOT NULL,
    amount_raised DECIMAL(19,2) DEFAULT 0,
    interest_rate DECIMAL(5,2) NOT NULL,
    duration_months INTEGER NOT NULL,
    risk_level INTEGER NOT NULL,
    borrower_id UUID REFERENCES profiles(id) NOT NULL,
    status investment_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create investments table for tracking individual investments
CREATE TABLE IF NOT EXISTS investments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    investor_id UUID REFERENCES profiles(id) NOT NULL,
    opportunity_id UUID REFERENCES investment_opportunities(id) NOT NULL,
    amount DECIMAL(19,2) NOT NULL,
    expected_return DECIMAL(19,2) NOT NULL,
    status investment_status DEFAULT 'pending',
    investment_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    maturity_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    balance DECIMAL(19,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT positive_balance CHECK (balance >= 0)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_id UUID REFERENCES wallets(id) NOT NULL,
    type transaction_type NOT NULL,
    amount DECIMAL(19,2) NOT NULL,
    reference_id UUID, -- Can reference investment_id or opportunity_id
    status TEXT DEFAULT 'completed',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create repayment_schedule table
CREATE TABLE IF NOT EXISTS repayment_schedule (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    investment_id UUID REFERENCES investments(id) NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    amount DECIMAL(19,2) NOT NULL,
    paid_amount DECIMAL(19,2) DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS (Row Level Security) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE repayment_schedule ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Investment opportunities policies
CREATE POLICY "Anyone can view investment opportunities"
    ON investment_opportunities FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create their own investment opportunities"
    ON investment_opportunities FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = borrower_id);

-- Investments policies
CREATE POLICY "Users can view their own investments"
    ON investments FOR SELECT
    TO authenticated
    USING (auth.uid() = investor_id);

CREATE POLICY "Users can create their own investments"
    ON investments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = investor_id);

-- Wallets policies
CREATE POLICY "Users can view their own wallet"
    ON wallets FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view their own transactions"
    ON transactions FOR SELECT
    TO authenticated
    USING (wallet_id IN (
        SELECT id FROM wallets WHERE user_id = auth.uid()
    ));

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  
  INSERT INTO wallets (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_investments_investor_id ON investments(investor_id);
CREATE INDEX idx_investments_opportunity_id ON investments(opportunity_id);
CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_repayment_schedule_investment_id ON repayment_schedule(investment_id); 