'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ServiceRow {
  id: string
  name: string
  description: string
  priceCents: number
  durationMinutes: number
}

const initialServices: ServiceRow[] = [
  { id: 'service-1', name: 'Corte Clássico', description: 'Corte tradicional com acabamento perfeito.', priceCents: 4000, durationMinutes: 40 },
  { id: 'service-2', name: 'Barba Perfeita', description: 'Barba com toalha quente e acabamento preciso.', priceCents: 3500, durationMinutes: 35 },
  { id: 'service-3', name: 'Corte Moderno', description: 'Visual atual com fade e styling.', priceCents: 4500, durationMinutes: 45 },
]

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceRow[]>(initialServices)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')

  const editingService = useMemo(() => services.find((service) => service.id === editingId) ?? null, [services, editingId])

  const handleSave = () => {
    const priceCents = Number(price) * 100
    const durationMinutes = Number(duration)
    if (!name.trim() || !description.trim() || Number.isNaN(priceCents) || Number.isNaN(durationMinutes)) return

    if (editingId) {
      setServices((current) =>
        current.map((service) =>
          service.id === editingId
            ? { ...service, name, description, priceCents, durationMinutes }
            : service,
        ),
      )
      setEditingId(null)
    } else {
      setServices((current) => [
        ...current,
        { id: `service-${Date.now()}`, name, description, priceCents, durationMinutes },
      ])
    }

    setName('')
    setDescription('')
    setPrice('')
    setDuration('')
  }

  const handleEdit = (serviceId: string) => {
    const service = services.find((item) => item.id === serviceId)
    if (!service) return
    setEditingId(service.id)
    setName(service.name)
    setDescription(service.description)
    setPrice((service.priceCents / 100).toString())
    setDuration(service.durationMinutes.toString())
  }

  const handleDelete = (serviceId: string) => {
    setServices((current) => current.filter((service) => service.id !== serviceId))
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="text-sm uppercase tracking-[0.35em] text-yellow-300">Gestão de serviços</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-white">Catálogo de serviços</h2>
            <p className="max-w-3xl text-sm leading-6 text-slate-400">Atualize os serviços oferecidos, defina preços e duração de forma simples.</p>
          </div>
          <Button onClick={() => { setEditingId(null); setName(''); setDescription(''); setPrice(''); setDuration('') }}>Novo serviço</Button>
        </div>
      </section>

      <Card className="overflow-hidden rounded-3xl border-white/10 bg-slate-950/80">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left">
            <thead className="bg-slate-900/80 text-slate-300">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold">Nome</th>
                <th className="px-6 py-4 text-sm font-semibold">Descrição</th>
                <th className="px-6 py-4 text-sm font-semibold">Preço</th>
                <th className="px-6 py-4 text-sm font-semibold">Duração</th>
                <th className="px-6 py-4 text-sm font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {services.map((service) => (
                <tr key={service.id} className="border-b border-white/10">
                  <td className="px-6 py-4 text-sm text-white">{service.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{service.description}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">R$ {(service.priceCents / 100).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{service.durationMinutes} min</td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => handleEdit(service.id)} className="rounded-full px-4 py-2 text-xs">Editar</Button>
                      <Button onClick={() => handleDelete(service.id)} className="rounded-full bg-red-500/10 px-4 py-2 text-xs text-red-200 hover:bg-red-500/20">Excluir</Button>
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
          <h3 className="text-xl font-semibold text-white">{editingId ? 'Editar serviço' : 'Novo serviço'}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              Nome
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-yellow-400"
                placeholder="Nome do serviço"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              Descrição
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-yellow-400"
                placeholder="Descrição breve"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              Preço
              <input
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-yellow-400"
                placeholder="Ex: 45.00"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              Duração
              <input
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                className="rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-yellow-400"
                placeholder="Ex: 40"
              />
            </label>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button onClick={() => { setEditingId(null); setName(''); setDescription(''); setPrice(''); setDuration('') }} className="rounded-full bg-white/5 text-white hover:bg-white/10">Cancelar</Button>
            <Button onClick={handleSave} className="rounded-full">Salvar serviço</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
