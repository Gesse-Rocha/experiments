-- ============================================================================
-- USEFUL QUERIES FOR DEVELOPMENT AND REPORTS
-- Copy and adapt these queries for your needs
-- ============================================================================

-- ============================================================================
-- 1. COMPANY ANALYTICS
-- ============================================================================

-- Get company overview
SELECT 
    c.id,
    c.name,
    c.slug,
    c.subdomain,
    COUNT(DISTINCT p.id) as total_users,
    COUNT(DISTINCT CASE WHEN p.role = 'barber' THEN p.id END) as total_barbers,
    COUNT(DISTINCT CASE WHEN p.role = 'admin' THEN p.id END) as total_admins,
    COUNT(DISTINCT a.id) as total_appointments,
    COALESCE(SUM(CASE WHEN pay.status = 'paid' THEN pay.amount ELSE 0 END), 0) as total_revenue
FROM public.companies c
LEFT JOIN public.profiles p ON c.id = p.company_id AND p.deleted_at IS NULL
LEFT JOIN public.appointments a ON c.id = a.company_id AND a.deleted_at IS NULL
LEFT JOIN public.payments pay ON c.id = pay.company_id AND pay.status = 'paid'
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.name, c.slug, c.subdomain
ORDER BY c.created_at DESC;

-- ============================================================================
-- 2. APPOINTMENT ANALYTICS
-- ============================================================================

-- Get appointments for a specific date
SELECT 
    a.id,
    a.customer_name,
    a.customer_whatsapp,
    b.name as barber_name,
    a.start_time,
    a.end_time,
    a.status,
    COALESCE(a.total_price, 0) as price,
    s.name as service_name
FROM public.appointments a
JOIN public.barbers b ON a.barber_id = b.id
LEFT JOIN public.payments p ON a.id = p.appointment_id
LEFT JOIN public.services s ON p.appointment_id = a.id
WHERE a.company_id = '{{company_id}}'
    AND a.deleted_at IS NULL
    AND DATE(a.start_time) = CURRENT_DATE
ORDER BY a.start_time ASC;

-- Get appointments by status
SELECT 
    a.status,
    COUNT(*) as total,
    COALESCE(SUM(a.total_price), 0) as total_revenue
FROM public.appointments a
WHERE a.company_id = '{{company_id}}'
    AND a.deleted_at IS NULL
GROUP BY a.status
ORDER BY total DESC;

-- Get cancelled appointments (last 30 days)
SELECT 
    a.id,
    a.customer_name,
    a.customer_whatsapp,
    b.name as barber_name,
    a.start_time,
    a.canceled_at,
    a.notes
FROM public.appointments a
JOIN public.barbers b ON a.barber_id = b.id
WHERE a.company_id = '{{company_id}}'
    AND a.deleted_at IS NULL
    AND a.status = 'canceled'
    AND a.canceled_at >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY a.canceled_at DESC;

-- ============================================================================
-- 3. BARBER PERFORMANCE
-- ============================================================================

-- Barber workload (appointments per barber)
SELECT 
    b.id,
    b.name,
    COUNT(a.id) as total_appointments,
    COUNT(CASE WHEN a.status = 'confirmed' THEN 1 END) as confirmed,
    COUNT(CASE WHEN a.status = 'canceled' THEN 1 END) as canceled,
    ROUND(COUNT(CASE WHEN a.status = 'confirmed' THEN 1 END)::NUMERIC / 
        NULLIF(COUNT(a.id), 0) * 100, 2) as confirmation_rate,
    COALESCE(SUM(CASE WHEN a.status = 'confirmed' THEN a.total_price ELSE 0 END), 0) as revenue
FROM public.barbers b
LEFT JOIN public.appointments a ON b.id = a.barber_id AND a.deleted_at IS NULL
WHERE b.company_id = '{{company_id}}'
    AND b.deleted_at IS NULL
GROUP BY b.id, b.name
ORDER BY total_appointments DESC;

-- Barber availability (free slots for next 7 days)
SELECT 
    b.id,
    b.name,
    DATE(gs.date) as available_date,
    gs.hour,
    COUNT(a.id) as booked_slots
FROM public.barbers b
CROSS JOIN LATERAL generate_series(
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '7 days',
    INTERVAL '1 day'
) AS gs(date)
CROSS JOIN LATERAL generate_series(9, 18, 1) AS hour
LEFT JOIN public.appointments a ON b.id = a.barber_id
    AND DATE(a.start_time) = gs.date
    AND EXTRACT(HOUR FROM a.start_time) = hour
    AND a.status IN ('pending', 'confirmed')
    AND a.deleted_at IS NULL
