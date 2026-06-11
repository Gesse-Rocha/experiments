# 🏪 Barbershop SaaS - Database Setup Complete

Um **script SQL completo e robusto** para um sistema SaaS de barbearia com suporte multi-tenant, integração com Supabase e Row Level Security (RLS).

---

## 📦 O que foi criado

### 1. **database_schema.sql** 
Script SQL completo com:
- ✅ 6 tabelas principais (companies, profiles, barbers, services, appointments, payments)
- ✅ Chaves estrangeiras e constraints validadores
- ✅ Índices para performance
- ✅ Row Level Security (RLS) ativado
- ✅ 15+ políticas de segurança por company_id
- ✅ Triggers automáticos para updated_at
- ✅ Extensões necessárias (uuid, pgcrypto)

### 2. **IMPLEMENTATION_GUIDE.md**
Documentação completa com:
- 📝 Instruções passo-a-passo para Supabase
- 🔐 Explicação detalhada de RLS e policies
- 📊 Queries úteis para desenvolvimento
- 🛡️ Boas práticas de segurança
- 🐛 Troubleshooting
- 💡 Dicas extras e views para relatórios

### 3. **src/lib/supabase-services.ts**
Serviços TypeScript prontos para usar:
- `companiesService` - Gerenciar empresas
- `profilesService` - Gerenciar perfis de usuários
- `barbersService` - Gerenciar barbeiros
- `servicesService` - Gerenciar serviços
- `appointmentsService` - Gerenciar agendamentos
- `paymentsService` - Gerenciar pagamentos
- `subscriptionsService` - Real-time updates via Supabase

### 4. **src/types/supabase.ts**
Tipos TypeScript completos para:
- Todas as tabelas (Row, Insert, Update)
- Enums para roles e status
- Composable types

---

## 🚀 Como Usar

### Passo 1: Executar o Script SQL

1. Acesse seu projeto no [Supabase](https://supabase.com)
2. Vá para **SQL Editor**
3. Cole o conteúdo de `database_schema.sql`
4. Clique em **Run**

```bash
# Ou via CLI Supabase
supabase db push
```

### Passo 2: Configurar Variáveis de Ambiente

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=seu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=seu-service-role-key
```

### Passo 3: Instalar Supabase SDK

```bash
npm install @supabase/supabase-js
```

### Passo 4: Usar os Serviços

```typescript
import {
  appointmentsService,
  barbersService,
  paymentsService,
} from "@/lib/supabase-services";

// Buscar barbeiros
const barbers = await barbersService.getCompanyBarbers(companyId);

// Criar agendamento
const appointment = await appointmentsService.createAppointment({
  company_id: companyId,
  barber_id: barberId,
  customer_name: "João Silva",
  customer_whatsapp: "11999999999",
  start_time: new Date().toISOString(),
  end_time: new Date(Date.now() + 3600000).toISOString(),
});

// Processar pagamento
const payment = await paymentsService.createPayment({
  company_id: companyId,
  appointment_id: appointment.id,
  method: "pix",
  amount: 150.00,
});
```

---

## 🔐 Segurança com RLS

### Como funciona

- **Cada tenant vê apenas seus dados** via `company_id`
- **Isolamento automático** nas queries
- **Controle de role** (admin, barber, customer)
- **Soft deletes** com `deleted_at`

### Exemplo de Policy

```sql
-- Usuários veem apenas sua empresa
CREATE POLICY "isolate_by_company"
    ON public.appointments
    FOR SELECT
    USING (
        company_id IN (
            SELECT company_id 
            FROM public.profiles 
            WHERE id = auth.uid()
        )
    );
```

---

## 📊 Estrutura de Dados

```
companies (Tenant Base)
├── profiles (Usuários)
│   └── barbers (Barbeiros)
├── services (Serviços)
├── appointments (Agendamentos)
│   └── payments (Pagamentos)
```

### Campos Principais

| Tabela | Descrição |
|--------|-----------|
| `companies` | Empresas/tenants do SaaS |
| `profiles` | Usuários autenticados (admin, barber, customer) |
| `barbers` | Profissionais de cada empresa |
| `services` | Serviços oferecidos (corte, barba, etc) |
| `appointments` | Agendamentos de clientes |
| `payments` | Histórico de pagamentos |

---

## 💾 Backup e Restauração

### Fazer Backup
```bash
supabase db pull
```

### Restaurar
```bash
supabase db push
```

---

## 🔍 Verificação

Após executar o script, verifique:

```sql
-- Ver todas as tabelas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Ver policies
SELECT * FROM pg_policies WHERE tablename = 'appointments';

-- Ver índices
\di public.*
```

---

## 📈 Performance

O schema inclui índices em:
- ✅ `company_id` (isolamento multi-tenant)
- ✅ `start_time` (agenda)
- ✅ `status` (filtros)
- ✅ `created_at` (relatórios)
- ✅ `barber_id` (busca de profissionais)

---

## 🛠️ Customizações Comuns

### Adicionar novo campo à tabela

```sql
ALTER TABLE public.barbers 
ADD COLUMN instagram_url TEXT;
```

### Criar view para relatórios

```sql
CREATE VIEW public.monthly_revenue AS
SELECT 
    DATE_TRUNC('month', p.paid_at) as month,
    SUM(p.amount) as total
FROM payments p
WHERE p.status = 'paid'
GROUP BY DATE_TRUNC('month', p.paid_at);
```

### Adicionar trigger customizado

```sql
CREATE TRIGGER notify_appointment
AFTER INSERT ON appointments
FOR EACH ROW
EXECUTE FUNCTION notify_via_webhook();
```

---

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)

---

## ⚠️ Importantes

- **Nunca desabilite RLS em produção**
- **Service Role Key** não deve ser exposta no frontend
- **Fazer backup regular** do banco de dados
- **Testar policies** antes de produção
- **Validar constraints** funcionando

---

## 🆘 Problemas Comuns

### "Policy violation"
👉 Verifique se o usuário está autenticado e pertence à empresa

### "RLS bloqueando tudo"
👉 Verifique policies com `SELECT * FROM pg_policies WHERE tablename = 'sua_tabela'`

### Performance lenta
👉 Verifique índices com `\di public.*` e rode `ANALYZE`

---

## 📞 Suporte

- Leia `IMPLEMENTATION_GUIDE.md` para dúvidas
- Revise `database_schema.sql` para estrutura
- Use `supabase-services.ts` como exemplo

---

**Versão:** 1.0  
**Última atualização:** 2024  
**Compatível com:** Supabase, PostgreSQL 13+  

Pronto para produção! 🚀
