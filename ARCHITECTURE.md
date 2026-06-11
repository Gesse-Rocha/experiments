# 🏗️ Arquitetura do Sistema - Barbershop SaaS

## 📊 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React Components                                         │  │
│  │  ┌──────────────────────────────────────────────────┐    │  │
│  │  │ useAppointments()                               │    │  │
│  │  │ useBarbers()                                    │    │  │
│  │  │ useServices()                                   │    │  │
│  │  │ usePayments()                                   │    │  │
│  │  └──────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓ (HTTPS)                             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│              SUPABASE (Backend as a Service)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Auth Service (Autenticação)                            │  │
│  │  - Email/Password                                       │  │
│  │  - JWT Tokens                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  REST API (supabase-js SDK)                             │  │
│  │  - CRUD Operations                                      │  │
│  │  - Real-time Subscriptions                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Row Level Security (RLS)                               │  │
│  │  - Policy Enforcement                                   │  │
│  │  - company_id Isolation                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                   POSTGRESQL DATABASE                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  companies                profiles        barbers        │  │
│  │  ┌────────────┐       ┌────────────┐   ┌─────────────┐  │  │
│  │  │ id         │───────│ id         │──┐│ id          │  │  │
│  │  │ name       │       │company_id  │ ││ company_id  │  │  │
│  │  │ slug       │       │ name       │ ││ profile_id  │  │  │
│  │  │ settings   │       │ role       │ ││ name        │  │  │
│  │  └────────────┘       └────────────┘ ││ specialties │  │  │
│  │         ↓                    ↑        │└─────────────┘  │  │
│  │  ┌──────────────┐   ┌────────────────┴───┐              │  │
│  │  │ services     │   │ appointments       │              │  │
│  │  ├──────────────┤   ├────────────────────┤              │  │
│  │  │ id           │   │ id                 │              │  │
│  │  │ company_id   │   │ company_id         │              │  │
│  │  │ name         │   │ barber_id ────────┐│              │  │
│  │  │ price        │   │ customer_name     ││              │  │
│  │  │ duration     │   │ start_time        ││              │  │
│  │  └──────────────┘   │ status            ││              │  │
│  │         ↑            │ total_price       ││              │  │
│  │         │            └────────────────────┘              │  │
│  │  ┌──────────────────┐        ↓                          │  │
│  │  │ payments         │   ┌──────────┐                   │  │
│  │  ├──────────────────┤   │ Triggers │                   │  │
│  │  │ id               │   ├──────────┤                   │  │
│  │  │ company_id       │   │updated_at│                   │  │
│  │  │ appointment_id ──┼──→ sync     │                   │  │
│  │  │ amount           │   └──────────┘                   │  │
│  │  │ status           │                                   │  │
│  │  └──────────────────┘                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Multi-Tenant Security Architecture

```
┌─────────────────────────────────────────────────────┐
│  User (company_id = "COMPANY_A")                   │
│  ├─ Role: admin                                     │
│  └─ Can access: Data from COMPANY_A only           │
└─────────────────────────────────────────────────────┘
        ↓ (Select query)
┌─────────────────────────────────────────────────────┐
│  RLS Policy (Row Level Security)                   │
│  ├─ Check: company_id == user's company_id        │
│  └─ Result: ✅ Allow                              │
└─────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────┐
│  Query Result: Only COMPANY_A data returned        │
└─────────────────────────────────────────────────────┘

---

┌─────────────────────────────────────────────────────┐
│  User (company_id = "COMPANY_A")                   │
│  └─ Trying to access: Data from COMPANY_B         │
└─────────────────────────────────────────────────────┘
        ↓ (Malicious query)
┌─────────────────────────────────────────────────────┐
│  RLS Policy (Row Level Security)                   │
│  ├─ Check: company_id == user's company_id        │
│  └─ Result: ❌ DENY                               │
└─────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────┐
│  Error: "No rows returned" (zero rows)             │
│  Database is protected! ✅                         │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Fluxo de Dados: Criar Agendamento

```
┌─────────────────┐
│  React Component│
│  "Agendar"      │
└────────┬────────┘
         │
         ↓ (Chama Hook)
