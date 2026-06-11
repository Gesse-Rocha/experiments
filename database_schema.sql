-- ============================================================================
-- BARBERSHOP SaaS - DATABASE SCHEMA
-- Multi-tenant architecture with Row Level Security (RLS)
-- Compatible with PostgreSQL and Supabase
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. COMPANIES TABLE (Tenant Base)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    subdomain VARCHAR(255) UNIQUE NOT NULL,
    logo_url TEXT,
    settings JSONB DEFAULT jsonb_build_object(
        'business_hours', jsonb_build_object(
            'monday', '09:00-18:00',
            'tuesday', '09:00-18:00',
            'wednesday', '09:00-18:00',
            'thursday', '09:00-18:00',
            'friday', '09:00-18:00',
            'saturday', '09:00-13:00',
            'sunday', 'closed'
        ),
        'timezone', 'America/Sao_Paulo',
        'currency', 'BRL'
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT companies_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT companies_slug_not_empty CHECK (length(trim(slug)) > 0),
    CONSTRAINT companies_subdomain_not_empty CHECK (length(trim(subdomain)) > 0)
);

CREATE INDEX idx_companies_slug ON public.companies(slug);
CREATE INDEX idx_companies_subdomain ON public.companies(subdomain);
CREATE INDEX idx_companies_created_at ON public.companies(created_at DESC);

-- ============================================================================
-- 2. PROFILES TABLE (Supabase Auth Integration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'customer',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'barber', 'customer')),
    CONSTRAINT profiles_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT profiles_email_not_empty CHECK (length(trim(email)) > 0)
);

CREATE INDEX idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at DESC);

-- ============================================================================
-- 3. BARBERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.barbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
    work_hours JSONB DEFAULT jsonb_build_object(
        'monday', '09:00-18:00',
        'tuesday', '09:00-18:00',
        'wednesday', '09:00-18:00',
        'thursday', '09:00-18:00',
        'friday', '09:00-18:00',
        'saturday', '09:00-13:00',
        'sunday', NULL
    ),
    days_off INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    whatsapp VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT barbers_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT barbers_days_off_valid CHECK (
        specialties IS NOT NULL AND 
        all(d >= 0 AND d <= 6 FOR ALL d IN days_off)
    )
);

CREATE INDEX idx_barbers_company_id ON public.barbers(company_id);
CREATE INDEX idx_barbers_profile_id ON public.barbers(profile_id);
CREATE INDEX idx_barbers_is_active ON public.barbers(is_active);
CREATE INDEX idx_barbers_created_at ON public.barbers(created_at DESC);

-- ============================================================================
-- 4. SERVICES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT services_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT services_price_positive CHECK (price > 0),
    CONSTRAINT services_duration_positive CHECK (duration_minutes > 0)
);

CREATE INDEX idx_services_company_id ON public.services(company_id);
CREATE INDEX idx_services_is_active ON public.services(is_active);
CREATE INDEX idx_services_created_at ON public.services(created_at DESC);

-- ============================================================================
-- 5. APPOINTMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE RESTRICT,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_whatsapp VARCHAR(20) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    total_price DECIMAL(10, 2),
    total_duration INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    canceled_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT appointments_customer_name_not_empty CHECK (length(trim(customer_name)) > 0),
    CONSTRAINT appointments_status_check CHECK (status IN ('pending', 'confirmed', 'canceled')),
    CONSTRAINT appointments_end_after_start CHECK (end_time > start_time),
    CONSTRAINT appointments_total_price_positive CHECK (total_price IS NULL OR total_price > 0),
    CONSTRAINT appointments_total_duration_positive CHECK (total_duration IS NULL OR total_duration > 0)
);

CREATE INDEX idx_appointments_company_id ON public.appointments(company_id);
CREATE INDEX idx_appointments_barber_id ON public.appointments(barber_id);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_appointments_start_time ON public.appointments(start_time DESC);
CREATE INDEX idx_appointments_customer_whatsapp ON public.appointments(customer_whatsapp);
CREATE INDEX idx_appointments_created_at ON public.appointments(created_at DESC);

-- ============================================================================
-- 6. PAYMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    method VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    amount DECIMAL(10, 2) NOT NULL,
    transaction_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT payments_method_check CHECK (method IN ('pix', 'presential', 'credit_card', 'debit_card')),
    CONSTRAINT payments_status_check CHECK (status IN ('pending', 'paid', 'refunded')),
    CONSTRAINT payments_amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_payments_company_id ON public.payments(company_id);
