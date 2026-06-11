// ============================================================================
// SUPABASE DATABASE SERVICE - TypeScript Integration Examples
// ============================================================================

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types/supabase";

// ============================================================================
// 1. SUPABASE CLIENT INITIALIZATION
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// ============================================================================
// 2. TYPES / INTERFACES
// ============================================================================

export interface Company {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  logo_url: string | null;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  company_id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "admin" | "barber" | "customer";
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Barber {
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
}

export interface Service {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
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
}

export interface Payment {
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
}

// ============================================================================
// 3. COMPANIES SERVICE
// ============================================================================

export const companiesService = {
  /**
   * Get current user's company
   */
  async getCurrentCompany(): Promise<Company | null> {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .single();

      if (!profile) return null;

      const { data: company, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", profile.company_id)
        .single();

      if (error) throw error;
      return company;
    } catch (error) {
      console.error("Error fetching company:", error);
      return null;
    }
  },

  /**
   * Get company by slug
   */
  async getCompanyBySlug(slug: string): Promise<Company | null> {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching company by slug:", error);
      return null;
    }
  },

  /**
   * Update company settings
   */
  async updateCompanySettings(
    companyId: string,
    settings: Record<string, any>
  ): Promise<Company | null> {
    try {
      const { data, error } = await supabase
        .from("companies")
        .update({ settings })
        .eq("id", companyId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating company settings:", error);
      return null;
    }
  },
};

// ============================================================================
// 4. PROFILES SERVICE
// ============================================================================

export const profilesService = {
  /**
   * Get current user's profile
   */
  async getCurrentProfile(): Promise<Profile | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  },

  /**
   * Get all profiles in company
   */
  async getCompanyProfiles(companyId: string): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("company_id", companyId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching company profiles:", error);
      return [];
    }
  },

  /**
   * Update profile
   */
  async updateProfile(
    profileId: string,
    updates: Partial<Profile>
  ): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profileId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating profile:", error);
      return null;
    }
  },
};

// ============================================================================
// 5. BARBERS SERVICE
// ============================================================================

export const barbersService = {
  /**
   * Get all active barbers in company
   */
  async getCompanyBarbers(companyId: string): Promise<Barber[]> {
    try {
      const { data, error } = await supabase
        .from("barbers")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("name");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching barbers:", error);
      return [];
    }
  },

  /**
   * Get barber availability for a date
   */
  async getBarberAvailability(
    barberId: string,
    date: Date
  ): Promise<{ available: boolean; reason?: string }> {
    try {
      const { data: barber, error: barberError } = await supabase
        .from("barbers")
        .select("work_hours, days_off")
        .eq("id", barberId)
        .single();

      if (barberError) throw barberError;

      const dayOfWeek = date.getDay();
      const dayName = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ][dayOfWeek];

      // Check if it's a day off
      if (barber.days_off?.includes(dayOfWeek)) {
        return { available: false, reason: "Dia de folga" };
      }

      // Check if working hours are null (closed)
      if (!barber.work_hours[dayName]) {
        return { available: false, reason: "Fechado neste dia" };
      }

      return { available: true };
    } catch (error) {
      console.error("Error checking barber availability:", error);
      return { available: false, reason: "Erro ao verificar disponibilidade" };
    }
  },

  /**
   * Create barber
   */
  async createBarber(
    companyId: string,
    barber: Omit<Barber, "id" | "created_at" | "updated_at" | "deleted_at">
  ): Promise<Barber | null> {
    try {
      const { data, error } = await supabase
        .from("barbers")
        .insert({ ...barber, company_id: companyId })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating barber:", error);
      return null;
    }
  },

  /**
   * Update barber
   */
  async updateBarber(
    barberId: string,
    updates: Partial<Barber>
  ): Promise<Barber | null> {
    try {
      const { data, error } = await supabase
        .from("barbers")
        .update(updates)
        .eq("id", barberId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating barber:", error);
      return null;
    }
  },
};

// ============================================================================
// 6. SERVICES SERVICE
// ============================================================================

export const servicesService = {
  /**
   * Get all active services in company
   */
  async getCompanyServices(companyId: string): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("name");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching services:", error);
      return [];
    }
  },

  /**
   * Create service
   */
  async createService(
    companyId: string,
    service: Omit<Service, "id" | "company_id" | "created_at" | "updated_at" | "deleted_at">
  ): Promise<Service | null> {
    try {
      const { data, error } = await supabase
        .from("services")
        .insert({ ...service, company_id: companyId })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating service:", error);
      return null;
    }
  },

  /**
   * Update service
   */
  async updateService(
    serviceId: string,
    updates: Partial<Service>
  ): Promise<Service | null> {
    try {
      const { data, error } = await supabase
        .from("services")
        .update(updates)
        .eq("id", serviceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating service:", error);
      return null;
    }
  },
};

// ============================================================================
// 7. APPOINTMENTS SERVICE
// ============================================================================

