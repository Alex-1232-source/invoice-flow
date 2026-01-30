export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      business_profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          bank_account_number: string | null
          bank_ifsc: string | null
          bank_name: string | null
          city: string | null
          created_at: string | null
          email: string | null
          gstin: string | null
          id: string
          invoice_counter: number | null
          invoice_prefix: string | null
          name: string
          pan: string | null
          phone: string | null
          pincode: string | null
          state: Database["public"]["Enums"]["indian_state"] | null
          updated_at: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          bank_account_number?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          invoice_counter?: number | null
          invoice_prefix?: string | null
          name: string
          pan?: string | null
          phone?: string | null
          pincode?: string | null
          state?: Database["public"]["Enums"]["indian_state"] | null
          updated_at?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          bank_account_number?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          invoice_counter?: number | null
          invoice_prefix?: string | null
          name?: string
          pan?: string | null
          phone?: string | null
          pincode?: string | null
          state?: Database["public"]["Enums"]["indian_state"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          business_id: string
          city: string | null
          created_at: string | null
          email: string | null
          gstin: string | null
          id: string
          is_active: boolean | null
          name: string
          pan: string | null
          phone: string | null
          pincode: string | null
          state: Database["public"]["Enums"]["indian_state"] | null
          updated_at: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          business_id: string
          city?: string | null
          created_at?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          pan?: string | null
          phone?: string | null
          pincode?: string | null
          state?: Database["public"]["Enums"]["indian_state"] | null
          updated_at?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          business_id?: string
          city?: string | null
          created_at?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          pan?: string | null
          phone?: string | null
          pincode?: string | null
          state?: Database["public"]["Enums"]["indian_state"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          cgst_amount: number | null
          created_at: string | null
          description: string
          discount_percent: number | null
          gst_rate: Database["public"]["Enums"]["gst_rate"]
          hsn_sac_code: string | null
          id: string
          igst_amount: number | null
          invoice_id: string
          product_id: string | null
          quantity: number
          sgst_amount: number | null
          taxable_amount: number | null
          total_amount: number | null
          unit: string | null
          unit_price: number
        }
        Insert: {
          cgst_amount?: number | null
          created_at?: string | null
          description: string
          discount_percent?: number | null
          gst_rate?: Database["public"]["Enums"]["gst_rate"]
          hsn_sac_code?: string | null
          id?: string
          igst_amount?: number | null
          invoice_id: string
          product_id?: string | null
          quantity?: number
          sgst_amount?: number | null
          taxable_amount?: number | null
          total_amount?: number | null
          unit?: string | null
          unit_price?: number
        }
        Update: {
          cgst_amount?: number | null
          created_at?: string | null
          description?: string
          discount_percent?: number | null
          gst_rate?: Database["public"]["Enums"]["gst_rate"]
          hsn_sac_code?: string | null
          id?: string
          igst_amount?: number | null
          invoice_id?: string
          product_id?: string | null
          quantity?: number
          sgst_amount?: number | null
          taxable_amount?: number | null
          total_amount?: number | null
          unit?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number | null
          business_id: string
          cgst_amount: number | null
          created_at: string | null
          created_by: string | null
          customer_id: string
          due_date: string | null
          id: string
          igst_amount: number | null
          invoice_date: string
          invoice_number: string
          invoice_type: Database["public"]["Enums"]["invoice_type"]
          is_inter_state: boolean | null
          notes: string | null
          place_of_supply: Database["public"]["Enums"]["indian_state"] | null
          sgst_amount: number | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          subtotal: number | null
          terms: string | null
          total_amount: number | null
          total_tax: number | null
          updated_at: string | null
        }
        Insert: {
          amount_paid?: number | null
          business_id: string
          cgst_amount?: number | null
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          due_date?: string | null
          id?: string
          igst_amount?: number | null
          invoice_date?: string
          invoice_number: string
          invoice_type?: Database["public"]["Enums"]["invoice_type"]
          is_inter_state?: boolean | null
          notes?: string | null
          place_of_supply?: Database["public"]["Enums"]["indian_state"] | null
          sgst_amount?: number | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number | null
          terms?: string | null
          total_amount?: number | null
          total_tax?: number | null
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number | null
          business_id?: string
          cgst_amount?: number | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          due_date?: string | null
          id?: string
          igst_amount?: number | null
          invoice_date?: string
          invoice_number?: string
          invoice_type?: Database["public"]["Enums"]["invoice_type"]
          is_inter_state?: boolean | null
          notes?: string | null
          place_of_supply?: Database["public"]["Enums"]["indian_state"] | null
          sgst_amount?: number | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number | null
          terms?: string | null
          total_amount?: number | null
          total_tax?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          reference_number: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          reference_number?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          business_id: string
          created_at: string | null
          description: string | null
          gst_rate: Database["public"]["Enums"]["gst_rate"]
          hsn_sac_code: string | null
          id: string
          is_active: boolean | null
          is_service: boolean | null
          name: string
          unit: string | null
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          description?: string | null
          gst_rate?: Database["public"]["Enums"]["gst_rate"]
          hsn_sac_code?: string | null
          id?: string
          is_active?: boolean | null
          is_service?: boolean | null
          name: string
          unit?: string | null
          unit_price?: number
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          description?: string | null
          gst_rate?: Database["public"]["Enums"]["gst_rate"]
          hsn_sac_code?: string | null
          id?: string
          is_active?: boolean | null
          is_service?: boolean | null
          name?: string
          unit?: string | null
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_id: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          business_id: string
          city: string | null
          created_at: string | null
          email: string | null
          gstin: string | null
          id: string
          is_active: boolean | null
          name: string
          pan: string | null
          phone: string | null
          pincode: string | null
          state: Database["public"]["Enums"]["indian_state"] | null
          updated_at: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          business_id: string
          city?: string | null
          created_at?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          pan?: string | null
          phone?: string | null
          pincode?: string | null
          state?: Database["public"]["Enums"]["indian_state"] | null
          updated_at?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          business_id?: string
          city?: string | null
          created_at?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          pan?: string | null
          phone?: string | null
          pincode?: string | null
          state?: Database["public"]["Enums"]["indian_state"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_modify_data: { Args: never; Returns: boolean }
      get_user_business_id: { Args: never; Returns: string }
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "accountant" | "viewer"
      gst_rate: "0" | "5" | "12" | "18" | "28"
      indian_state:
        | "AN"
        | "AP"
        | "AR"
        | "AS"
        | "BR"
        | "CH"
        | "CT"
        | "DD"
        | "DL"
        | "GA"
        | "GJ"
        | "HP"
        | "HR"
        | "JH"
        | "JK"
        | "KA"
        | "KL"
        | "LA"
        | "LD"
        | "MH"
        | "ML"
        | "MN"
        | "MP"
        | "MZ"
        | "NL"
        | "OD"
        | "PB"
        | "PY"
        | "RJ"
        | "SK"
        | "TN"
        | "TS"
        | "TR"
        | "UK"
        | "UP"
        | "WB"
      invoice_status:
        | "draft"
        | "sent"
        | "paid"
        | "partial"
        | "overdue"
        | "cancelled"
      invoice_type:
        | "tax_invoice"
        | "bill_of_supply"
        | "credit_note"
        | "debit_note"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "accountant", "viewer"],
      gst_rate: ["0", "5", "12", "18", "28"],
      indian_state: [
        "AN",
        "AP",
        "AR",
        "AS",
        "BR",
        "CH",
        "CT",
        "DD",
        "DL",
        "GA",
        "GJ",
        "HP",
        "HR",
        "JH",
        "JK",
        "KA",
        "KL",
        "LA",
        "LD",
        "MH",
        "ML",
        "MN",
        "MP",
        "MZ",
        "NL",
        "OD",
        "PB",
        "PY",
        "RJ",
        "SK",
        "TN",
        "TS",
        "TR",
        "UK",
        "UP",
        "WB",
      ],
      invoice_status: [
        "draft",
        "sent",
        "paid",
        "partial",
        "overdue",
        "cancelled",
      ],
      invoice_type: [
        "tax_invoice",
        "bill_of_supply",
        "credit_note",
        "debit_note",
      ],
    },
  },
} as const
