## 📋 Guia de Implementação - Banco de Dados SaaS Barbershop

### 🚀 Instruções de Implantação

#### 1. **No Supabase Console**

1. Acesse seu projeto Supabase
2. Vá para **SQL Editor**
3. Cole todo o conteúdo do arquivo `database_schema.sql`
4. Clique em **Run** para executar o script

#### 2. **Verificação**

Após executar, verifique se todas as tabelas foram criadas:

```sql
-- Listar todas as tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

---

### 🔐 Row Level Security (RLS) - Explicação Detalhada

#### **Como funciona:**

- **RLS garante isolamento de dados por tenant** (`company_id`)
- Cada usuário só consegue acessar dados da sua empresa
- Mesmo com acesso direto ao banco, os dados são protegidos

#### **Níveis de acesso:**

| Papel | Tabelas de Leitura | Tabelas de Escrita |
|-------|------------------|------------------|
| **admin** | Todas da empresa | Todas da empresa |
| **barber** | Profissionais, Serviços, Agendamentos | Agendamentos (update) |
| **customer** | Serviços, Horários | Agendamentos (insert) |

---

### 📝 Exemplo de Policy Customizado

#### **Policy 1: Isolamento por Company_ID (Padrão)**

```sql
-- Exemplo: Apenas usuários da mesma empresa podem ver dados
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

#### **Policy 2: Barber específico pode ver seus agendamentos**

```sql
CREATE POLICY "barber_view_own_appointments"
    ON public.appointments
    FOR SELECT
    USING (
        -- O barbeiro vê seus próprios agendamentos
        barber_id = (
            SELECT id 
            FROM public.barbers 
            WHERE profile_id = auth.uid()
        )
        OR
        -- Admins veem todos da empresa
        auth.uid() IN (
            SELECT id 
            FROM public.profiles 
            WHERE role = 'admin' 
            AND company_id = appointments.company_id
        )
    );
```

#### **Policy 3: Clientes podem apenas criar agendamentos**

```sql
CREATE POLICY "customer_can_create_appointments"
    ON public.appointments
    FOR INSERT
    WITH CHECK (
        -- Customers só podem criar para sua empresa
        company_id IN (
            SELECT company_id 
            FROM public.profiles 
            WHERE id = auth.uid()
        )
    );
```

---

### 🔑 Variáveis de Ambiente para Supabase

Para conectar sua aplicação, você precisará de:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=seu-anon-key
SUPABASE_SERVICE_ROLE_KEY=seu-service-role-key
```

---

### 📊 Queries Úteis para o Desenvolvimento

#### **1. Buscar agendamentos de uma empresa com detalhes**

```sql
SELECT 
    a.id,
    a.customer_name,
    a.start_time,
    a.status,
    b.name as barber_name,
    a.total_price,
    a.total_duration
FROM public.appointments a
JOIN public.barbers b ON a.barber_id = b.id
WHERE a.company_id = 'seu-uuid-company'
ORDER BY a.start_time DESC;
```

#### **2. Relatório de faturamento**

```sql
SELECT 
    DATE(p.created_at) as data,
    COUNT(*) as total_pagamentos,
    SUM(p.amount) as total_valor,
    p.status
FROM public.payments p
WHERE p.company_id = 'seu-uuid-company'
GROUP BY DATE(p.created_at), p.status
ORDER BY data DESC;
```

#### **3. Verificar disponibilidade de barbeiro**

```sql
SELECT 
    b.name as barbeiro,
    COUNT(a.id) as agendamentos_dia,
    a.start_time::DATE as data
FROM public.barbers b
LEFT JOIN public.appointments a ON b.id = a.barber_id
WHERE b.company_id = 'seu-uuid-company'
AND a.start_time::DATE = CURRENT_DATE
GROUP BY b.id, b.name, a.start_time::DATE
ORDER BY b.name;
```

#### **4. Listar perfis com seus barbeiros**

```sql
SELECT 
    p.name,
    p.email,
    p.role,
    b.name as barber_name,
    b.is_active