export const appointmentsService = {
  /**
   * Get appointments for company
   */
  async getCompanyAppointments(
    companyId: string,
    filters?: {
      barberId?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<Appointment[]> {
    try {
      let query = supabase
        .from("appointments")
        .select(
          `
          *,
          barber:barbers(id, name),
          payment:payments(id, status, amount)
        `
        )
        .eq("company_id", companyId)
        .is("deleted_at", null);

      if (filters?.barberId) {
        query = query.eq("barber_id", filters.barberId);
      }

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      if (filters?.startDate) {
        query = query.gte(
          "start_time",
          filters.startDate.toISOString()
        );
      }

      if (filters?.endDate) {
        query = query.lte("end_time", filters.endDate.toISOString());
      }

      const { data, error } = await query.order("start_time", {
        ascending: false,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return [];
    }
  },

  /**
   * Create appointment
   */
  async createAppointment(
    appointment: Omit<Appointment, "id" | "created_at" | "updated_at" | "deleted_at">
  ): Promise<Appointment | null> {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .insert(appointment)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating appointment:", error);
      return null;
    }
  },

  /**
   * Update appointment status
   */
  async updateAppointmentStatus(
    appointmentId: string,
    status: "pending" | "confirmed" | "canceled"
  ): Promise<Appointment | null> {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .update({
          status,
          ...(status === "canceled" && { canceled_at: new Date().toISOString() }),
        })
        .eq("id", appointmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating appointment:", error);
      return null;
    }
  },

  /**
   * Get appointment with related data
   */
  async getAppointmentDetails(appointmentId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          `
          *,
          barber:barbers(id, name, avatar_url),
          payment:payments(id, status, amount, method)
        `
        )
        .eq("id", appointmentId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching appointment details:", error);
      return null;
    }
  },
};

// ============================================================================
// 8. PAYMENTS SERVICE
// ============================================================================

export const paymentsService = {
  /**
   * Get payments for company
   */
  async getCompanyPayments(
    companyId: string,
    filters?: { status?: string; startDate?: Date; endDate?: Date }
  ): Promise<Payment[]> {
    try {
      let query = supabase
        .from("payments")
        .select("*")
        .eq("company_id", companyId)
        .is("deleted_at", null);

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      if (filters?.startDate) {
        query = query.gte("created_at", filters.startDate.toISOString());
      }

      if (filters?.endDate) {
        query = query.lte("created_at", filters.endDate.toISOString());
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching payments:", error);
      return [];
    }
  },

  /**
   * Create payment
   */
  async createPayment(
    payment: Omit<Payment, "id" | "created_at" | "updated_at" | "deleted_at" | "paid_at" | "refunded_at">
  ): Promise<Payment | null> {
    try {
      const { data, error } = await supabase
        .from("payments")
        .insert(payment)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating payment:", error);
      return null;
    }
  },

  /**
   * Mark payment as paid
   */
  async markPaymentAsPaid(paymentId: string): Promise<Payment | null> {
    try {
      const { data, error } = await supabase
        .from("payments")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", paymentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error marking payment as paid:", error);
      return null;
    }
  },

  /**
   * Refund payment
   */
  async refundPayment(paymentId: string): Promise<Payment | null> {
    try {
      const { data, error } = await supabase
        .from("payments")
        .update({ status: "refunded", refunded_at: new Date().toISOString() })
        .eq("id", paymentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error refunding payment:", error);
      return null;
    }
  },

  /**
   * Get revenue statistics
   */
  async getRevenueStats(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    total: number;
    count: number;
    average: number;
  }> {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("amount")
        .eq("company_id", companyId)
        .eq("status", "paid")
        .gte("paid_at", startDate.toISOString())
        .lte("paid_at", endDate.toISOString());

      if (error) throw error;

      const payments = data || [];
      const total = payments.reduce((sum, p) => sum + p.amount, 0);

      return {
        total,
        count: payments.length,
        average: payments.length > 0 ? total / payments.length : 0,
      };
    } catch (error) {
      console.error("Error fetching revenue stats:", error);
      return { total: 0, count: 0, average: 0 };
    }
  },
};

// ============================================================================
// 9. REAL-TIME SUBSCRIPTIONS
// ============================================================================

export const subscriptionsService = {
  /**
   * Subscribe to appointments changes
   */
  subscribeToAppointments(companyId: string, onUpdate: (data: any) => void) {
    return supabase
      .channel(`appointments:${companyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          onUpdate(payload);
        }
      )
      .subscribe();
  },

  /**
   * Subscribe to payments changes
   */
  subscribeToPayments(companyId: string, onUpdate: (data: any) => void) {
    return supabase
      .channel(`payments:${companyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payments",
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          onUpdate(payload);
        }
      )
      .subscribe();
  },
};

// ============================================================================
// 10. EXPORT ALL SERVICES
// ============================================================================

export default {
  companiesService,
  profilesService,
  barbersService,
  servicesService,
  appointmentsService,
  paymentsService,
  subscriptionsService,
};
