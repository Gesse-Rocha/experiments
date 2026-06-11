 'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'

interface Service {
  id: string
  name: string
  description: string
  priceCents: number
  durationMinutes: number
}

interface Barber {
  id: string
  name: string
  phone: string
}

type SlotStatus = 'available' | 'booked' | 'closed'

interface TimeSlot {
  id: string
  barberId: string
  date: string
  time: string
  status: SlotStatus
}

const services: Service[] = [
  { id: 'service-1', name: 'Corte Clássico', description: 'Corte refinado com acabamento preciso.', priceCents: 4000, durationMinutes: 40 },
  { id: 'service-2', name: 'Barba Perfeita', description: 'Ajuste e acabamento com toalha quente.', priceCents: 3500, durationMinutes: 35 },
  { id: 'service-3', name: 'Corte Moderno', description: 'Fade moderno e detalhes personalizados.', priceCents: 4500, durationMinutes: 45 },
  { id: 'service-4', name: 'Combo Corte + Barba', description: 'Pacote completo para um visual renovado.', priceCents: 7500, durationMinutes: 75 },
]

const barbers: Barber[] = [
  { id: 'barber-1', name: 'Lucas', phone: '5511999999991' },
  { id: 'barber-2', name: 'Matheus', phone: '5511999999992' },
  { id: 'barber-3', name: 'Pedro', phone: '5511999999993' },
]

const scheduleDates = [
  { label: 'Seg', value: '2026-06-10' },
  { label: 'Ter', value: '2026-06-11' },
  { label: 'Qua', value: '2026-06-12' },
  { label: 'Qui', value: '2026-06-13' },
  { label: 'Sex', value: '2026-06-14' },
]

const timeOptions = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']

const bookedSlots = new Set([
  'barber-1|2026-06-10|10:00',
  'barber-1|2026-06-11|14:00',
  'barber-2|2026-06-12|13:00',
  'barber-3|2026-06-13|15:00',
  'barber-2|2026-06-14|09:00',
])

const schedule: TimeSlot[] = scheduleDates.flatMap((date) =>
  barbers.flatMap((barber) =>
    timeOptions.map((time) => {
      const key = `${barber.id}|${date.value}|${time}`
      const status: SlotStatus = time === '12:00' || time === '17:00' ? 'closed' : bookedSlots.has(key) ? 'booked' : 'available'
      return {
        id: `${barber.id}-${date.value}-${time}`,
        barberId: barber.id,
        date: date.value,
        time,
        status,
      }
    }),
  ),
)

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(value / 100)
}

function statusClasses(status: SlotStatus) {
  switch (status) {
    case 'available':
      return 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
    case 'booked':
      return 'border-red-400/40 bg-red-500/10 text-red-200'
    case 'closed':
    default:
      return 'border-slate-500/30 bg-slate-700/40 text-slate-300'
  }
}

function getCustomerWhatsAppLink(
  customerPhone: string,
  customerName: string,
  barberName: string,
  date: string,
  time: string,
  selectedServices: Service[],
  totalPrice: number,
) {
  const serviceList = selectedServices.length > 0
    ? selectedServices.map((service) => `- ${service.name}`).join('\n')
    : '- Nenhum serviço selecionado'
  const text = `Olá ${customerName}, tudo bem!!\nTe aguardamos na barbearia na ${date} ${time} agendado!!\n\nSegue os serviços selecionados:\n${serviceList}\n\nValor total dos serviços: ${formatCurrency(totalPrice)}\n\nAgradecemos pela preferencia.`
  return `https://api.whatsapp.com/send?phone=${customerPhone}&text=${encodeURIComponent(text)}`
}

