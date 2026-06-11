'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Barbeiros', href: '/admin/barbers' },
  { label: 'Serviços', href: '/admin/services' },
  { label: 'Financeiro', href: '/admin/finance' },
]

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-black/80 px-6 py-5 backdrop-blur-xl sm:px-8 lg:px-16">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">Painel administrativo</p>
            <h1 className="text-2xl font-semibold">Barbearia Owner Dashboard</h1>
          </div>
          <Button className="hidden sm:inline-flex">Novo agendamento</Button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-8 sm:px-8 lg:px-16">
        <aside className="hidden w-72 shrink-0 rounded-3xl border border-white/10 bg-black/70 p-6 lg:block">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Visão geral</p>
              <p className="text-lg font-semibold text-white">Navegação do painel</p>
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className={cn(
                  'block rounded-3xl px-4 py-3 text-sm font-medium transition',
                  pathname === item.href
                    ? 'bg-yellow-400/10 text-yellow-300 ring-1 ring-yellow-300/20'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white',
                )}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1 space-y-8">
          {children}
        </main>
      </div>
    </div>
  )
}
