'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface BarberRow {
  id: string
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive'
  createdAt: string
}

const initialBarbers: BarberRow[] = [
  { id: 'barber-1', name: 'Lucas', email: 'lucas@barbearia.com', phone: '(11) 98765-4321', status: 'active', createdAt: '2026-01-12' },
  { id: 'barber-2', name: 'Matheus', email: 'matheus@barbearia.com', phone: '(11) 97654-3210', status: 'active', createdAt: '2026-02-18' },
  { id: 'barber-3', name: 'Pedro', email: 'pedro@barbearia.com', phone: '(11) 96543-2109', status: 'inactive', createdAt: '2026-03-22' },
]

export default function AdminBarbersPage() {
  const [barbers, setBarbers] = useState<BarberRow[]>(initialBarbers)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const editingBarber = useMemo(() => barbers.find((barber) => barber.id === editingId) ?? null, [barbers, editingId])

  const handleSave = () => {
    if (!name.trim() || !email.trim() || !phone.trim()) return

    if (editingId) {
      setBarbers((current) =>
        current.map((barber) =>
          barber.id === editingId ? { ...barber, name, email, phone } : barber,
        ),
      )
      setEditingId(null)
    } else {
      setBarbers((current) => [
        ...current,
        {
          id: `barber-${Date.now()}`,
          name,
          email,
          phone,
          status: 'active',
          createdAt: new Date().toISOString().slice(0, 10),
        },
      ])
    }

    setName('')
    setEmail('')
    setPhone('')
  }

  const handleEdit = (barberId: string) => {
    const barber = barbers.find((item) => item.id === barberId)
    if (!barber) return
    setEditingId(barber.id)
    setName(barber.name)
    setEmail(barber.email)
    setPhone(barber.phone)
  }

  const handleToggleStatus = (barberId: string) => {
    setBarbers((current) =>
      current.map((barber) =>
        barber.id === barberId
          ? { ...barber, status: barber.status === 'active' ? 'inactive' : 'active' }
          : barber,
      ),
    )
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="text-sm uppercase tracking-[0.35em] text-yellow-300">Gestão de barbeiros</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-white">Equipe de barbeiros</h2>
            <p className="max-w-3xl text-sm leading-6 text-slate-400">Gerencie os barbeiros cadastrados, edite informações e altere o status em um único painel.</p>
          </div>
          <Button onClick={() => { setEditingId(null); setName(''); setEmail(''); setPhone('') }}>Novo barbeiro</Button>
        </div>
      </section>

      <Card className="overflow-hidden rounded-3xl border-white/10 bg-slate-950/80">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left">
            <thead className="bg-slate-900/80 text-slate-300">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold">Nome</th>
                <th className="px-6 py-4 text-sm font-semibold">Email</th>
                <th className="px-6 py-4 text-sm font-semibold">Telefone</th>
                <th className="px-6 py-4 text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-sm font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {barbers.map((barber) => (
                <tr key={barber.id} className="border-b border-white/10">
                  <td className="px-6 py-4 text-sm text-white">{barber.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{barber.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{barber.phone}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{barber.status === 'active' ? 'Ativo' : 'Desativado'}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => handleEdit(barber.id)} className="rounded-full px-4 py-2 text-xs">Editar</Button>
                      <Button onClick={() => handleToggleStatus(barber.id)} className="rounded-full bg-red-500/10 px-4 py-2 text-xs text-red-200 hover:bg-red-500/20">
                        {barber.status === 'active' ? 'Desativar' : 'Ativar'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="rounded-3xl border-white/10 bg-slate-950/80 p-6">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">{editingId ? 'Editar barbeiro' : 'Novo barbeiro'}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              Nome
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-yellow-400"
                placeholder="Nome completo"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              Email
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-yellow-400"
                placeholder="email@dominio.com"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              Telefone
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-yellow-400"
                placeholder="(11) 9 9999-9999"
              />
            </label>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button onClick={() => { setEditingId(null); setName(''); setEmail(''); setPhone('') }} className="rounded-full bg-white/5 text-white hover:bg-white/10">Cancelar</Button>
            <Button onClick={handleSave} className="rounded-full">Salvar barbeiro</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
