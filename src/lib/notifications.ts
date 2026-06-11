export interface BookingConfirmationService {
  id: string
  name: string
}

export interface BookingConfirmationData {
  customerName: string
  date: string
  time: string
  barberName: string
  services: BookingConfirmationService[]
  totalPriceCents: number
}

export function formatBookingConfirmationMessage(data: BookingConfirmationData) {
  const servicesList = data.services.map((service) => `- ${service.name}`).join('\n')
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(data.totalPriceCents / 100)

  return `Olá ${data.customerName}!\nSeu agendamento foi confirmado.\n\n📅 Data: ${data.date}\n⏰ Horário: ${data.time}\n💈 Barbeiro: ${data.barberName}\n\n💼 Serviços:\n${servicesList}\n\n💰 Valor: ${formattedPrice}\n\nAguardamos você!`
}