┌─────────────────────────────────┐
│ useCreateAppointment()          │
│ (src/hooks/use-supabase.ts)    │
└────────┬────────────────────────┘
         │ (Validação no Frontend)
         │ ✓ Dados obrigatórios
         │ ✓ Formato correto
         │
         ↓
┌─────────────────────────────────┐
│ appointmentsService             │
│ .createAppointment({...})       │
│ (src/lib/supabase-services.ts) │
└────────┬────────────────────────┘
         │ (Utiliza Supabase SDK)
         │
         ↓ (HTTPS POST)
┌─────────────────────────────────┐
│ Supabase REST API               │
│ POST /rest/v1/appointments      │
└────────┬────────────────────────┘
         │ (JWT Authentication)
         │ ✓ Token verificado
         │
         ↓
┌─────────────────────────────────┐
│ PostgreSQL (RLS Policy)         │
│ 1. Auth check (JWT decode)      │
│ 2. Company_id check             │
│ 3. Role check (INSERT permission)
│ 4. Constraints validation       │
└────────┬────────────────────────┘
         │ (✓ Todas validações OK)
         │
         ↓
┌─────────────────────────────────┐
│ INSERT INTO appointments        │
│ Trigger: update_updated_at()    │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│ Response: New Appointment       │
│ {"id": "123", "status": ...}   │
└────────┬────────────────────────┘
         │ (HTTPS Response)
         │
         ↓
