-- Create loan_matches table if it doesn't exist
CREATE TABLE IF NOT EXISTS loan_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_request_id UUID REFERENCES loan_requests(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DECIMAL NOT NULL,
  interest_rate DECIMAL NOT NULL,
  term_months INTEGER NOT NULL
);

-- Create loan_match_investments table for many-to-many relationship
CREATE TABLE IF NOT EXISTS loan_match_investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_match_id UUID REFERENCES loan_matches(id),
  investment_offer_id UUID REFERENCES investment_offers(id),
  amount DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to create a loan match
CREATE OR REPLACE FUNCTION create_loan_match(
  p_loan_request_id UUID,
  p_investment_ids UUID[]
)
RETURNS UUID AS $$
DECLARE
  v_loan_request loan_requests%ROWTYPE;
  v_investment investment_offers%ROWTYPE;
  v_total_amount DECIMAL := 0;
  v_loan_match_id UUID;
  v_investment_id UUID;
BEGIN
  -- Get loan request details
  SELECT * INTO v_loan_request
  FROM loan_requests
  WHERE id = p_loan_request_id
  AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or already processed loan request';
  END IF;

  -- Create loan match record
  INSERT INTO loan_matches (
    loan_request_id,
    total_amount,
    interest_rate,
    term_months
  ) VALUES (
    p_loan_request_id,
    v_loan_request.amount,
    v_loan_request.interest_rate,
    v_loan_request.term_months
  ) RETURNING id INTO v_loan_match_id;

  -- Process each investment
  FOREACH v_investment_id IN ARRAY p_investment_ids
  LOOP
    -- Get investment offer details
    SELECT * INTO v_investment
    FROM investment_offers
    WHERE id = v_investment_id
    AND status = 'available'
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Invalid or unavailable investment offer: %', v_investment_id;
    END IF;

    -- Verify investment criteria
    IF v_investment.min_interest_rate > v_loan_request.interest_rate THEN
      RAISE EXCEPTION 'Investment % requires higher interest rate than loan offers', v_investment_id;
    END IF;

    IF v_investment.max_term_months < v_loan_request.term_months THEN
      RAISE EXCEPTION 'Investment % requires shorter term than loan requests', v_investment_id;
    END IF;

    -- Create loan match investment record
    INSERT INTO loan_match_investments (
      loan_match_id,
      investment_offer_id,
      amount
    ) VALUES (
      v_loan_match_id,
      v_investment_id,
      v_investment.amount
    );

    -- Update investment offer status
    UPDATE investment_offers
    SET status = 'matched'
    WHERE id = v_investment_id;

    -- Add to total amount
    v_total_amount := v_total_amount + v_investment.amount;
  END LOOP;

  -- Verify total amount matches loan request
  IF v_total_amount != v_loan_request.amount THEN
    RAISE EXCEPTION 'Total investment amount (%) does not match loan amount (%)',
      v_total_amount, v_loan_request.amount;
  END IF;

  -- Update loan request status
  UPDATE loan_requests
  SET status = 'matched'
  WHERE id = p_loan_request_id;

  -- Update loan match status
  UPDATE loan_matches
  SET status = 'active'
  WHERE id = v_loan_match_id;

  -- Create notifications for all parties
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data
  )
  SELECT
    CASE 
      WHEN u.user_id = v_loan_request.user_id THEN
        'Your loan request has been matched with investors'
      ELSE
        'Your investment has been matched with a loan'
    END,
    'loan_match',
    CASE 
      WHEN u.user_id = v_loan_request.user_id THEN
        'Loan Request Matched'
      ELSE
        'Investment Matched'
    END,
    CASE 
      WHEN u.user_id = v_loan_request.user_id THEN
        format('Your loan request for $%s has been matched with investors', v_loan_request.amount)
      ELSE
        format('Your investment has been matched with a loan request of $%s', v_loan_request.amount)
    END,
    jsonb_build_object(
      'loan_match_id', v_loan_match_id,
      'amount', v_loan_request.amount,
      'interest_rate', v_loan_request.interest_rate,
      'term_months', v_loan_request.term_months
    )
  FROM (
    SELECT v_loan_request.user_id
    UNION
    SELECT user_id FROM investment_offers WHERE id = ANY(p_investment_ids)
  ) u;

  RETURN v_loan_match_id;
END;
$$ LANGUAGE plpgsql; 