WHERE b.company_id = '{{company_id}}'
    AND b.is_active = TRUE
    AND b.deleted_at IS NULL
    AND gs.date >= CURRENT_DATE
GROUP BY b.id, b.name, gs.date, hour
ORDER BY b.name, gs.date, hour;

-- ============================================================================
-- 4. REVENUE ANALYTICS
-- ============================================================================

-- Daily revenue
SELECT 
    DATE(p.paid_at) as revenue_date,
    COUNT(*) as total_transactions,
    SUM(p.amount) as total_revenue,
    AVG(p.amount) as average_transaction,
    MIN(p.amount) as min_transaction,
    MAX(p.amount) as max_transaction
FROM public.payments p
WHERE p.company_id = '{{company_id}}'
    AND p.status = 'paid'
    AND p.deleted_at IS NULL
GROUP BY DATE(p.paid_at)
ORDER BY revenue_date DESC;

-- Monthly revenue summary
SELECT 
    DATE_TRUNC('month', p.paid_at)::DATE as month,
    COUNT(*) as total_transactions,
    SUM(p.amount) as total_revenue,
    COUNT(DISTINCT p.appointment_id) as unique_appointments
FROM public.payments p
WHERE p.company_id = '{{company_id}}'
    AND p.status = 'paid'
    AND p.deleted_at IS NULL
GROUP BY DATE_TRUNC('month', p.paid_at)
ORDER BY month DESC;

-- Revenue by payment method
SELECT 
    p.method,
    COUNT(*) as total_transactions,
    SUM(p.amount) as total_revenue,
    ROUND(SUM(p.amount)::NUMERIC / (SELECT SUM(amount) FROM public.payments 
        WHERE company_id = '{{company_id}}' AND status = 'paid' AND deleted_at IS NULL) * 100, 2) as percentage
FROM public.payments p
WHERE p.company_id = '{{company_id}}'
    AND p.status = 'paid'
    AND p.deleted_at IS NULL
GROUP BY p.method
ORDER BY total_revenue DESC;

-- Refunds summary
SELECT 
    DATE(p.refunded_at) as refund_date,
    COUNT(*) as total_refunds,
    SUM(p.amount) as total_refunded
FROM public.payments p
WHERE p.company_id = '{{company_id}}'
    AND p.status = 'refunded'
    AND p.deleted_at IS NULL
GROUP BY DATE(p.refunded_at)
ORDER BY refund_date DESC;

-- ============================================================================
-- 5. CUSTOMER ANALYTICS
-- ============================================================================

-- Top customers (by appointment frequency)
SELECT 
    a.customer_whatsapp,
    a.customer_name,
    COUNT(a.id) as total_appointments,
    COUNT(CASE WHEN a.status = 'confirmed' THEN 1 END) as confirmed_appointments,
    COALESCE(SUM(a.total_price), 0) as total_spent,
    MAX(a.created_at) as last_appointment
FROM public.appointments a
WHERE a.company_id = '{{company_id}}'
    AND a.deleted_at IS NULL
GROUP BY a.customer_whatsapp, a.customer_name
HAVING COUNT(a.id) >= 3
ORDER BY total_appointments DESC
LIMIT 20;

-- Customers by status
SELECT 
    a.status,
    COUNT(DISTINCT a.customer_whatsapp) as unique_customers,
    COUNT(a.id) as total_appointments
FROM public.appointments a
WHERE a.company_id = '{{company_id}}'
    AND a.deleted_at IS NULL
GROUP BY a.status;

-- ============================================================================
-- 6. SERVICE ANALYTICS
-- ============================================================================

-- Service popularity (by appointment count)
SELECT 
    s.id,
    s.name,
    s.price,
    s.duration_minutes,
    COUNT(a.id) as times_booked,
    COALESCE(SUM(a.total_price), 0) as total_revenue,
    ROUND(COUNT(a.id)::NUMERIC / 
        (SELECT COUNT(*) FROM public.appointments 
         WHERE company_id = '{{company_id}}' AND deleted_at IS NULL) * 100, 2) as percentage
FROM public.services s
LEFT JOIN public.appointments a ON s.id = a.id -- Note: Adjust if you have a service_id in appointments
WHERE s.company_id = '{{company_id}}'
    AND s.deleted_at IS NULL
