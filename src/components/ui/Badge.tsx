import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'disponible' | 'pocas_uds' | 'agotado' | 'preventa' | 'default';
  children: React.ReactNode;
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  const baseStyles =
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none text-[10px] font-mono uppercase tracking-wider font-bold select-none';

  const variants = {
    default: 'bg-[#201f1f] text-[#e5e2e1] border border-white/[0.08]',
    disponible:
      'bg-[#064e3b]/80 text-[#34d399] border border-[#059669]/30 shadow-[0_0_8px_rgba(52,211,153,0.2)]',
    pocas_uds:
      'bg-[#78350f]/80 text-[#fbbf24] border border-[#d97706]/30 shadow-[0_0_8px_rgba(251,191,36,0.2)]',
    agotado:
      'bg-[#7f1d1d]/80 text-[#f87171] border border-[#dc2626]/30 shadow-[0_0_8px_rgba(248,113,113,0.2)]',
    preventa:
      'bg-[#4c1d95]/80 text-[#a78bfa] border border-[#7c3aed]/30 shadow-[0_0_8px_rgba(167,139,250,0.2)]',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], className))} {...props}>
      {children}
    </span>
  );
}
