CREATE OR REPLACE FUNCTION create_multi_lender_match(
  p_lender_contributions jsonb[],
  p_borrower_id uuid,
  p_total_amount decimal,
  p_purpose text DEFAULT 'P2P Loan'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_match_id uuid;
  v_lender_contribution jsonb;
  v_lending_end_time timestamp;
BEGIN
  -- Set lending end time to 72 hours from now
  v_lending_end_time := NOW() + INTERVAL '72 hours';

  -- Create the main lending match record
  INSERT INTO lending_matches (
    match_id,
    borrower_id,
    total_amount,
    purpose,
    status,
    created_at,
    lending_end_time
  ) VALUES (
    gen_random_uuid(),
    p_borrower_id,
    p_total_amount,
    p_purpose,
    'active',
    NOW(),
    v_lending_end_time
  ) RETURNING match_id INTO v_match_id;

  -- Process each lender's contribution
  FOR v_lender_contribution IN SELECT * FROM jsonb_array_elements(p_lender_contributions::jsonb)
  LOOP
    -- Create lender contribution record
    INSERT INTO lending_match_contributions (
      match_id,
      lender_id,
      amount,
      status,
      created_at,
      lending_end_time
    ) VALUES (
      v_match_id,
      (v_lender_contribution->>'lender_id')::uuid,
      (v_lender_contribution->>'amount')::decimal,
      'active',
      NOW(),
      v_lending_end_time
    );

    -- Update lender's wallet balance
    UPDATE users
    SET 
      wallet_balance = wallet_balance - (v_lender_contribution->>'amount')::decimal,
      lending_end_time = v_lending_end_time
    WHERE user_id = (v_lender_contribution->>'lender_id')::uuid;
  END LOOP;

  -- Update borrower's wallet balance
  UPDATE users
  SET wallet_balance = wallet_balance + p_total_amount
  WHERE user_id = p_borrower_id;

  RETURN jsonb_build_object(
    'success', true,
    'match_id', v_match_id,
    'message', 'Multi-lender P2P match created successfully'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'message', SQLERRM
  );
END;
$$; 