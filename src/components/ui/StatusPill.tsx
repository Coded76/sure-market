import { capitalise } from '@/lib/utils'

type Status = 'pending' | 'processing' | 'delivered' | 'failed' | string

const STATUS_MAP: Record<string, { cls: string; icon: string }> = {
  delivered:  { cls: 'pill-success', icon: '✓' },
  pending:    { cls: 'pill-pending', icon: '◷' },
  processing: { cls: 'pill-pending', icon: '◷' },
  failed:     { cls: 'pill-failed',  icon: '✕' },
}

export function StatusPill({ status }: { status: Status }) {
  const { cls, icon } = STATUS_MAP[status] ?? { cls: 'pill-info', icon: '•' }
  return (
    <span className={`pill ${cls}`}>
      {icon} {capitalise(status)}
    </span>
  )
}
