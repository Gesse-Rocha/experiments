# ⚡ QUICK START - 10 Minutos para Começar

## 🎯 Objetivo
Ter o banco de dados funcionando em **10 minutos** com segurança multi-tenant.

---

## ✅ Pré-requisitos
- [ ] Conta no [Supabase](https://supabase.com) (grátis)
- [ ] Um projeto criado
- [ ] VSCode ou editor de texto

---

## ⏱️ Timeline: 10 Minutos

### ⏱️ Minuto 1-2: Preparação
1. Vá para seu projeto no Supabase
2. Abra a aba **SQL Editor**

### ⏱️ Minuto 2-5: Executar Script
1. Copie todo o conteúdo de `database_schema.sql`
2. Cole na janela SQL Editor
3. Clique em **Run** (botão azul)
4. Aguarde concluir (~3 segundos)

✅ **Resultado esperado:** 6 tabelas criadas

### ⏱️ Minuto 5-8: Configuração
1. Vá para **Settings > API**
2. Copie `Project URL` → Cole em `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
```

3. Copie `anon public` key → Cole em `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=seu-anon-key-aqui
```

### ⏱️ Minuto 8-10: Verificação
Execute esta query no SQL Editor para confirmar:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

✅ **Deve retornar 6 tabelas:**
- appointments
- barbers
- companies
- payments
- profiles
- services

---

## 🎉 Pronto!

Seu banco está funcionando com:
- ✅ 6 tabelas principais
- ✅ Row Level Security (RLS)
- ✅ 15+ políticas de segurança
- ✅ Soft deletes
- ✅ Triggers automáticos

---

## 🔧 Próximas 30 Minutos (Opcional)

### Copiar Código TypeScript para seu Projeto

```bash
# Estrutura esperada
seu-projeto/
└── src/
    ├── lib/
    │   └── supabase-services.ts   ← Copie daqui
    ├── hooks/
    │   └── use-supabase.ts         ← Copie daqui
    └── types/
        └── supabase.ts             ← Copie daqui
```

### Instalar Dependência

```bash
npm install @supabase/supabase-js
```

### Primeiro Componente

```typescript
import { useAppointments } from '@/hooks/use-supabase';

export function AppointmentList() {
  const { appointments, loading } = useAppointments('company-uuid-aqui');
  
  if (loading) return <p>Carregando...</p>;
  
  return (
    <ul>
      {appointments.map(apt => (
        <li key={apt.id}>{apt.customer_name}</li>
      ))}
    </ul>
  );
}
```

---

## ⚡ Começar Desenvolvimento Agora

### Exemplo 1: Buscar Barbeiros
```typescript
import { barbersService } from '@/lib/supabase-services';

const barbers = await barbersService.getCompanyBarbers('seu-company-id');
console.log(barbers); // [{ id, name, ... }, ...]
```

### Exemplo 2: Criar Agendamento
```typescript
import { appointmentsService } from '@/lib/supabase-services';

const apt = await appointmentsService.createAppointment({
  company_id: 'seu-company-id',
  barber_id: 'seu-barber-id',
  customer_name: 'João',
  customer_whatsapp: '11999999999',
  start_time: '2024-01-15T10:00:00Z',
  end_time: '2024-01-15T11:00:00Z',
});
```

### Exemplo 3: Em React Hook
```typescript
import { useAppointments, useCreateAppointment } from '@/hooks/use-supabase';

export function AgendaForm() {
  const { appointments } = useAppointments(companyId);
  const { createAppointment, loading } = useCreateAppointment();

  return (
    <div>
      <h2>Agendamentos: {appointments.length}</h2>
      <button onClick={() => createAppointment({...})}>
        {loading ? 'Agendando...' : 'Agendar'}
      </button>
    </div>
  );
}
```

---

## 🔒 Segurança Automática

Seu banco já tem:
- ✅ **RLS ativado** - usuários só veem sua empresa
- ✅ **Policies** - admin/barber/customer com permissões corretas
- ✅ **Validation** - preços positivos, status válidos, etc
- ✅ **Soft delete** - dados não se perdem
- ✅ **Audit trail** - `created_at`, `updated_at` automáticos

---

## 📊 Próximas Etapas

### Esta Semana
- [ ] Executar `database_schema.sql`
- [ ] Copiar código TypeScript
- [ ] Criar primeiro componente
- [ ] Testar criar agendamento

### Próxima Semana
- [ ] Ler `SECURITY_GUIDE.md`
- [ ] Implementar autenticação
- [ ] Testes de RLS
- [ ] Preparar produção

### Próximo Mês
- [ ] Deploy em produção
- [ ] Monitorar
- [ ] Iterar com feedback

---

## 🚨 Problemas Comuns

### "Tabelas não aparecem"
```sql
-- Refresque a tela ou execute:
SELECT * FROM information_schema.tables WHERE table_schema = 'public';
```

### "Erro ao executar script"
- Verifique se está no SQL Editor do Supabase
- Verifique se selecionou o projeto correto
- Tente copiar/colar de novo

### "Tipos não encontram"
- Certifique-se de copiar `src/types/supabase.ts`
- Importe corretamente: `import type { Database } from '@/types/supabase'`

### "Chaves não funcionam"
- Verifique `.env.local` (não `.env`)
- Copie valores exatos sem espaços extras
- Reinicie o dev server

---

## 💡 Dicas Rápidas

### 🎯 Testar RLS
```sql
-- Conecte como um usuário
SELECT * FROM appointments 
WHERE company_id != 'seu-company-id';
-- Deve retornar vazio (0 linhas)
```

### 🎯 Buscar por Data
```sql
SELECT * FROM appointments
WHERE DATE(start_time) = '2024-01-15'
ORDER BY start_time ASC;
```

### 🎯 Faturamento do Dia
```sql
SELECT SUM(amount) as total
FROM payments
WHERE DATE(created_at) = CURRENT_DATE
AND status = 'paid';
```

---

## ✨ Você Acabou de Fazer

1. ✅ Criou um banco multi-tenant seguro
2. ✅ Implementou Row Level Security
3. ✅ Preparou código TypeScript reutilizável
4. ✅ Configurou React Hooks funcionais
5. ✅ Documentou tudo

**Tempo investido:** ~10 minutos  
**Tempo economizado:** Horas de setup e configuração

---

## 📚 Próxima Leitura

Depois do Quick Start, leia nesta ordem:

1. **README_DATABASE.md** (10 min)
2. **IMPLEMENTATION_GUIDE.md** (30 min)
3. **SECURITY_GUIDE.md** (30 min)

---

## 🎯 Seu Próximo Objetivo

Crie um componente que:
1. ✅ Busque barbeiros da empresa
2. ✅ Busque agendamentos do dia
3. ✅ Mostre em uma tabela
4. ✅ Permita criar novo agendamento

**Tempo esperado:** 30-45 minutos

---

## 🚀 Está Pronto?

Vá para o SQL Editor do Supabase e **comece agora!**

**Boa sorte! 🎉**
