import { cn } from '../../lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export default function Card({ children, className }: CardProps) {
  return (
    <div className={cn('bg-white rounded-lg border shadow-sm', className)}>
      {children}
    </div>
  )
}