GROUP BY s.id, s.name, s.price, s.duration_minutes
ORDER BY times_booked DESC;

-- ============================================================================
-- 7. STAFF MANAGEMENT
-- ============================================================================

-- Active staff (admin + barbers)
SELECT 
    p.id,
    p.name,
    p.email,
    p.phone,
    p.role,
    p.created_at,
    CASE 
        WHEN p.role = 'barber' THEN (SELECT is_active FROM public.barbers WHERE profile_id = p.id LIMIT 1)
        ELSE NULL
    END as is_active
FROM public.profiles p
WHERE p.company_id = '{{company_id}}'
    AND p.deleted_at IS NULL
    AND p.role IN ('admin', 'barber')
ORDER BY p.created_at DESC;

-- ============================================================================
-- 8. DATA QUALITY CHECKS
-- ============================================================================

-- Find appointments without payments
SELECT 
    a.id,
    a.customer_name,
    a.start_time,
    a.status
FROM public.appointments a
LEFT JOIN public.payments p ON a.id = p.appointment_id
WHERE a.company_id = '{{company_id}}'
    AND a.deleted_at IS NULL
    AND a.status = 'confirmed'
    AND p.id IS NULL;

-- Find payments without appointments
SELECT 
    p.id,
    p.appointment_id,
    p.amount,
    p.created_at
FROM public.payments p
LEFT JOIN public.appointments a ON p.appointment_id = a.id
WHERE p.company_id = '{{company_id}}'
    AND p.deleted_at IS NULL
    AND a.id IS NULL;

-- Find barbers without active appointments
SELECT 
    b.id,
    b.name,
    COUNT(a.id) as total_appointments
FROM public.barbers b
LEFT JOIN public.appointments a ON b.id = a.barber_id AND a.deleted_at IS NULL
WHERE b.company_id = '{{company_id}}'
    AND b.deleted_at IS NULL
GROUP BY b.id, b.name
HAVING COUNT(a.id) = 0;

-- ============================================================================
-- 9. TIMING ANALYTICS
-- ============================================================================

-- Peak hours (when most appointments are scheduled)
SELECT 
    EXTRACT(HOUR FROM a.start_time)::INT as hour_of_day,
    COUNT(*) as total_appointments,
    ROUND(AVG(a.total_price)::NUMERIC, 2) as avg_price
FROM public.appointments a
WHERE a.company_id = '{{company_id}}'
    AND a.deleted_at IS NULL
    AND a.status IN ('pending', 'confirmed')
GROUP BY EXTRACT(HOUR FROM a.start_time)
ORDER BY hour_of_day;

-- Busiest days of week
SELECT 
    CASE EXTRACT(DOW FROM a.start_time)::INT
        WHEN 0 THEN 'Sunday'
        WHEN 1 THEN 'Monday'
        WHEN 2 THEN 'Tuesday'
        WHEN 3 THEN 'Wednesday'
        WHEN 4 THEN 'Thursday'
        WHEN 5 THEN 'Friday'
        WHEN 6 THEN 'Saturday'
    END as day_of_week,
    COUNT(*) as total_appointments,
    ROUND(AVG(EXTRACT(EPOCH FROM (a.end_time - a.start_time)) / 60)::NUMERIC, 0) as avg_duration_minutes
FROM public.appointments a
WHERE a.company_id = '{{company_id}}'
    AND a.deleted_at IS NULL
    AND a.status IN ('pending', 'confirmed')
GROUP BY EXTRACT(DOW FROM a.start_time)
ORDER BY EXTRACT(DOW FROM a.start_time);

-- ============================================================================
-- 10. CLEANUP QUERIES (Use with caution!)
-- ============================================================================

-- WARNING: These queries modify data. Always backup first!

-- Soft delete old cancelled appointments (older than 90 days)
-- UPDATE public.appointments 
-- SET deleted_at = NOW()
-- WHERE company_id = '{{company_id}}'
--   AND status = 'canceled'
--   AND canceled_at < CURRENT_DATE - INTERVAL '90 days'
--   AND deleted_at IS NULL;

-- Archive payments older than 1 year
-- UPDATE public.payments
-- SET deleted_at = NOW()
-- WHERE company_id = '{{company_id}}'
--   AND created_at < CURRENT_DATE - INTERVAL '1 year'
--   AND deleted_at IS NULL;

-- ============================================================================
-- END OF QUERIES
-- ============================================================================

-- Replace {{company_id}} with your actual company UUID
-- Example: '550e8400-e29b-41d4-a716-446655440000'
