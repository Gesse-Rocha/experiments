'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const metrics = [
  { label: 'Agendamentos do dia', value: 18, trend: '+12%' },
  { label: 'Faturamento atual', value: 'R$ 7.240', trend: '+8%' },
  { label: 'Serviço mais vendido', value: 'Combo Corte + Barba', trend: 'Top' },
]

const nextClients = [
  { time: '09:30', name: 'Gabriel Santos', service: 'Corte Moderno' },
  { time: '10:00', name: 'Marina Lima', service: 'Barba Perfeita' },
  { time: '10:45', name: 'Rafael Dias', service: 'Corte Clássico' },
  { time: '11:30', name: 'Bruno Alves', service: 'Combo Corte + Barba' },
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="text-sm uppercase tracking-[0.35em] text-yellow-300">Dashboard</p>
        <h2 className="text-3xl font-semibold text-white">Resumo administrativo</h2>
        <p className="max-w-3xl text-sm leading-6 text-slate-400">
          Monitore os principais indicadores da barbearia e acesse rapidamente os dados de agendamentos, equipe e receita.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label} className="rounded-3xl border-white/10 bg-slate-950/80 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{metric.label}</p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <p className="text-3xl font-semibold text-white">{metric.value}</p>
              <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-sm font-semibold text-yellow-300">{metric.trend}</span>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-3xl border-white/10 bg-slate-950/80 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-white">Performance de serviços</h3>
              <p className="mt-2 text-sm text-slate-400">Resumo dos serviços mais vendidos e receita por categoria.</p>
            </div>
            <Button>Painel completo</Button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-white/5 p-5">
              <p className="text-sm text-slate-400">Cortes</p>
              <p className="mt-3 text-2xl font-semibold text-white">R$ 3.150</p>
              <p className="mt-2 text-sm text-slate-400">120 ativos</p>
            </div>
            <div className="rounded-3xl bg-white/5 p-5">
              <p className="text-sm text-slate-400">Barbas</p>
              <p className="mt-3 text-2xl font-semibold text-white">R$ 2.030</p>
              <p className="mt-2 text-sm text-slate-400">74 ativos</p>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border-white/10 bg-slate-950/80 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-white">Próximos clientes</h3>
              <p className="mt-2 text-sm text-slate-400">Agenda dos próximos atendimentos confirmados.</p>
            </div>
            <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-sm font-semibold text-yellow-300">4 próximos</span>
          </div>

          <div className="mt-6 space-y-3">
            {nextClients.map((client) => (
              <div key={`${client.time}-${client.name}`} className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-sm text-slate-400">{client.time}</p>
                  <p className="font-medium text-white">{client.name}</p>
                </div>
                <span className="rounded-full bg-slate-900/90 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">{client.service}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}
