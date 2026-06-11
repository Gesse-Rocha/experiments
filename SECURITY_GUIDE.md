# 🔒 Guia de Segurança - Barbershop SaaS

## ⚠️ SEGURANÇA EM PRIMEIRO LUGAR

Este é um sistema **multi-tenant com dados sensíveis**. Siga rigorosamente este guia para manter seus dados seguros.

---

## 📋 Checklist de Implementação

### Fase 1: Setup do Supabase ✅

- [ ] Criar projeto no [Supabase](https://supabase.com)
- [ ] Copiar URL e Anon Key
- [ ] Executar `database_schema.sql` no SQL Editor
- [ ] Verificar se todas as 6 tabelas foram criadas
- [ ] Verificar se RLS está habilitado em todas as tabelas
- [ ] Verificar se 15+ policies foram criadas

```sql
-- Verificar RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Verificar policies
SELECT * FROM pg_policies 
WHERE schemaname = 'public';
```

### Fase 2: Variáveis de Ambiente ✅

- [ ] Copiar `.env.example` para `.env.local`
- [ ] Adicionar `.env.local` ao `.gitignore`
- [ ] Preencher `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Preencher `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Gerar Service Role Key no Supabase
- [ ] Adicionar `SUPABASE_SERVICE_ROLE_KEY` (somente no backend/servidor)

```bash
# .gitignore
.env.local
.env.*.local
```

### Fase 3: Autenticação ✅

- [ ] Habilitar Email Auth no Supabase
- [ ] Configurar SMTP para envio de emails
- [ ] Criar política de senhas fortes
- [ ] Habilitar 2FA (opcional, recomendado para admins)
- [ ] Testar fluxo de login

### Fase 4: Testes ✅

- [ ] Testar RLS: usuário de uma empresa não consegue ver dados de outra
- [ ] Testar roles: admin consegue criar, barber consegue atualizar, customer consegue criar agendamento
- [ ] Testar soft delete: dados não desaparecem, apenas marcados com `deleted_at`
- [ ] Testar constraints: não conseguir criar dados inválidos

```sql
-- Teste simples de RLS
-- Conecte como um usuário
SELECT * FROM public.appointments 
WHERE company_id != 'seu-company-id';
-- Deve retornar vazio (0 linhas)
```

### Fase 5: Produção ✅

- [ ] Fazer backup inicial do banco
- [ ] Configurar backups automáticos
- [ ] Habilitar logs de auditoria
- [ ] Testar recovery de backup
- [ ] Configurar monitoramento
- [ ] Documentar processo de escalação

---

## 🔐 Segurança em Camadas

### Camada 1: Row Level Security (RLS)

✅ **HABILITADO** no schema

```sql
-- Verificar
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
```

**Protege contra:**
- Usuários acessando dados de outro tenant
- Clients crackeados tentando acessar dados
- SQL injection em queries simples

### Camada 2: Políticas de Acesso (Policies)

✅ **15+ políticas** implementadas

```sql
-- Exemplo: Usuários só veem sua empresa
CREATE POLICY "company_isolation"
    ON public.appointments
    FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM profiles 
            WHERE id = auth.uid()
        )
    );
```

**Protege contra:**
- Acesso não autorizado por role
- Modificação de dados de outro tenant
- Exclusão acidental de dados

### Camada 3: Validação de Dados (Constraints)

✅ **Constraints e triggers** implementados

```sql
-- Exemplo: Preços sempre positivos
CONSTRAINT payments_amount_positive CHECK (amount > 0)

-- Exemplo: Status válidos
CONSTRAINT appointments_status_check 
  CHECK (status IN ('pending', 'confirmed', 'canceled'))
```

**Protege contra:**
- Dados inválidos no banco
- Valores negativos
- Enum inválido

### Camada 4: Auditoria

✅ **Soft deletes** com `deleted_at` e **updated_at** automático

```sql
-- Exemplo: Recuperar dados deletados
SELECT * FROM appointments 
WHERE deleted_at IS NOT NULL;

-- Exemplo: Ver histórico de modificações
SELECT *, updated_at FROM appointments 
ORDER BY updated_at DESC;
```

**Protege contra:**
- Perda de dados por exclusão
- Impossibilidade de auditar mudanças

---

## 🚨 Regras de Ouro

### ❌ NUNCA faça isso:

```typescript
// ❌ NUNCA exponha Service Role Key no frontend
const serviceKey = "seu-service-role-key";

// ❌ NUNCA desabilite RLS em produção
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;

// ❌ NUNCA execute queries sem filtro de company_id
SELECT * FROM appointments; // SEM WHERE company_id = ?

// ❌ NUNCA confie apenas no frontend para validação
// Sempre valide no backend também

// ❌ NUNCA comita .env.local
git add .env.local // ❌ ERRADO

// ❌ NUNCA execute queries com dados do usuário diretamente
const query = `SELECT * FROM appointments WHERE id = ${userId}`; // SQL Injection!
```

### ✅ FAÇA isso:

```typescript
// ✅ Use Anon Key no frontend
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ✅ Service Role Key apenas no backend
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ✅ Sempre filtre por company_id no RLS
SELECT * FROM appointments 
WHERE company_id = auth.user_metadata.company_id;

// ✅ Valide no backend também
if (!isValidPrice(price)) throw Error("Preço inválido");

// ✅ Adicione ao .gitignore
# .gitignore
.env.local

// ✅ Use prepared statements ou Supabase SDK
const { data } = await supabase
  .from("appointments")
  .select("*")
  .eq("id", userId); // Parameterizado!
```

---

## 🔑 Gerenciamento de Chaves

### Tipos de Chaves

| Chave | Uso | Exposição | Armazenamento |
|-------|-----|-----------|--------------|
| **Anon Key** | Frontend | ✅ Pública | env.local (PUBLIC) |
| **Service Role** | Backend | ❌ Privada | env.local (SECRET) |
| **Database URL** | Backend | ❌ Privada | env.local (SECRET) |
| **API Keys 3rd** | Backend | ❌ Privada | env.local (SECRET) |

### Renovação de Chaves

```bash
# No Supabase Dashboard:
1. Ir para Settings > API
2. Clique em "Rotate" na Service Role Key
3. Atualize seu código com a nova chave
4. Faça deploy
5. Confirme no Supabase

# Frequência recomendada:
- Service Role Key: a cada 6 meses
- Anon Key: a cada 12 meses
- API Keys 3rd: a cada 3 meses
```

---

## 🛡️ Proteção contra Ataques Comuns

### 1. SQL Injection

```typescript
// ❌ Vulnerável
const results = await db.query(
  `SELECT * FROM users WHERE email = '${email}'`
);

// ✅ Seguro (Supabase SDK)
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', email);
```

### 2. Cross-Site Scripting (XSS)

```typescript
// ❌ Vulnerável
<div>{userInput}</div>

// ✅ Seguro (React escapa automaticamente)
<div>{userInput}</div> // React sanitiza

// ✅ Mais seguro (DOMPurify)
import DOMPurify from 'dompurify';
<div>{DOMPurify.sanitize(userInput)}</div>
```

### 3. Força Bruta

```sql
-- Implementar rate limiting no Supabase
-- No seu backend:
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5 // 5 tentativas por IP
});

app.post('/login', loginLimiter, async (req, res) => {
  // ...
});
```

### 4. CSRF (Cross-Site Request Forgery)

```typescript
// Supabase/NextJS já protege com CSRF tokens
// Certifique-se de usar:
- Cookies SameSite
- CSRF tokens em forms
- Validar origem de requisições
```

---

## 📊 Monitoramento e Alertas

### Logs para Monitorar

```sql
-- Verificar logins falhados
SELECT * FROM audit_log 
WHERE event = 'login_failed'
ORDER BY timestamp DESC
LIMIT 10;

-- Verificar exclusões
SELECT * FROM audit_log 
WHERE event = 'delete'
ORDER BY timestamp DESC;

-- Verificar mudanças de role
SELECT * FROM audit_log 
WHERE event = 'role_changed'
ORDER BY timestamp DESC;
```

### Alertas Recomendados

- ⚠️ Múltiplas tentativas de login falhadas
- ⚠️ Deleção em massa
- ⚠️ Acesso a dados sensíveis
- ⚠️ Mudanças de permissões

---

## 🔄 Backup e Disaster Recovery

### Fazer Backup

```bash
# Supabase faz backup automático diariamente
# Mas você pode fazer manualmente:

supabase db pull > backup.sql

# Ou via pgdump
pg_dump postgresql://user:pass@localhost/db > backup.sql
```

### Restaurar Backup

```bash
# Restaurar no Supabase
supabase db push < backup.sql

# Ou via psql
psql postgresql://user:pass@localhost/db < backup.sql
```

### Plano de Recuperação

- [ ] Teste recovery mensalmente
- [ ] Armazene backups em múltiplos locais
- [ ] Documente processo de recuperação
- [ ] Defina RTO (Recovery Time Objective) e RPO (Recovery Point Objective)

**Exemplo:**
- **RTO:** 1 hora (máximo tempo de inatividade aceitável)
- **RPO:** 30 minutos (máximo dados perdidos aceitáveis)

---

## 📱 Segurança em Produção

### Antes de ir para produção

- [ ] Ativar HTTPS (obrigatório)
- [ ] Ativar Firewall
- [ ] Ativar WAF (Web Application Firewall)
- [ ] Ativar DDoS protection
- [ ] Configurar SSL certificate
- [ ] Ativar rate limiting
- [ ] Ativar bot protection
- [ ] Revisar todas as policies
- [ ] Testar cenários de ataque
- [ ] Configurar monitoring
- [ ] Fazer audit de segurança

### Hardening do Supabase

```sql
-- 1. Restringir public schema
REVOKE ALL ON SCHEMA public FROM PUBLIC;

-- 2. Criar role específica para app
CREATE ROLE app_user WITH LOGIN;

-- 3. Dar apenas permissões necessárias
GRANT SELECT, INSERT, UPDATE ON appointments TO app_user;

-- 4. Habilitar audit log
ALTER DATABASE seu_db SET log_statement = 'all';
```

---

## 📞 Resposta a Incidentes

### Se descobrir uma brecha

1. **Isolar** - Desabilite acesso ao banco
2. **Investigar** - Verifique logs
3. **Notificar** - Avise usuários afetados
4. **Remediar** - Altere senhas, rotacione chaves
5. **Documentar** - Registre o incidente

### Contato Supabase Support

- Email: support@supabase.io
- Documentação: docs.supabase.com/guides/platform/troubleshooting
- Status: status.supabase.com

---

## 🎓 Recursos de Aprendizado

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/auth/securing-your-app)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/sql-syntax.html)
- [NIST Cybersecurity](https://www.nist.gov/cyberframework)

---

## ✅ Conclusão

Uma aplicação segura requer **vigilância constante**. Revise este guia regularmente e atualize suas práticas conforme novas ameaças surgem.

**Segurança não é um projeto, é um processo contínuo.**

---

**Versão:** 1.0  
**Última atualização:** 2024  
**Próxima revisão:** A cada 3 meses
