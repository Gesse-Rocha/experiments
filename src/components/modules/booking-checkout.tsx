'use client'

import { FormEvent, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export interface CheckoutService {
  id: string
  name: string
  priceCents: number
  durationMinutes: number
}

export interface CheckoutBarber {
  id: string
  name: string
}

export interface BookingCheckoutProps {
  services: CheckoutService[]
  barber: CheckoutBarber
  date: string
  time: string
}

type PaymentMethod = 'pix' | 'cash'

type OrderStatus = 'PENDING' | 'PAID'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(value / 100)
}

function formatWhatsApp(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
}

export default function BookingCheckout({ services, barber, date, time }: BookingCheckoutProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [observations, setObservations] = useState('')
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('PENDING')
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)

  const totalPrice = useMemo(() => services.reduce((sum, service) => sum + service.priceCents, 0), [services])
  const totalDuration = useMemo(() => services.reduce((sum, service) => sum + service.durationMinutes, 0), [services])

  const pixKey = 'pix@barbeariapremium.com.br'
  const pixCopyPaste = '00020101021226890014BR.GOV.BCB.PIX0114pix@barbeariapremium520400005303986540840.005802BR5922Barbearia Premium6009Sao Paulo62190512VAGAM+AI6304B14F'

  const canSubmit = name.trim().length > 2 && whatsapp.replace(/\D/g, '').length >= 10

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return
    if (paymentMethod === 'pix') {
      setOrderStatus('PAID')
      setPaymentConfirmed(true)
      return
    }
    setOrderStatus('PENDING')
    setPaymentConfirmed(true)
  }

  return (
    <div className="space-y-8 rounded-3xl border border-white/10 bg-black/60 p-8 text-slate-100 shadow-[0_24px_90px_-50px_rgba(255,208,0,0.6)] sm:p-10">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.35em] text-yellow-300">Finalização</p>
        <h2 className="text-3xl font-semibold text-white">Revisão e pagamento do agendamento</h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-400">
          Confira os serviços, escolha a forma de pagamento e envie seus dados de contato para confirmar o agendamento.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <Card className="space-y-5 bg-slate-950/80 border-white/10">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Resumo do pedido</h3>
              <p className="text-sm text-slate-400">Verifique os serviços selecionados, total e tempo estimado.</p>
            </div>
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.id} className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
                  <div>
                    <p className="font-medium text-white">{service.name}</p>
                    <p className="text-sm text-slate-400">{service.durationMinutes} min</p>
                  </div>
                  <span className="text-sm font-semibold text-white">{formatCurrency(service.priceCents)}</span>
                </div>
              ))}
            </div>
            <div className="rounded-3xl border border-yellow-400/20 bg-yellow-400/5 p-4 text-slate-900">
              <div className="flex items-center justify-between text-sm">
                <span>Valor total</span>
                <strong>{formatCurrency(totalPrice)}</strong>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span>Duração total</span>
                <strong>{totalDuration} min</strong>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
              <p className="font-medium text-white">Barbeiro</p>
              <p>{barber.name}</p>
              <p className="mt-3 font-medium text-white">Data / Hora</p>
              <p>{date} • {time}</p>
            </div>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white">Nome Completo</label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Digite seu nome"
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-yellow-400"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white">WhatsApp</label>
                <input
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(formatWhatsApp(event.target.value))}
                  placeholder="(11) 9 9999-9999"
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-yellow-400"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white">Observações</label>
                <textarea
                  value={observations}
                  onChange={(event) => setObservations(event.target.value)}
                  placeholder="Alguma observação para o barbeiro?"
                  className="min-h-[120px] w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            <Button type="submit" className="w-full rounded-full px-6 py-3">
              {paymentMethod === 'pix' ? 'Confirmar pagamento via Pix' : 'Finalizar agendamento presencial'}
            </Button>

            {paymentConfirmed && (
              <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                {orderStatus === 'PAID'
                  ? 'Pagamento confirmado com sucesso! Seu agendamento está garantido.'
                  : 'Agendamento registrado. Pagamento presencial será realizado no local.'}
              </div>
            )}
          </form>
        </div>

        <div className="space-y-6">
          <Card className="space-y-6 bg-slate-950/80 border-white/10">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Opções de pagamento</h3>
              <p className="text-sm text-slate-400">Escolha como deseja pagar pelo serviço.</p>
            </div>

            <div className="grid gap-3">
              <label className={`flex cursor-pointer items-center gap-4 rounded-3xl border p-4 transition ${paymentMethod === 'pix' ? 'border-yellow-400 bg-yellow-400/10 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'}`}>
                <input
                  type="radio"
                  name="payment"
                  value="pix"
                  checked={paymentMethod === 'pix'}
                  onChange={() => setPaymentMethod('pix')}
                  className="h-5 w-5 accent-yellow-400"
                />
                <div>
                  <p className="font-semibold">Pagar agora via Pix</p>
                  <p className="text-sm text-slate-400">Receba um QR Code simulado e finalize o pagamento na hora.</p>
                </div>
              </label>

              <label className={`flex cursor-pointer items-center gap-4 rounded-3xl border p-4 transition ${paymentMethod === 'cash' ? 'border-yellow-400 bg-yellow-400/10 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'}`}>
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                  className="h-5 w-5 accent-yellow-400"
                />
                <div>
                  <p className="font-semibold">Pagar presencialmente</p>
                  <p className="text-sm text-slate-400">Você realiza o pagamento diretamente no local após o serviço.</p>
                </div>
              </label>
            </div>
          </Card>

          {paymentMethod === 'pix' ? (
            <Card className="space-y-6 bg-slate-950/80 border-white/10">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">Pagamento via Pix</h3>
                  <p className="text-sm text-slate-400">Use o QR Code ou a chave de cópia e cola para simular o pagamento.</p>
                </div>
                <div className="grid gap-4 rounded-3xl border border-white/10 bg-slate-900/90 p-4">
                  <div className="mx-auto h-52 w-52 rounded-3xl bg-white/10 p-4 text-center text-slate-300">
                    <div className="mx-auto mb-4 h-32 w-32 rounded-2xl bg-white/20" />
                    <p className="text-sm">QR Code Fictício</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm">
                    <p className="font-semibold text-white">Chave Pix Copia e Cola</p>
                    <p className="mt-2 break-all text-slate-300">{pixKey}</p>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="space-y-4 bg-slate-950/80 border-white/10">
              <div>
                <h3 className="text-xl font-semibold">Pagamento presencial</h3>
                <p className="text-sm text-slate-400">Seu agendamento será confirmado com pagamento na chegada ao local.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
