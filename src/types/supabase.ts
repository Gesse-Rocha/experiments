// ============================================================================
// SUPABASE CONFIGURATION AND TYPES
// ============================================================================

// Types for the Supabase database schema
// Generate these types using: npx supabase gen types typescript --linked > ./types/supabase.ts

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          slug: string;
          subdomain: string;
          logo_url: string | null;
          settings: Record<string, any>;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          subdomain: string;
          logo_url?: string | null;
          settings?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          subdomain?: string;
          logo_url?: string | null;
          settings?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          email: string;
          phone: string | null;
          role: "admin" | "barber" | "customer";
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          company_id: string;
          name: string;
          email: string;
          phone?: string | null;
          role?: "admin" | "barber" | "customer";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          role?: "admin" | "barber" | "customer";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      barbers: {
        Row: {
          id: string;
          company_id: string;
          profile_id: string | null;
          name: string;
          avatar_url: string | null;
          specialties: string[];
          work_hours: Record<string, string | null>;
          days_off: number[];
          whatsapp: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          company_id: string;
          profile_id?: string | null;
          name: string;
          avatar_url?: string | null;
          specialties?: string[];
          work_hours?: Record<string, string | null>;
          days_off?: number[];
          whatsapp?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string;
          profile_id?: string | null;
          name?: string;
          avatar_url?: string | null;
          specialties?: string[];
          work_hours?: Record<string, string | null>;
          days_off?: number[];
          whatsapp?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      services: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          description: string | null;
          price: number;
          duration_minutes: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          description?: string | null;
          price: number;
          duration_minutes: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          duration_minutes?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      appointments: {
        Row: {
          id: string;
          company_id: string;
          barber_id: string;
          customer_name: string;
          customer_email: string | null;
          customer_whatsapp: string;
          start_time: string;
          end_time: string;
          status: "pending" | "confirmed" | "canceled";
          total_price: number | null;
          total_duration: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          canceled_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          company_id: string;
          barber_id: string;
          customer_name: string;
          customer_email?: string | null;
          customer_whatsapp: string;
          start_time: string;
          end_time: string;
          status?: "pending" | "confirmed" | "canceled";
          total_price?: number | null;
          total_duration?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          canceled_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string;
          barber_id?: string;
          customer_name?: string;
          customer_email?: string | null;
          customer_whatsapp?: string;
          start_time?: string;
          end_time?: string;
          status?: "pending" | "confirmed" | "canceled";
          total_price?: number | null;
          total_duration?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          canceled_at?: string | null;
          deleted_at?: string | null;
        };
      };
      payments: {
        Row: {
          id: string;
          company_id: string;
          appointment_id: string;
          method: "pix" | "presential" | "credit_card" | "debit_card";
          status: "pending" | "paid" | "refunded";
          amount: number;
          transaction_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          paid_at: string | null;
          refunded_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          company_id: string;
          appointment_id: string;
          method: "pix" | "presential" | "credit_card" | "debit_card";
          status?: "pending" | "paid" | "refunded";
          amount: number;
          transaction_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          paid_at?: string | null;
          refunded_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string;
          appointment_id?: string;
          method?: "pix" | "presential" | "credit_card" | "debit_card";
          status?: "pending" | "paid" | "refunded";
          amount?: number;
          transaction_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          paid_at?: string | null;
          refunded_at?: string | null;
          deleted_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      update_updated_at_column: {
        Args: Record<PropertyKey, never>;
        Returns: void;
      };
    };
    Enums: {
      role_enum: "admin" | "barber" | "customer";
      appointment_status: "pending" | "confirmed" | "canceled";
      payment_method: "pix" | "presential" | "credit_card" | "debit_card";
      payment_status: "pending" | "paid" | "refunded";
    };
    CompositeTypes: Record<string, never>;
  };
};
