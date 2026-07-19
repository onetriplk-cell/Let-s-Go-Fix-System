import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

type IllustrationKind = 'vehicles' | 'history' | 'providers' | 'search'

function Illustration({ kind }: { kind: IllustrationKind }) {
  const common = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  }

  if (kind === 'vehicles') {
    return (
      <motion.svg {...common} width="120" height="90" viewBox="0 0 120 90" fill="none">
        <ellipse cx="60" cy="76" rx="46" ry="6" className="fill-slate-100 dark:fill-slate-800" />
        <path
          d="M20 58 L28 38 Q31 32 38 32 H82 Q89 32 92 38 L100 58 Z"
          className="fill-brand-100 stroke-brand-300 dark:fill-brand-500/10 dark:stroke-brand-500/30"
          strokeWidth="2"
        />
        <rect x="14" y="56" width="92" height="14" rx="6" className="fill-brand-200 stroke-brand-400 dark:fill-brand-500/20 dark:stroke-brand-500/40" strokeWidth="2" />
        <circle cx="34" cy="72" r="8" className="fill-slate-700 dark:fill-slate-300" />
        <circle cx="34" cy="72" r="3.5" className="fill-slate-300 dark:fill-slate-700" />
        <circle cx="86" cy="72" r="8" className="fill-slate-700 dark:fill-slate-300" />
        <circle cx="86" cy="72" r="3.5" className="fill-slate-300 dark:fill-slate-700" />
        <rect x="40" y="40" width="18" height="14" rx="2" className="fill-white/70 stroke-brand-400 dark:fill-slate-900/50 dark:stroke-brand-500/40" strokeWidth="1.5" />
        <rect x="62" y="40" width="18" height="14" rx="2" className="fill-white/70 stroke-brand-400 dark:fill-slate-900/50 dark:stroke-brand-500/40" strokeWidth="1.5" />
      </motion.svg>
    )
  }

  if (kind === 'history') {
    return (
      <motion.svg {...common} width="120" height="90" viewBox="0 0 120 90" fill="none">
        <rect x="30" y="16" width="60" height="66" rx="8" className="fill-brand-50 stroke-brand-300 dark:fill-brand-500/10 dark:stroke-brand-500/30" strokeWidth="2" />
        <rect x="42" y="8" width="36" height="14" rx="4" className="fill-brand-200 stroke-brand-400 dark:fill-brand-500/20 dark:stroke-brand-500/40" strokeWidth="2" />
        <line x1="42" y1="36" x2="78" y2="36" className="stroke-brand-300 dark:stroke-brand-500/30" strokeWidth="2" strokeLinecap="round" />
        <line x1="42" y1="48" x2="70" y2="48" className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="2" strokeLinecap="round" />
        <line x1="42" y1="60" x2="74" y2="60" className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="2" strokeLinecap="round" />
        <circle cx="90" cy="66" r="14" className="fill-emerald-100 stroke-emerald-400 dark:fill-emerald-500/15 dark:stroke-emerald-500/40" strokeWidth="2" />
        <path d="M84 66 L88 70 L96 61" className="stroke-emerald-500 dark:stroke-emerald-400" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </motion.svg>
    )
  }

  if (kind === 'providers') {
    return (
      <motion.svg {...common} width="120" height="90" viewBox="0 0 120 90" fill="none">
        <circle cx="60" cy="40" r="26" className="fill-brand-50 stroke-brand-300 dark:fill-brand-500/10 dark:stroke-brand-500/30" strokeWidth="2" />
        <path d="M48 46 L54 38 L60 44 L66 32 L72 46" className="stroke-brand-400 dark:stroke-brand-500/60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M60 66 L60 84 M48 78 L60 84 L72 78" className="stroke-slate-300 dark:stroke-slate-700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </motion.svg>
    )
  }

  return (
    <motion.svg {...common} width="120" height="90" viewBox="0 0 120 90" fill="none">
      <circle cx="52" cy="42" r="22" className="fill-brand-50 stroke-brand-300 dark:fill-brand-500/10 dark:stroke-brand-500/30" strokeWidth="2" />
      <line x1="68" y1="58" x2="86" y2="76" className="stroke-brand-300 dark:stroke-brand-500/30" strokeWidth="4" strokeLinecap="round" />
    </motion.svg>
  )
}

export function EmptyState({
  kind,
  title,
  description,
  action,
}: {
  kind: IllustrationKind
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <Illustration kind={kind} />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</p>
        <p className="text-sm text-slate-400 dark:text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  )
}
