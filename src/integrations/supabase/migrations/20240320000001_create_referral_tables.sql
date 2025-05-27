-- Add referral-related columns to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS referral_code VARCHAR(8) UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by VARCHAR(8) REFERENCES users(referral_code);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(user_id),
  referee_id UUID NOT NULL REFERENCES users(user_id),
  status TEXT NOT NULL DEFAULT 'pending',
  bonus_amount DECIMAL NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_referral_status CHECK (status IN ('pending', 'completed', 'cancelled'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- Function to process referral bonus
CREATE OR REPLACE FUNCTION process_referral_bonus(
  p_referral_id UUID,
  p_bonus_amount DECIMAL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referral RECORD;
BEGIN
  -- Get referral record
  SELECT * INTO v_referral
  FROM referrals
  WHERE id = p_referral_id AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Referral not found or already processed'
    );
  END IF;

  -- Update referrer's wallet balance
  UPDATE users
  SET wallet_balance = wallet_balance + p_bonus_amount
  WHERE user_id = v_referral.referrer_id;

  -- Mark referral as completed
  UPDATE referrals
  SET 
    status = 'completed',
    completed_at = NOW()
  WHERE id = p_referral_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Referral bonus processed successfully'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'message', SQLERRM
  );
END;
$$; 