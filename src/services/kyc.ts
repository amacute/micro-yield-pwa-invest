import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export interface KYCVerificationData {
  verificationType: 'basic' | 'advanced';
  documentType: 'passport' | 'national_id' | 'drivers_license';
  documentNumber: string;
  documentExpiry: Date;
  documentFront: File;
  documentBack?: File;
  selfie: File;
  addressProof?: File;
}

export interface KYCStatus {
  verified: boolean;
  level: 'none' | 'basic' | 'advanced';
  verifiedAt: Date | null;
  investmentLimit: number;
  pendingVerification: boolean;
}

export const submitKYCVerification = async (data: KYCVerificationData) => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    // Check if user can attempt verification
    const { data: canAttempt } = await supabase.rpc('can_attempt_kyc_verification', {
      p_user_id: user.id
    });

    if (!canAttempt) {
      toast.error('Too many verification attempts. Please try again in 24 hours.');
      return { error: 'Rate limited' };
    }

    // Upload document front
    const documentFrontPath = `kyc/${user.id}/${Date.now()}_front`;
    const { error: frontError } = await supabase.storage
      .from('kyc-documents')
      .upload(documentFrontPath, data.documentFront);
    if (frontError) throw frontError;

    // Upload document back if provided
    let documentBackPath = '';
    if (data.documentBack) {
      documentBackPath = `kyc/${user.id}/${Date.now()}_back`;
      const { error: backError } = await supabase.storage
        .from('kyc-documents')
        .upload(documentBackPath, data.documentBack);
      if (backError) throw backError;
    }

    // Upload selfie
    const selfiePath = `kyc/${user.id}/${Date.now()}_selfie`;
    const { error: selfieError } = await supabase.storage
      .from('kyc-documents')
      .upload(selfiePath, data.selfie);
    if (selfieError) throw selfieError;

    // Upload address proof if provided
    let addressProofPath = '';
    if (data.addressProof) {
      addressProofPath = `kyc/${user.id}/${Date.now()}_address`;
      const { error: addressError } = await supabase.storage
        .from('kyc-documents')
        .upload(addressProofPath, data.addressProof);
      if (addressError) throw addressError;
    }

    // Create KYC verification record
    const { error: verificationError } = await supabase
      .from('kyc_verifications')
      .insert([{
        user_id: user.id,
        verification_type: data.verificationType,
        document_type: data.documentType,
        document_number: data.documentNumber,
        document_expiry: data.documentExpiry,
        document_front_url: documentFrontPath,
        document_back_url: documentBackPath || null,
        selfie_url: selfiePath,
        address_proof_url: addressProofPath || null
      }]);

    if (verificationError) throw verificationError;

    // Log verification attempt
    await supabase.rpc('log_kyc_verification_attempt', {
      p_user_id: user.id,
      p_status: 'success',
      p_ip_address: window.location.hostname,
      p_user_agent: navigator.userAgent
    });

    toast.success('KYC verification submitted successfully');
    return { success: true };
  } catch (error) {
    console.error('Error submitting KYC verification:', error);
    toast.error('Failed to submit KYC verification');

    // Log failed attempt if possible
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('log_kyc_verification_attempt', {
          p_user_id: user.id,
          p_status: 'failure',
          p_ip_address: window.location.hostname,
          p_user_agent: navigator.userAgent
        });
      }
    } catch (logError) {
      console.error('Error logging failed attempt:', logError);
    }

    return { error };
  }
};

export const getKYCStatus = async (): Promise<KYCStatus> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    // Get user's KYC status
    const { data: userData, error: statusError } = await supabase
      .from('users')
      .select('kyc_verified, kyc_level, kyc_verified_at, investment_limit')
      .eq('user_id', user.id)
      .single();

    if (statusError) throw statusError;

    // Check for pending verification
    const { data: pendingData, error: pendingError } = await supabase
      .from('kyc_verifications')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .limit(1);

    if (pendingError) throw pendingError;

    return {
      verified: userData.kyc_verified,
      level: userData.kyc_level,
      verifiedAt: userData.kyc_verified_at ? new Date(userData.kyc_verified_at) : null,
      investmentLimit: userData.investment_limit,
      pendingVerification: pendingData && pendingData.length > 0
    };
  } catch (error) {
    console.error('Error getting KYC status:', error);
    toast.error('Failed to get KYC status');
    return {
      verified: false,
      level: 'none',
      verifiedAt: null,
      investmentLimit: 1000,
      pendingVerification: false
    };
  }
};

export const getVerificationHistory = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { verifications: data };
  } catch (error) {
    console.error('Error getting verification history:', error);
    toast.error('Failed to get verification history');
    return { error };
  }
}; 