CREATE INDEX idx_payments_appointment_id ON public.payments(appointment_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_created_at ON public.payments(created_at DESC);

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) SETUP
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. RLS POLICIES
-- ============================================================================

-- COMPANIES POLICIES
-- Admin users can view their own company
CREATE POLICY "Companies - Users can view their own company"
    ON public.companies
    FOR SELECT
    USING (
        id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Admin only can update their company
CREATE POLICY "Companies - Admins can update their company"
    ON public.companies
    FOR UPDATE
    USING (
        id IN (
            SELECT company_id 
            FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        id IN (
            SELECT company_id 
            FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- PROFILES POLICIES
-- Users can view profiles from their company
CREATE POLICY "Profiles - Users can view company profiles"
    ON public.profiles
    FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Users can update their own profile
CREATE POLICY "Profiles - Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Admins can insert new profiles
CREATE POLICY "Profiles - Admins can insert profiles"
    ON public.profiles
    FOR INSERT
    WITH CHECK (
        company_id IN (
            SELECT company_id 
            FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- BARBERS POLICIES
-- Users can view barbers from their company
CREATE POLICY "Barbers - Users can view company barbers"
    ON public.barbers
    FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Admins can manage barbers
CREATE POLICY "Barbers - Admins can insert barbers"
    ON public.barbers
    FOR INSERT
    WITH CHECK (
        company_id IN (
            SELECT company_id 
            FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Barbers - Admins can update barbers"
    ON public.barbers
    FOR UPDATE
    USING (
        company_id IN (
            SELECT company_id 
            FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT company_id 
            FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- SERVICES POLICIES
-- Users can view services from their company
CREATE POLICY "Services - Users can view company services"
    ON public.services
    FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Admins can manage services
CREATE POLICY "Services - Admins can insert services"
    ON public.services
    FOR INSERT
    WITH CHECK (
        company_id IN (
            SELECT company_id 
            FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Services - Admins can update services"
    ON public.services
    FOR UPDATE
    USING (
        company_id IN (
            SELECT company_id 
            FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT company_id 
            FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- APPOINTMENTS POLICIES
-- Users can view appointments from their company
CREATE POLICY "Appointments - Users can view company appointments"
    ON public.appointments
    FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Customers can create appointments
CREATE POLICY "Appointments - Customers can create appointments"
    ON public.appointments
    FOR INSERT
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        ) OR
        -- Allow anonymous customers to create appointments
        auth.uid() IS NULL
    );

-- Barbers and Admins can update appointments
CREATE POLICY "Appointments - Staff can update appointments"
    ON public.appointments
    FOR UPDATE
    USING (
        company_id IN (
            SELECT company_id 
            FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'barber')
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT company_id 
            FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'barber')
        )
    );

-- PAYMENTS POLICIES
-- Users can view payments from their company
CREATE POLICY "Payments - Users can view company payments"
    ON public.payments
    FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Admins can manage payments
CREATE POLICY "Payments - Admins can insert payments"
    ON public.payments
    FOR INSERT
    WITH CHECK (
        company_id IN (
            SELECT company_id 
            FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Payments - Admins can update payments"
    ON public.payments
    FOR UPDATE
    USING (
        company_id IN (
            SELECT company_id 
            FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT company_id 
            FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- 9. HELPER FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_barbers_updated_at BEFORE UPDATE ON public.barbers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 10. SAMPLE DATA (OPTIONAL - For testing)
-- ============================================================================

-- Uncomment below to insert sample data for testing

/*
-- Insert a sample company
INSERT INTO public.companies (name, slug, subdomain)
VALUES ('Barbearia Premium', 'barbearia-premium', 'premium')
ON CONFLICT (slug) DO NOTHING;

-- Get the company_id (adjust UUID as needed)
-- INSERT INTO public.profiles (id, company_id, name, email, phone, role)
-- VALUES (
--     uuid_generate_v4(),
--     (SELECT id FROM public.companies WHERE slug = 'barbearia-premium'),
--     'João Admin',
--     'joao@example.com',
--     '11999999999',
--     'admin'
-- );
*/

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
