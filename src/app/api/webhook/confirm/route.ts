import { NextRequest, NextResponse } from 'next/server'
import { BookingConfirmationData, formatBookingConfirmationMessage } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  const data = (await request.json()) as BookingConfirmationData
  const message = formatBookingConfirmationMessage(data)

  // Aqui você pode disparar a requisição para a API externa de WhatsApp
  // Exemplo fictício:
  // await fetch('https://api.evolution.whatsapp/send', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ phone: data.customerPhone, message }),
  // })

  return NextResponse.json({ success: true, message })
}
