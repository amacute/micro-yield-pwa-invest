
-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE lending_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid()
        )
    );

-- Deposits table policies
CREATE POLICY "Users can view own deposits" ON deposits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deposits" ON deposits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all deposits" ON deposits
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid()
        )
    );

-- Lending matches policies
CREATE POLICY "Users can view own lending matches" ON lending_matches
    FOR SELECT USING (
        auth.uid() = lender_id OR auth.uid() = borrower_id
    );

CREATE POLICY "Admins can view all lending matches" ON lending_matches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid()
        )
    );

-- Referrals table policies
CREATE POLICY "Users can view own referrals" ON referrals
    FOR SELECT USING (
        auth.uid() = referrer_id OR auth.uid() = referee_id
    );

CREATE POLICY "Users can insert own referrals" ON referrals
    FOR INSERT WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Admins can view all referrals" ON referrals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid()
        )
    );

-- Create admin_users table for proper admin role management
CREATE TABLE IF NOT EXISTS admin_users (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    admin_level text DEFAULT 'admin' CHECK (admin_level IN ('admin', 'super_admin')),
    granted_by uuid REFERENCES auth.users(id),
    granted_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    UNIQUE(user_id)
);

-- Enable RLS on admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admin users policies
CREATE POLICY "Admins can view admin users" ON admin_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid() AND au.is_active = true
        )
    );

CREATE POLICY "Super admins can manage admin users" ON admin_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid() 
            AND au.admin_level = 'super_admin' 
            AND au.is_active = true
        )
    );

-- Insert the default admin user (replace with actual admin user ID when known)
-- This will need to be updated with the actual admin user UUID after registration
INSERT INTO admin_users (user_id, admin_level, granted_at) 
VALUES (
    (SELECT id FROM auth.users WHERE email = 'admin@axiomify.com' LIMIT 1),
    'super_admin',
    now()
) ON CONFLICT (user_id) DO NOTHING;