FROM public.profiles p
LEFT JOIN public.barbers b ON p.id = b.profile_id
WHERE p.company_id = 'seu-uuid-company'
ORDER BY p.name;
```

---

### 🛡️ Segurança e Boas Práticas

#### **1. Habilitar RLS em Produção**

Nunca desabilite RLS em produção. Se precisar acessar dados como admin:

```sql
-- Use a chave SERVICE_ROLE (apenas em backend seguro)
-- Nunca exponha essa chave no frontend!
```

#### **2. Validações de Constraints**

O schema inclui validações automáticas:

- ✅ Preços sempre positivos
- ✅ Durações válidas
- ✅ Horários de fim após início
- ✅ Roles permitidos
- ✅ Status válidos

#### **3. Soft Deletes**

Todas as tabelas possuem `deleted_at` para soft delete:

```sql
-- Em vez de DELETE
UPDATE public.appointments 
SET deleted_at = NOW() 
WHERE id = 'appointment-id';

-- Nas queries, sempre filtrar:
SELECT * FROM public.appointments 
WHERE deleted_at IS NULL;
```

---

### 📱 Estrutura de Dados - Exemplo Prático

#### **Fluxo de criação de agendamento:**

```
1. Cliente acessa o app
   ↓
2. Busca serviços da empresa
   SELECT * FROM services WHERE company_id = empresa.id
   ↓
3. Busca horários disponíveis dos barbeiros
   SELECT * FROM barbers WHERE company_id = empresa.id
   ↓
4. Cria agendamento
   INSERT INTO appointments (company_id, barber_id, ...)
   ↓
5. Sistema cria pagamento
   INSERT INTO payments (company_id, appointment_id, ...)
   ↓
6. Notificação enviada via WhatsApp (customer_whatsapp)
```

---

### 🐛 Troubleshooting

#### **Problema: "Policy violation" ao inserir dados**

**Solução:** Verifique se:
- O `auth.uid()` está autenticado
- O usuário pertence à mesma `company_id`
- O usuário tem a role correta

#### **Problema: RLS bloqueando todas as operações**

**Solução:** Verifique policies com:

```sql
-- Listar todas as policies
SELECT * FROM pg_policies WHERE tablename = 'seu_table';
```

#### **Problema: Performance lenta**

**Solução:** Verifique os índices:

```sql
-- Listar índices
\di public.*

-- Analisar query
EXPLAIN ANALYZE SELECT * FROM appointments WHERE company_id = 'uuid';
```

---

### 🔄 Migração para Produção

#### **Checklist:**

- [ ] Testar todas as policies no staging
- [ ] Verificar triggers de `updated_at`
- [ ] Validar constraints funcionando
- [ ] Testar RLS com diferentes roles
- [ ] Fazer backup do banco
- [ ] Executar script na produção
- [ ] Verificar se tabelas foram criadas
- [ ] Testar acesso por tenant

---

### 📚 Referências

- [Documentação Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [Supabase SQL Editor](https://supabase.com/docs/guides/database/sql-editor)

---

### 💡 Dicas Extras

#### **1. Trigger para atualizar company em perfil**

```sql
CREATE OR REPLACE FUNCTION auto_assign_company()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.company_id IS NULL THEN
        NEW.company_id := (
            SELECT id FROM companies LIMIT 1
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### **2. View para relatórios**

```sql
CREATE OR REPLACE VIEW public.appointment_stats AS
SELECT 
    c.name as company,
    DATE(a.start_time) as data,
    COUNT(*) as total_agendamentos,
    SUM(a.total_price) as receita,
    COUNT(CASE WHEN a.status = 'confirmed' THEN 1 END) as confirmados
FROM appointments a
JOIN companies c ON a.company_id = c.id
WHERE a.deleted_at IS NULL
GROUP BY c.id, c.name, DATE(a.start_time)
ORDER BY c.name, data DESC;
```

---

**Gerado para: Barbershop SaaS Multi-tenant**  
**Data: 2024**  
**Versão: 1.0**
