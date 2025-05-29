-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_referrals_referee_id ON referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

-- Function to process referral bonus
CREATE OR REPLACE FUNCTION process_referral_bonus(
  p_referral_id UUID,
  p_bonus_amount DECIMAL
)
RETURNS VOID AS $$
DECLARE
  v_referrer_id UUID;
  v_referee_id UUID;
BEGIN
  -- Get referral information
  SELECT referrer_id, referee_id
  INTO v_referrer_id, v_referee_id
  FROM referrals
  WHERE id = p_referral_id
  AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or already processed referral';
  END IF;

  -- Update referrer's wallet balance
  UPDATE users
  SET wallet_balance = wallet_balance + p_bonus_amount
  WHERE user_id = v_referrer_id;

  -- Update referral status to completed
  UPDATE referrals
  SET 
    status = 'completed',
    completed_at = NOW(),
    bonus_paid = p_bonus_amount
  WHERE id = p_referral_id;

  -- Create a transaction record for the bonus
  INSERT INTO transactions (
    user_id,
    amount,
    type,
    status,
    description
  ) VALUES (
    v_referrer_id,
    p_bonus_amount,
    'referral_bonus',
    'completed',
    'Referral bonus for inviting ' || (SELECT email FROM users WHERE user_id = v_referee_id)
  );
END;
$$ LANGUAGE plpgsql; 