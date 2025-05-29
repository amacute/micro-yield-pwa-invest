import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { TypedSupabaseClient, KYCStatus, KYCStatusInsert } from '../types/supabase'

class KYCService {
  private supabase: TypedSupabaseClient

  constructor() {
    this.supabase = createClientComponentClient()
  }

  async getKYCStatus(userId: string) {
    const { data, error } = await this.supabase
      .from('kyc_status')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data as KYCStatus
  }

  async submitKYC(kycData: KYCStatusInsert) {
    const { data, error } = await this.supabase
      .from('kyc_status')
      .insert(kycData)
      .select()
      .single()

    if (error) throw error
    return data as KYCStatus
  }

  async updateKYCStatus(userId: string, status: string, verificationDetails?: object) {
    const { data, error } = await this.supabase
      .from('kyc_status')
      .update({
        status,
        verification_details: verificationDetails,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data as KYCStatus
  }

  async uploadDocument(userId: string, file: File, documentType: string) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${documentType}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await this.supabase
      .storage
      .from('kyc-documents')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl }, error: urlError } = await this.supabase
      .storage
      .from('kyc-documents')
      .getPublicUrl(fileName)

    if (urlError) throw urlError

    return publicUrl
  }
}

export const kycService = new KYCService() 