-- Create KYC verification table
CREATE TABLE IF NOT EXISTS kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id),
  status TEXT NOT NULL DEFAULT 'pending',
  verification_type TEXT NOT NULL,
  document_type TEXT NOT NULL,
  document_number TEXT NOT NULL,
  document_expiry DATE,
  document_front_url TEXT,
  document_back_url TEXT,
  selfie_url TEXT,
  address_proof_url TEXT,
  rejection_reason TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_by UUID REFERENCES users(user_id),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected')),
  CONSTRAINT valid_verification_type CHECK (verification_type IN ('basic', 'advanced')),
  CONSTRAINT valid_document_type CHECK (document_type IN ('passport', 'national_id', 'drivers_license'))
);

-- Create KYC verification attempts tracking
CREATE TABLE IF NOT EXISTS kyc_verification_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id),
  attempt_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  CONSTRAINT valid_attempt_status CHECK (status IN ('success', 'failure'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_user_id ON kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_status ON kyc_verifications(status);
CREATE INDEX IF NOT EXISTS idx_kyc_verification_attempts_user_id ON kyc_verification_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verification_attempts_date ON kyc_verification_attempts(attempt_date);

-- Add KYC-related columns to users table if they don't exist
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS kyc_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS kyc_level TEXT DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS kyc_verified_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS investment_limit DECIMAL DEFAULT 1000,
  CONSTRAINT valid_kyc_level CHECK (kyc_level IN ('none', 'basic', 'advanced'));

-- Function to update user's KYC status and investment limit
CREATE OR REPLACE FUNCTION update_user_kyc_status(
  p_user_id UUID,
  p_status TEXT,
  p_verification_type TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user's KYC status
  UPDATE users
  SET 
    kyc_verified = (p_status = 'approved'),
    kyc_level = CASE 
      WHEN p_status = 'approved' THEN p_verification_type
      ELSE 'none'
    END,
    kyc_verified_at = CASE 
      WHEN p_status = 'approved' THEN NOW()
      ELSE NULL
    END,
    investment_limit = CASE
      WHEN p_status = 'approved' AND p_verification_type = 'basic' THEN 5000
      WHEN p_status = 'approved' AND p_verification_type = 'advanced' THEN 50000
      ELSE 1000
    END
  WHERE user_id = p_user_id;
END;
$$;

-- Function to check if user can attempt KYC verification
CREATE OR REPLACE FUNCTION can_attempt_kyc_verification(
  p_user_id UUID
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_recent_attempts INTEGER;
  v_last_attempt TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get number of attempts in last 24 hours
  SELECT COUNT(*), MAX(attempt_date)
  INTO v_recent_attempts, v_last_attempt
  FROM kyc_verification_attempts
  WHERE user_id = p_user_id
    AND attempt_date > NOW() - INTERVAL '24 hours';

  -- If user has made 3 or more attempts in last 24 hours, check cooldown
  IF v_recent_attempts >= 3 THEN
    -- Must wait 24 hours from last attempt
    RETURN v_last_attempt < NOW() - INTERVAL '24 hours';
  END IF;

  RETURN TRUE;
END;
$$;

-- Function to log KYC verification attempt
CREATE OR REPLACE FUNCTION log_kyc_verification_attempt(
  p_user_id UUID,
  p_status TEXT,
  p_ip_address TEXT,
  p_user_agent TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO kyc_verification_attempts (
    user_id,
    status,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_status,
    p_ip_address,
    p_user_agent
  );
END;
$$; 