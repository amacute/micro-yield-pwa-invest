-- Create lending_matches table
CREATE TABLE IF NOT EXISTS lending_matches (
  match_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID NOT NULL REFERENCES users(user_id),
  total_amount DECIMAL NOT NULL,
  purpose TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  lending_end_time TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'completed', 'cancelled'))
);

-- Create lending_match_contributions table for individual lender contributions
CREATE TABLE IF NOT EXISTS lending_match_contributions (
  contribution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES lending_matches(match_id),
  lender_id UUID NOT NULL REFERENCES users(user_id),
  amount DECIMAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  lending_end_time TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  profit_amount DECIMAL,
  CONSTRAINT valid_contribution_status CHECK (status IN ('pending', 'active', 'completed', 'cancelled'))
);

-- Add lending_end_time column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS lending_end_time TIMESTAMP WITH TIME ZONE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lending_matches_borrower ON lending_matches(borrower_id);
CREATE INDEX IF NOT EXISTS idx_lending_matches_status ON lending_matches(status);
CREATE INDEX IF NOT EXISTS idx_lending_match_contributions_lender ON lending_match_contributions(lender_id);
CREATE INDEX IF NOT EXISTS idx_lending_match_contributions_match ON lending_match_contributions(match_id);
CREATE INDEX IF NOT EXISTS idx_lending_match_contributions_status ON lending_match_contributions(status);

-- Create a function to process completed lending matches
CREATE OR REPLACE FUNCTION process_completed_lending_matches()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update completed lending matches
  UPDATE lending_matches
  SET 
    status = 'completed',
    completed_at = NOW()
  WHERE 
    status = 'active' 
    AND lending_end_time <= NOW();

  -- Process lender profits
  WITH completed_contributions AS (
    UPDATE lending_match_contributions lmc
    SET 
      status = 'completed',
      completed_at = NOW(),
      profit_amount = amount -- 100% profit
    WHERE 
      status = 'active'
      AND lending_end_time <= NOW()
    RETURNING 
      lender_id,
      amount as principal,
      amount as profit
  )
  UPDATE users u
  SET wallet_balance = wallet_balance + (cc.principal + cc.profit)
  FROM completed_contributions cc
  WHERE u.user_id = cc.lender_id;
END;
$$;

-- Create a cron job to process completed lending matches every minute
SELECT cron.schedule(
  'process-lending-matches',
  '* * * * *', -- Every minute
  $$SELECT process_completed_lending_matches();$$
); 