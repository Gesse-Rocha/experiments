"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import BookingWizard from '@/components/modules/booking-wizard'

interface TenantData {
  name: string
  slogan: string
  description: string
  hours: { label: string; value: string }[]
  address: string
  gallery: string[]
  professionals: { name: string; specialty: string; image: string }[]
  services: { name: string; description: string; price: number; duration: number }[]
}

interface LandingPageProps {
  tenant: TenantData
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(value / 100)
}

const navLinks = [
  { label: 'Início', href: '#hero' },
  { label: 'Sobre', href: '#about' },
  { label: 'Galeria', href: '#gallery' },
  { label: 'Serviços', href: '#services' },
]

export default function LandingPage({ tenant }: LandingPageProps) {
  const [showBooking, setShowBooking] = useState(false)
  const [preselectedServiceIds, setPreselectedServiceIds] = useState<string[]>([])
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8 lg:px-16">
          <a href="#hero" className="text-lg font-black uppercase tracking-[0.3em] text-yellow-400 hover:text-white">
            {tenant.name}
          </a>
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm font-medium text-slate-300 transition hover:text-white">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-4 md:flex">
            <a
              href="#services"
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Agendar
            </a>
          </div>
        </div>
      </header>

      <section id="hero" className="relative overflow-hidden px-6 py-24 sm:px-8 lg:px-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 pt-20 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-8 animate-appear-up">
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm uppercase tracking-[0.3em] text-yellow-400">
              {tenant.name}
            </div>
            <div className="space-y-6">
              <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                {tenant.slogan}
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                {tenant.description}
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button className="w-full sm:w-auto transition-transform duration-300 hover:-translate-y-0.5">Agendar Agora</Button>
              <a
                href="#services"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
              >
                Ver Serviços
              </a>
            </div>
          </div>

          <div className="relative max-w-2xl overflow-hidden rounded-[40px] border border-white/10 bg-white/5 p-1 shadow-[0_30px_120px_-60px_rgba(255,208,0,0.35)] animate-fade-in">
            <div className="overflow-hidden rounded-[38px] bg-black">
              <img
                src="data:image/jpeg;base64,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"
                alt="Ambiente da barbearia"
                className="h-[420px] w-full object-cover object-center sm:h-[480px]"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="border-t border-white/10 px-6 py-16 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-7xl space-y-12">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.9fr] lg:items-start">
            <div className="space-y-6 animate-appear-up">
              <h2 className="text-3xl font-semibold">Sobre a Barbearia</h2>
              <p className="max-w-2xl leading-7 text-slate-300">
                Fundada para resgatar a experiência clássica com um toque contemporâneo, nossa barbearia entrega cortes, barba e atendimento de alto padrão em um ambiente elegante e acolhedor.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {tenant.hours.map((item) => (
                  <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-5 transition duration-500 hover:-translate-y-1 hover:bg-white/10">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                    <p className="mt-2 text-lg font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <Card className="h-full bg-black/70 animate-appear-up">
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-semibold">Localização</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{tenant.address}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-slate-400">
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400/10 text-yellow-300">
                    📍
                  </div>
                  <p className="font-semibold text-white">Google Maps</p>
                  <p className="mt-2 text-sm leading-6">Mapa simulado mostrando nossa localização e facilidade de acesso.</p>
                  <div className="mt-6 h-52 rounded-3xl bg-white/5 p-4 text-left text-slate-300">
                    <div className="mb-2 h-2 w-24 rounded-full bg-white/10" />
                    <div className="mb-6 h-2 w-32 rounded-full bg-white/10" />
                    <div className="grid gap-2">
                      <div className="h-10 rounded-2xl bg-white/10" />
                      <div className="h-10 rounded-2xl bg-white/10" />
                      <div className="h-10 rounded-2xl bg-white/10" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section id="team" className="border-t border-white/10 px-6 py-16 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-2xl animate-appear-up">
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-400">Profissionais</p>
            <h2 className="mt-4 text-3xl font-semibold">Nossa equipe</h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Conheça os especialistas que cuidam do seu estilo com precisão, técnica e atendimento personalizado.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tenant.professionals.map((pro) => (
              <Card key={pro.name} className="overflow-hidden rounded-[30px] border border-white/10 bg-white/5 transition duration-500 hover:-translate-y-1 hover:border-yellow-400/40">
                <img src={pro.image} alt={pro.name} className="h-64 w-full object-cover object-center" />
                <div className="space-y-3 p-6">
                  <h3 className="text-xl font-semibold">{pro.name}</h3>
                  <p className="text-sm uppercase tracking-[0.2em] text-yellow-400">{pro.specialty}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="gallery" className="border-t border-white/10 px-6 py-16 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-2xl animate-appear-up">
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-400">Galeria</p>
            <h2 className="mt-4 text-3xl font-semibold">Ambiente e Serviços</h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Veja como nosso espaço foi pensado para proporcionar conforto, estilo e exclusividade em cada visita.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tenant.gallery.map((src, index) => (
              <div key={index} className="overflow-hidden rounded-[30px] border border-white/10 bg-white/5 transition duration-500 hover:-translate-y-1 hover:shadow-[0_16px_50px_-30px_rgba(255,208,0,0.45)]">
                <img
                  src={src}
                  alt={`Galeria ${index + 1}`}
                  className="h-64 w-full object-cover object-center transition duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="border-t border-white/10 px-6 py-16 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-2xl animate-appear-up">
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-400">Serviços</p>
            <h2 className="mt-4 text-3xl font-semibold">O que oferecemos</h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Escolha o serviço ideal para seu estilo com preços transparentes e duração prevista para você se planejar facilmente.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {tenant.services.map((service) => (
              <Card key={service.name} className="group overflow-hidden transition duration-500 hover:-translate-y-1 hover:border-yellow-400/40">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-xl font-semibold">{service.name}</h3>
                    <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-sm font-semibold text-yellow-300">
                      {service.duration} min
                    </span>
                  </div>
                  <p className="leading-7 text-slate-300">{service.description}</p>
                  <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4 text-lg font-semibold text-white">
                    <span>{formatCurrency(service.price)}</span>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setPreselectedServiceIds([service.name ? service.name : service.name])
                        setShowBooking(true)
                      }}
                      className="transition-transform duration-300 group-hover:-translate-y-0.5"
                    >
                      Agendar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {showBooking ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <div className="relative bg-slate-950/95 rounded-2xl border border-white/10 p-6 shadow-lg">
              <div className="absolute right-4 top-4">
                <button onClick={() => setShowBooking(false)} className="rounded-full bg-white/5 px-4 py-2 text-sm">Fechar</button>
              </div>
              <div className="mt-2">
                <BookingWizard initialServiceIds={preselectedServiceIds} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
