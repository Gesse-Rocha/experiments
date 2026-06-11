import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div className={cn('rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-40px_rgba(255,208,0,0.5)]', className)} {...props} />
  )
}
