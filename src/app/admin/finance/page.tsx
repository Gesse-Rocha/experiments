'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface FinanceRecord {
  id: string
  date: string
  amountCents: number
  paymentMethod: 'pix' | 'cash'
  client: string
}

const records: FinanceRecord[] = [
  { id: 'f1', date: '2026-06-10', amountCents: 4000, paymentMethod: 'pix', client: 'Gabriel Santos' },
  { id: 'f2', date: '2026-06-10', amountCents: 3500, paymentMethod: 'cash', client: 'Marina Lima' },
  { id: 'f3', date: '2026-06-11', amountCents: 4500, paymentMethod: 'pix', client: 'Rafael Dias' },
  { id: 'f4', date: '2026-06-11', amountCents: 7500, paymentMethod: 'cash', client: 'Bruno Alves' },
]

export default function AdminFinancePage() {
  const [method, setMethod] = useState<'all' | 'pix' | 'cash'>('all')
  const displayedRecords = useMemo(
    () => (method === 'all' ? records : records.filter((record) => record.paymentMethod === method)),
    [method],
  )

  const total = useMemo(
    () => displayedRecords.reduce((sum, record) => sum + record.amountCents, 0),
    [displayedRecords],
  )

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="text-sm uppercase tracking-[0.35em] text-yellow-300">Financeiro</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-white">Receita por método de pagamento</h2>
            <p className="max-w-3xl text-sm leading-6 text-slate-400">Filtre o faturamento por Pix ou pagamento presencial e acompanhe o total de receitas.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {['all', 'pix', 'cash'].map((value) => (
              <Button
                key={value}
                onClick={() => setMethod(value as 'all' | 'pix' | 'cash')}
                className={`rounded-full px-5 py-3 ${method === value ? 'bg-yellow-400 text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
              >
                {value === 'all' ? 'Todos' : value === 'pix' ? 'Pix' : 'Presencial'}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-3xl border-white/10 bg-slate-950/80 p-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Resumo de faturamento</h3>
            <p className="text-sm text-slate-400">Total exibido para o método selecionado.</p>
          </div>
          <div className="mt-6 rounded-3xl border border-yellow-400/20 bg-yellow-400/5 p-6 text-slate-900">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-700">Total</p>
            <p className="mt-3 text-4xl font-semibold">R$ {(total / 100).toFixed(2)}</p>
          </div>
        </Card>

        <Card className="rounded-3xl border-white/10 bg-slate-950/80 p-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Últimos registros</h3>
            <p className="text-sm text-slate-400">Movimentações recentes do método selecionado.</p>
          </div>
          <div className="mt-6 space-y-3">
            {displayedRecords.map((record) => (
              <div key={record.id} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-white">{record.client}</p>
                  <span className="rounded-full bg-slate-900/90 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">{record.paymentMethod === 'pix' ? 'Pix' : 'Presencial'}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-slate-300">
                  <p>{record.date}</p>
                  <p>R$ {(record.amountCents / 100).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}
