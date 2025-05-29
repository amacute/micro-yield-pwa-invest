-- Add new columns to investment_offers table
ALTER TABLE investment_offers
ADD COLUMN IF NOT EXISTS initial_deposit_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS withdrawal_deposit_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS withdrawal_deposit_amount DECIMAL;

-- Create deposits table if it doesn't exist
CREATE TABLE IF NOT EXISTS deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  investment_id UUID REFERENCES investment_offers(id),
  amount DECIMAL NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'initial' or 'withdrawal'
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to process deposits
CREATE OR REPLACE FUNCTION process_deposit(
  p_deposit_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_deposit deposits%ROWTYPE;
  v_investment investment_offers%ROWTYPE;
BEGIN
  -- Get deposit details
  SELECT * INTO v_deposit
  FROM deposits
  WHERE id = p_deposit_id
  AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or already processed deposit';
  END IF;

  -- Get investment details
  SELECT * INTO v_investment
  FROM investment_offers
  WHERE id = v_deposit.investment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Investment not found';
  END IF;

  -- Update deposit status
  UPDATE deposits
  SET status = 'completed'
  WHERE id = p_deposit_id;

  -- Update investment based on deposit type
  IF v_deposit.type = 'initial' THEN
    UPDATE investment_offers
    SET initial_deposit_confirmed = TRUE
    WHERE id = v_deposit.investment_id;
  ELSIF v_deposit.type = 'withdrawal' THEN
    -- Verify withdrawal deposit amount matches initial investment
    IF v_deposit.amount != v_investment.amount THEN
      RAISE EXCEPTION 'Withdrawal deposit amount must match initial investment amount';
    END IF;

    UPDATE investment_offers
    SET 
      withdrawal_deposit_confirmed = TRUE,
      withdrawal_deposit_amount = v_deposit.amount
    WHERE id = v_deposit.investment_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to process investment withdrawal
CREATE OR REPLACE FUNCTION process_investment_withdrawal(
  p_investment_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_investment investment_offers%ROWTYPE;
  v_profit DECIMAL;
BEGIN
  -- Get investment details
  SELECT * INTO v_investment
  FROM investment_offers
  WHERE id = p_investment_id
  AND status = 'matched'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or unmatched investment';
  END IF;

  -- Verify conditions
  IF NOT v_investment.initial_deposit_confirmed THEN
    RAISE EXCEPTION 'Initial deposit not confirmed';
  END IF;

  IF NOT v_investment.withdrawal_deposit_confirmed THEN
    RAISE EXCEPTION 'Withdrawal deposit not confirmed';
  END IF;

  -- Check 72-hour waiting period
  IF (EXTRACT(EPOCH FROM NOW() - v_investment.created_at) / 3600) < 72 THEN
    RAISE EXCEPTION 'Cannot withdraw before 72-hour waiting period';
  END IF;

  -- Calculate profit (100% of initial investment)
  v_profit := v_investment.amount;

  -- Create withdrawal transaction
  INSERT INTO transactions (
    user_id,
    amount,
    type,
    status,
    description
  ) VALUES (
    v_investment.user_id,
    v_investment.amount + v_profit,
    'investment_withdrawal',
    'completed',
    format('Investment withdrawal: $%s initial + $%s profit', 
           v_investment.amount, v_profit)
  );

  -- Update investment status
  UPDATE investment_offers
  SET status = 'completed'
  WHERE id = p_investment_id;

  -- Create notification
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data
  ) VALUES (
    v_investment.user_id,
    'investment_withdrawal',
    'Investment Withdrawal Processed',
    format('Your investment withdrawal of $%s (including $%s profit) has been processed',
           v_investment.amount + v_profit, v_profit),
    jsonb_build_object(
      'investment_id', p_investment_id,
      'initial_amount', v_investment.amount,
      'profit', v_profit,
      'total_amount', v_investment.amount + v_profit
    )
  );
END;
$$ LANGUAGE plpgsql; 