┌─────────────────────────────────┐
│ supabase-js (SDK)               │
│ Deserialize JSON                │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│ React State Update              │
│ const [apt, setApt] = useState()│
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│ Component Re-render             │
│ Display: "Agendamento criado!"  │
└─────────────────────────────────┘
```

---

## 🔄 Fluxo de Autenticação e RLS

```
┌──────────────────────────┐
│ 1. User Signup           │
│ Email: joao@example.com  │
│ Password: ****           │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ Supabase Auth Service                │
│ - Hash password                      │
│ - Generate JWT                       │
│ - Create auth.users record           │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ Trigger: Auto-create profile         │
│ INSERT INTO profiles (id, ...)       │
│ ├─ id = auth.users.id                │
│ ├─ company_id = assigned by admin    │
│ └─ role = 'customer'                 │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ 2. User Login                        │
│ Email + Password                     │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ Supabase Auth Verify                 │
│ ✓ Password matches                   │
│ ✓ JWT token generated                │
│ ✓ Session established                │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ 3. Query Data with Auth              │
│ GET appointments (with JWT token)    │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ Supabase RLS Engine                  │
│ ├─ Decode JWT → Extract user_id      │
│ ├─ Get profile → Extract company_id  │
│ └─ Apply policy:                     │
│   WHERE company_id = 'user_company'  │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ PostgreSQL Query                     │
│ SELECT * FROM appointments           │
│ WHERE company_id = 'COMPANY_A'       │
│ AND deleted_at IS NULL               │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ Result: Only COMPANY_A appointments  │
│ (Other companies' data hidden)       │
└──────────────────────────────────────┘
```

---

## 🏗️ Camadas da Aplicação

```
┌───────────────────────────────────────────────────────┐
│  Layer 1: UI/UX (React Components)                   │
│  ├─ Appointments List                                │
│  ├─ Barber Selection                                 │
│  ├─ Payment Form                                     │
│  └─ Admin Dashboard                                  │
└───────────────────────────────────────────────────────┘
                        ↑↓
┌───────────────────────────────────────────────────────┐
│  Layer 2: State Management (React Hooks)            │
│  ├─ useAppointments()                               │
│  ├─ useBarbers()                                    │
│  ├─ useCreateAppointment()                          │
│  └─ useCurrentProfile()                             │
└───────────────────────────────────────────────────────┘
                        ↑↓
┌───────────────────────────────────────────────────────┐
│  Layer 3: Business Logic (Supabase Services)        │
│  ├─ appointmentsService                             │
│  ├─ barbersService                                  │
│  ├─ paymentsService                                 │
│  └─ companiesService                                │
└───────────────────────────────────────────────────────┘
                        ↑↓
┌───────────────────────────────────────────────────────┐
│  Layer 4: Database Access (Supabase SDK)           │
│  ├─ REST API Client                                 │
│  ├─ Realtime Subscriptions                          │
│  └─ Authentication                                  │
└───────────────────────────────────────────────────────┘
                        ↑↓
┌───────────────────────────────────────────────────────┐
│  Layer 5: Database (PostgreSQL + RLS)               │
│  ├─ Tables                                          │
│  ├─ Policies                                        │
│  ├─ Triggers                                        │
│  └─ Constraints                                     │
└───────────────────────────────────────────────────────┘
```

---

## 🔐 Security Layers

```
┌───────────────────────────────────────┐
│  Layer 1: Frontend Validation         │
│  ├─ Type checking (TypeScript)        │
│  ├─ Input validation (HTML5)          │
│  └─ Client-side checks               │
│  ⚠️ Can be bypassed (not security)   │
└───────────────────────────────────────┘
                ↓
┌───────────────────────────────────────┐
│  Layer 2: Transport Security          │
│  ├─ HTTPS only                        │
│  ├─ TLS encryption                    │
│  └─ JWT tokens                        │
│  ✅ Secure communication              │
└───────────────────────────────────────┘
                ↓
┌───────────────────────────────────────┐
│  Layer 3: Authentication              │
│  ├─ Email + Password                  │
│  ├─ JWT verification                  │
│  └─ Session management                │
│  ✅ User verified                     │
└───────────────────────────────────────┘
                ↓
┌───────────────────────────────────────┐
│  Layer 4: Authorization (RLS)         │
│  ├─ Policy checks (WHERE company_id)  │
│  ├─ Role validation                   │
│  └─ Action validation                 │
│  ✅ User can perform action           │
└───────────────────────────────────────┘
                ↓
┌───────────────────────────────────────┐
│  Layer 5: Data Validation             │
│  ├─ Constraints (price > 0)           │
│  ├─ Enum validation                   │
│  └─ Referential integrity             │
│  ✅ Data is valid                     │
└───────────────────────────────────────┘
```

---

## 📈 Escalabilidade

```
┌─────────────────┐
│  1 Empresa      │
│  100 Usuários   │
│  1000 Agendamentos
└─────────────────┘
         ↓
┌─────────────────┐
│  10 Empresas    │
│  1000 Usuários  │
│  10k Agendamentos
└─────────────────┘
         ↓
┌─────────────────┐
│  100 Empresas   │
│  10k Usuários   │
│  100k Agendamentos
└─────────────────┘
         ↓
┌──────────────────────────────────────┐
│  Supabase Auto-scales:               │
│  ├─ PostgreSQL replication           │
│  ├─ Connection pooling               │
│  ├─ CDN distribution                 │
│  └─ Backup automation                │
└──────────────────────────────────────┘
```

---

## 🔄 Real-Time Architecture

```
┌──────────────────────────┐
│  Component A             │
│  Listening for updates   │
└────────┬─────────────────┘
         │
         ├─ subscribeToAppointments()
         │
         ↓
┌──────────────────────────────────────┐
│  Supabase Realtime Channel           │
│  (WebSocket Connection)              │
└────────┬─────────────────────────────┘
         │ (always connected)
         │
         ↓
┌──────────────────────────────────────┐
│  PostgreSQL Logical Replication      │
│  (detects changes)                   │
└────────┬─────────────────────────────┘
         │
         ↓ (Database change detected)
┌──────────────────────────────────────┐
│  Broadcast to all subscribers        │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Component B (WebSocket)             │
│  ├─ Receives payload                 │
│  ├─ Updates state                    │
│  └─ Re-renders (no page reload!)     │
└──────────────────────────────────────┘
```

---

## 📚 Recursos Adicionais

- [Supabase Architecture](https://supabase.com/docs/architecture)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [Real-time Updates](https://supabase.com/docs/guides/realtime)

---

**Arquitetura pronta para produção! 🚀**