export default function BookingWizard({ initialServiceIds }: { initialServiceIds?: string[] } = {}) {
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(scheduleDates[0].value)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  useEffect(() => {
    if (initialServiceIds && initialServiceIds.length > 0) {
      const mapped = initialServiceIds
        .map((raw) => {
          const foundById = services.find((s) => s.id === raw)
          if (foundById) return foundById.id
          const foundByName = services.find((s) => s.name === raw)
          if (foundByName) return foundByName.id
          return null
        })
        .filter((v): v is string => Boolean(v))
      if (mapped.length > 0) setSelectedServiceIds(mapped)
    }
  }, [initialServiceIds])
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [formError, setFormError] = useState('')

  const selectedServices = useMemo<Service[]>(
    () => services.filter((service) => selectedServiceIds.includes(service.id)),
    [selectedServiceIds],
  )

  const totalPrice = useMemo<number>(
    () => selectedServices.reduce((total: number, service: Service) => total + service.priceCents, 0),
    [selectedServices],
  )

  const totalDuration = useMemo<number>(
    () => selectedServices.reduce((total: number, service: Service) => total + service.durationMinutes, 0),
    [selectedServices],
  )

  const selectedBarber = selectedBarberId ? barbers.find((barber) => barber.id === selectedBarberId) ?? null : null

  const availableBarbersForDate = useMemo(
    () =>
      barbers.map((barber) => {
        const availableSlot = schedule.find(
          (slot) => slot.barberId === barber.id && slot.date === selectedDate && slot.status === 'available',
        )
        return { barber, availableSlot }
      }),
    [selectedDate],
  )

  const selectedSlot = useMemo(
    () =>
      selectedBarberId
        ? schedule.find((slot) => slot.barberId === selectedBarberId && slot.date === selectedDate && slot.time === selectedTime)
        : null,
    [selectedBarberId, selectedDate, selectedTime],
  )

  const canSchedule = selectedServices.length > 0 && selectedBarber && selectedSlot?.status === 'available'

  return (
    <div className="space-y-10 rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-100 shadow-[0_24px_90px_-50px_rgba(255,208,0,0.6)] sm:p-10">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.35em] text-yellow-300">Agendamento inteligente</p>
        <h2 className="text-3xl font-semibold text-white">Escolha serviços, barbeiro e horário com segurança.</h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-400">
          Selecione múltiplos serviços e escolha o fluxo que melhor se encaixa para você: barbeiro primeiro ou data/hora primeiro.
        </p>
      </div>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6 rounded-3xl border border-white/10 bg-black/60 p-6">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">Selecione serviços</h3>
            <p className="text-sm text-slate-400">Escolha o serviço desejado antes de avançar para o dia e o profissional.</p>
          </div>

          <div className="grid gap-4">
            {services.map((service) => {
              const checked = selectedServiceIds.includes(service.id)
              return (
                <label key={service.id} className="flex cursor-pointer items-start gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:border-yellow-300/40">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      setSelectedServiceIds((current) =>
                        current.includes(service.id) ? current.filter((id) => id !== service.id) : [...current, service.id],
                      )
                    }}
                    className="mt-1 h-5 w-5 rounded border-white/20 bg-slate-950 text-yellow-400 focus:ring-yellow-400"
                  />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-semibold text-white">{service.name}</span>
                      <span className="text-sm text-slate-300">{formatCurrency(service.priceCents)}</span>
                    </div>
                    <p className="text-sm leading-6 text-slate-400">{service.description}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{service.durationMinutes} min</p>
                  </div>
                </label>
              )
            })}
          </div>

          <div className="grid gap-4 rounded-3xl border border-yellow-400/20 bg-yellow-400/5 p-5 text-slate-900">
            <div className="flex items-center justify-between">
              <span className="font-medium">Valor Total</span>
              <span className="font-semibold">{formatCurrency(totalPrice)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Duração Total</span>
              <span className="font-semibold">{totalDuration} min</span>
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-3xl border border-white/10 bg-black/60 p-6">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">Escolha o dia</h3>
            <p className="text-sm text-slate-400">Selecione o dia para ver os profissionais disponíveis.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {scheduleDates.map((date) => (
              <button
                key={date.value}
                type="button"
                onClick={() => {
                  setSelectedDate(date.value)
                  setSelectedBarberId(null)
                  setSelectedTime('')
                }}
                className={`rounded-3xl border px-4 py-3 text-sm font-semibold transition ${
                  selectedDate === date.value
                    ? 'border-yellow-400 bg-yellow-400/10 text-yellow-300'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                }`}
              >
                {date.label} • {date.value}
              </button>
            ))}
          </div>
          <div className="space-y-3 rounded-3xl border border-white/10 bg-slate-950/80 p-4">
            <p className="text-sm font-semibold text-white">Profissionais disponíveis em {selectedDate}</p>
            <div className="space-y-3">
              {availableBarbersForDate.map(({ barber, availableSlot }) => (
                <div key={barber.id} className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-white">{barber.name}</p>
                    <p className="text-sm text-slate-400">{availableSlot ? 'Tem horário disponível' : 'Sem horários livres neste dia'}</p>
                    {availableSlot ? (
                      <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Hora sugerida: {availableSlot.time}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => {
                        if (availableSlot) {
                          setSelectedBarberId(barber.id)
                          setSelectedTime(availableSlot.time)
                        }
                      }}
                      disabled={!availableSlot}
                      className="rounded-full px-5 py-3"
                    >
                      Selecionar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-slate-300">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Status do agendamento</p>
            <p className="mt-2 text-sm">
              Serviço{selectedServices.length === 1 ? '' : 's'} selecionado{selectedServices.length === 1 ? '' : 's'}: {selectedServices.length}
            </p>
            <p className="text-sm">Data: {selectedDate}</p>
            <p className="text-sm">Barbeiro: {selectedBarber ? selectedBarber.name : 'Nenhum selecionado'}</p>
            <p className="text-sm">Horário: {selectedTime || 'Aguardando seleção'}</p>
          </div>

          <Button
            onClick={() => {
              if (canSchedule) {
                setShowConfirmationModal(true)
                setFormError('')
              }
            }}
            disabled={!canSchedule}
            className="w-full rounded-full px-6 py-4 text-base font-semibold transition"
          >
            {canSchedule ? 'Agendar agora' : 'Selecione serviço, dia e profissional'}
          </Button>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/60 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-300">Resumo do agendamento</p>
            <h3 className="mt-1 text-xl font-semibold text-white">Serviços selecionados e slot atual</h3>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            Confirme os dados do cliente para concluir o agendamento internamente.
          </div>
        </div>

        <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 text-slate-300 sm:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Barbeiro</p>
              <p className="font-semibold text-white">{selectedBarber ? selectedBarber.name : 'Nenhum selecionado'}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Data / Hora</p>
              <p className="font-semibold text-white">{selectedDate} • {selectedTime || 'Nenhum horário'}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Serviços</p>
            <p className="font-semibold text-white">{selectedServices.length} selecionado(s)</p>
          </div>
        </div>
      </section>
      {showConfirmationModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[32px] border border-white/10 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-white">Dados do cliente</h3>
                <p className="mt-2 text-sm text-slate-400">Preencha os dados obrigatórios para concluir o agendamento.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmationModal(false)
                  setFormError('')
                }}
                className="text-slate-400 transition hover:text-white"
              >
                Fechar
              </button>
            </div>

            <div className="mt-8 space-y-6">
              <label className="block">
                <span className="text-sm font-semibold text-slate-300">Nome</span>
                <input
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
                  placeholder="Nome do cliente"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-300">Telefone / WhatsApp</span>
                <input
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
                  placeholder="5511999999999"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-300">Email (opcional)</span>
                <input
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
                  placeholder="email@exemplo.com"
                />
              </label>

              {formError ? <p className="text-sm text-red-300">{formError}</p> : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmationModal(false)
                    setFormError('')
                  }}
                  className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!customerName.trim() || !customerPhone.trim()) {
                      setFormError('Nome e telefone são obrigatórios.')
                      return
                    }
                    if (!selectedBarber) {
                      setFormError('Selecione um barbeiro antes de concluir.')
                      return
                    }
                    const whatsappUrl = getCustomerWhatsAppLink(
                      customerPhone.trim(),
                      customerName.trim(),
                      selectedBarber.name,
                      selectedDate,
                      selectedTime,
                      selectedServices,
                      totalPrice,
                    )
                    window.open(whatsappUrl, '_blank')
                    setShowConfirmationModal(false)
                    setFormError('')
                  }}
                  className="rounded-full bg-yellow-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-yellow-300"
                >
                  Concluir
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
