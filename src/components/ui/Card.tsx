import { CSSProperties, ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  padding?: number | string
  style?: CSSProperties
  className?: string
  onClick?: () => void
  hoverable?: boolean
}

export function Card({ children, padding = 20, style, className, onClick, hoverable }: CardProps) {
  return (
    <div
      className={`card${className ? ` ${className}` : ''}`}
      onClick={onClick}
      style={{
        padding,
        cursor: onClick || hoverable ? 'pointer' : undefined,
        transition: hoverable ? 'border-color .2s, transform .2s' : undefined,
        ...style,
      }}
      onMouseEnter={hoverable ? e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'translateY(-2px)'
        el.style.borderColor = 'var(--border2)'
      } : undefined}
      onMouseLeave={hoverable ? e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'none'
        el.style.borderColor = 'var(--border)'
      } : undefined}
    >
      {children}
    </div>
  )
}
