-- Insert test investment opportunities
INSERT INTO investment_opportunities (
    title,
    description,
    amount_required,
    interest_rate,
    duration_months,
    risk_level,
    borrower_id,
    status
) VALUES 
(
    'Small Business Expansion Loan',
    'Funding for inventory expansion of a local retail store',
    50000.00,
    12.5,
    12,
    2,
    (SELECT id FROM profiles LIMIT 1), -- This will use the first profile as borrower
    'pending'
),
(
    'Tech Startup Working Capital',
    'Working capital for SaaS startup growth phase',
    100000.00,
    15.0,
    24,
    3,
    (SELECT id FROM profiles LIMIT 1),
    'pending'
),
(
    'Real Estate Development Project',
    'Short-term funding for property renovation',
    75000.00,
    10.0,
    6,
    1,
    (SELECT id FROM profiles LIMIT 1),
    'pending'
);

-- Add some initial balance to the first wallet for testing
UPDATE wallets 
SET balance = 10000.00 
WHERE id = (SELECT id FROM wallets LIMIT 1);

-- Record the deposit transaction
INSERT INTO transactions (
    wallet_id,
    type,
    amount,
    description
) VALUES (
    (SELECT id FROM wallets LIMIT 1),
    'deposit',
    10000.00,
    'Initial test deposit'
); 