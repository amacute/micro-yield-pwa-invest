export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      investment_accounts: {
        Row: {
          account_number: string
          account_type: string
          created_at: string | null
          id: number
          user_id: string
        }
        Insert: {
          account_number: string
          account_type: string
          created_at?: string | null
          id?: never
          user_id: string
        }
        Update: {
          account_number?: string
          account_type?: string
          created_at?: string | null
          id?: never
          user_id?: string
        }
        Relationships: []
      }
      investments: {
        Row: {
          category: string
          created_at: string
          creator_id: string | null
          description: string
          duration: number
          end_time: string
          goal: number
          id: string
          investors: number
          max_investment: number
          min_investment: number
          raised: number
          return_rate: number
          risk: string
          status: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          creator_id?: string | null
          description: string
          duration: number
          end_time: string
          goal: number
          id?: string
          investors?: number
          max_investment: number
          min_investment: number
          raised?: number
          return_rate: number
          risk: string
          status: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          creator_id?: string | null
          description?: string
          duration?: number
          end_time?: string
          goal?: number
          id?: string
          investors?: number
          max_investment?: number
          min_investment?: number
          raised?: number
          return_rate?: number
          risk?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      p2p_investments: {
        Row: {
          amount: number
          created_at: string
          id: string
          investor_id: string
          loan_id: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          investor_id: string
          loan_id: string
          status: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          investor_id?: string
          loan_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "p2p_investments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "p2p_loans"
            referencedColumns: ["id"]
          },
        ]
      }
      p2p_lending_offers: {
        Row: {
          amount: number
          created_at: string | null
          duration: number
          id: number
          interest_rate: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          duration: number
          id?: never
          interest_rate: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          duration?: number
          id?: never
          interest_rate?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      p2p_loans: {
        Row: {
          amount: number
          borrower_id: string
          created_at: string
          id: string
          interest_rate: number
          purpose: string
          risk: string
          status: string
          term: number
        }
        Insert: {
          amount: number
          borrower_id: string
          created_at?: string
          id?: string
          interest_rate: number
          purpose: string
          risk: string
          status: string
          term: number
        }
        Update: {
          amount?: number
          borrower_id?: string
          created_at?: string
          id?: string
          interest_rate?: number
          purpose?: string
          risk?: string
          status?: string
          term?: number
        }
        Relationships: []
      }
      p2p_matches: {
        Row: {
          borrower_id: string | null
          id: number
          matched_amount: number
          matched_at: string | null
          offer_id: number | null
        }
        Insert: {
          borrower_id?: string | null
          id?: never
          matched_amount: number
          matched_at?: string | null
          offer_id?: number | null
        }
        Update: {
          borrower_id?: string | null
          id?: never
          matched_amount?: number
          matched_at?: string | null
          offer_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "p2p_matches_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "p2p_lending_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      p2p_matching: {
        Row: {
          amount: number
          borrower_id: string
          created_at: string | null
          id: number
          matched_user_id: string
        }
        Insert: {
          amount: number
          borrower_id: string
          created_at?: string | null
          id?: never
          matched_user_id: string
        }
        Update: {
          amount?: number
          borrower_id?: string
          created_at?: string | null
          id?: never
          matched_user_id?: string
        }
        Relationships: []
      }
      p2p_payment: {
        Row: {
          amount: number
          created_at: string | null
          id: number
          receiver_id: string
          sender_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: never
          receiver_id: string
          sender_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: never
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      p2p_payments: {
        Row: {
          admin_id: string | null
          amount: number
          completed_at: string | null
          created_at: string
          id: string
          payee_id: string | null
          payer_id: string | null
          purpose: string | null
          status: string
        }
        Insert: {
          admin_id?: string | null
          amount: number
          completed_at?: string | null
          created_at?: string
          id?: string
          payee_id?: string | null
          payer_id?: string | null
          purpose?: string | null
          status?: string
        }
        Update: {
          admin_id?: string | null
          amount?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          payee_id?: string | null
          payer_id?: string | null
          purpose?: string | null
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string | null
          id: number
          user_id: string | null
          username: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          id?: never
          user_id?: string | null
          username?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          id?: never
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          reference_id: string | null
          status: string
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          reference_id?: string | null
          status?: string
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          reference_id?: string | null
          status?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_investments: {
        Row: {
          amount: number
          created_at: string
          end_date: string
          expected_return: number
          id: string
          investment_id: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          end_date: string
          expected_return: number
          id?: string
          investment_id: string
          status: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          end_date?: string
          expected_return?: number
          id?: string
          investment_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_investments_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string
          device: string
          id: string
          last_active: string
          location: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device: string
          id?: string
          last_active?: string
          location: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device?: string
          id?: string
          last_active?: string
          location?: string
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          country: string | null
          created_at: string
          currency: string | null
          currency_symbol: string | null
          email: string
          id: string
          kyc_verified: boolean
          name: string | null
          passport_url: string | null
          phone: string | null
          profile_image_url: string | null
          two_factor_enabled: boolean | null
          updated_at: string | null
          user_id: string
          wallet_balance: number
        }
        Insert: {
          country?: string | null
          created_at?: string
          currency?: string | null
          currency_symbol?: string | null
          email: string
          id?: string
          kyc_verified?: boolean
          name?: string | null
          passport_url?: string | null
          phone?: string | null
          profile_image_url?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
          wallet_balance?: number
        }
        Update: {
          country?: string | null
          created_at?: string
          currency?: string | null
          currency_symbol?: string | null
          email?: string
          id?: string
          kyc_verified?: boolean
          name?: string | null
          passport_url?: string | null
          phone?: string | null
          profile_image_url?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
          wallet_balance?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_p2p_match: {
        Args: { loan_id: string; investor_ids: string[]; amounts: number[] }
        Returns: Json
      }
      create_p2p_payment: {
        Args:
          | {
              payer_user_id: string
              payee_user_id: string
              payment_amount: number
              payment_purpose?: string
            }
          | { referral_code: string; user_id: number }
          | { sender_id: string; receiver_id: string; amount: number }
        Returns: Json
      }
      is_admin: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
