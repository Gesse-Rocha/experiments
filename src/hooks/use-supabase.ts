// ============================================================================
// REACT HOOKS - SUPABASE INTEGRATION EXAMPLES
// Use these hooks in your React components for seamless database integration
// ============================================================================

"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase-services";
import type { RealtimeChannel } from "@supabase/supabase-js";

// ============================================================================
// 1. USE APPOINTMENTS HOOK
// ============================================================================

export function useAppointments(companyId: string, barberId?: string) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from("appointments")
          .select("*, barber:barbers(name, avatar_url)")
          .eq("company_id", companyId)
          .is("deleted_at", null)
          .order("start_time", { ascending: false });

        if (barberId) {
          query = query.eq("barber_id", barberId);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setAppointments(data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao buscar agendamentos");
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();

    // Subscribe to real-time changes
    const channel: RealtimeChannel = supabase
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
          if (payload.eventType === "INSERT") {
            setAppointments((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setAppointments((prev) =>
              prev.map((apt) => (apt.id === payload.new.id ? payload.new : apt))
            );
          } else if (payload.eventType === "DELETE") {
            setAppointments((prev) =>
              prev.filter((apt) => apt.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [companyId, barberId]);

  return { appointments, loading, error };
}

// ============================================================================
// 2. USE BARBERS HOOK
// ============================================================================

export function useBarbers(companyId: string) {
  const [barbers, setBarbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("barbers")
          .select("*")
          .eq("company_id", companyId)
          .eq("is_active", true)
          .is("deleted_at", null)
          .order("name");

        if (fetchError) throw fetchError;
        setBarbers(data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao buscar barbeiros");
        setBarbers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBarbers();
  }, [companyId]);

  return { barbers, loading, error };
}

// ============================================================================
// 3. USE SERVICES HOOK
// ============================================================================

export function useServices(companyId: string) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("services")
          .select("*")
          .eq("company_id", companyId)
          .eq("is_active", true)
          .is("deleted_at", null)
          .order("name");

        if (fetchError) throw fetchError;
        setServices(data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao buscar serviços");
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [companyId]);

  return { services, loading, error };
}

// ============================================================================
// 4. USE PAYMENTS HOOK
// ============================================================================

export function usePayments(companyId: string, filters?: { status?: string }) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from("payments")
          .select("*")
          .eq("company_id", companyId)
          .is("deleted_at", null);

        if (filters?.status) {
          query = query.eq("status", filters.status);
        }

        const { data, error: fetchError } = await query.order("created_at", {
          ascending: false,
        });

        if (fetchError) throw fetchError;

        const paymentsList = data || [];
        setPayments(paymentsList);

        // Calculate total
        const sum = paymentsList.reduce((acc, p) => acc + p.amount, 0);
        setTotal(sum);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao buscar pagamentos");
        setPayments([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [companyId, filters?.status]);

  return { payments, total, loading, error };
}

// ============================================================================
// 5. USE CURRENT PROFILE HOOK
// ============================================================================

export function useCurrentProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setProfile(null);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (fetchError) throw fetchError;
        setProfile(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao buscar perfil");
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { profile, loading, error };
}

// ============================================================================
// 6. USE COMPANY HOOK
// ============================================================================

export function useCompany(companyId?: string) {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);

        let id = companyId;

        // If no companyId, get from current user
        if (!id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("company_id")
            .single();

          if (!profile) throw new Error("Perfil não encontrado");
          id = profile.company_id;
        }

        const { data, error: fetchError } = await supabase
          .from("companies")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError) throw fetchError;
        setCompany(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao buscar empresa");
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };

    if (companyId || !companyId) {
      fetchCompany();
    }
  }, [companyId]);

  return { company, loading, error };
}

// ============================================================================
// 7. USE CREATE APPOINTMENT HOOK
// ============================================================================

export function useCreateAppointment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAppointment = useCallback(
    async (appointmentData: any) => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: insertError } = await supabase
          .from("appointments")
          .insert(appointmentData)
          .select()
          .single();

        if (insertError) throw insertError;

        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao criar agendamento";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { createAppointment, loading, error };
}

// ============================================================================
// 8. USE UPDATE APPOINTMENT STATUS HOOK
// ============================================================================

export function useUpdateAppointmentStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = useCallback(
    async (appointmentId: string, status: string) => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: updateError } = await supabase
          .from("appointments")
          .update({ status })
          .eq("id", appointmentId)
          .select()
          .single();

        if (updateError) throw updateError;

        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao atualizar agendamento";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { updateStatus, loading, error };
}

// ============================================================================
// 9. USE AUTH STATE HOOK
// ============================================================================

export function useAuthState() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  return { user, loading };
}

// ============================================================================
// 10. EXAMPLE COMPONENT USAGE
// ============================================================================

/*
// Components/AppointmentsList.tsx
import { useAppointments, useCurrentProfile } from '@/hooks/use-supabase';

export function AppointmentsList() {
  const { profile } = useCurrentProfile();
  const { appointments, loading, error } = useAppointments(profile?.company_id);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h2>Agendamentos</h2>
      {appointments.map((apt) => (
        <div key={apt.id}>
          <p>{apt.customer_name}</p>
          <p>{new Date(apt.start_time).toLocaleString('pt-BR')}</p>
          <p>Status: {apt.status}</p>
        </div>
      ))}
    </div>
  );
}

// Components/CreateAppointment.tsx
import { useCreateAppointment, useCurrentProfile, useBarbers } from '@/hooks/use-supabase';

export function CreateAppointmentForm() {
  const { profile } = useCurrentProfile();
  const { barbers } = useBarbers(profile?.company_id);
  const { createAppointment, loading } = useCreateAppointment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);

    try {
      await createAppointment({
        company_id: profile?.company_id,
        barber_id: formData.get('barber_id'),
        customer_name: formData.get('customer_name'),
        customer_whatsapp: formData.get('customer_whatsapp'),
        start_time: formData.get('start_time'),
        end_time: formData.get('end_time'),
      });

      alert('Agendamento criado com sucesso!');
    } catch (error) {
      alert('Erro ao criar agendamento');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="customer_name" placeholder="Nome do cliente" required />
      <input name="customer_whatsapp" placeholder="WhatsApp" required />
      <select name="barber_id" required>
        {barbers.map((b) => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>
      <input name="start_time" type="datetime-local" required />
      <input name="end_time" type="datetime-local" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Criando...' : 'Criar Agendamento'}
      </button>
    </form>
  );
}
*/
