export interface Company {
  id: string
  company_id?: string
  name: string
  subdomain?: string
  created_at?: string
  updated_at?: string
}

export interface User {
  id: string
  company_id: string
  email: string
  name?: string
  role?: 'admin' | 'staff' | 'client'
  created_at?: string
  updated_at?: string
}

export interface Barber {
  id: string
  company_id: string
  name: string
  bio?: string
  service_ids?: string[]
  created_at?: string
  updated_at?: string
}

export interface Service {
  id: string
  company_id: string
  name: string
  duration_minutes: number
  price_cents: number
  description?: string
  created_at?: string
  updated_at?: string
}

export interface Appointment {
  id: string
  company_id: string
  barber_id: string
  service_id: string
  user_id: string
  start_at: string
  end_at: string
  status: 'scheduled' | 'cancelled' | 'completed'
  notes?: string
  created_at?: string
  updated_at?: string
}
