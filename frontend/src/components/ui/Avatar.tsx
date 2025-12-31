import { cn } from '../../lib/utils'

interface AvatarProps {
  src?: string
  alt?: string
  className?: string
  fallback?: string
}

export default function Avatar({ src, alt, className, fallback }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn('rounded-full object-cover', className)}
      />
    )
  }
  
  return (
    <div className={cn(
      'rounded-full bg-gray-200 flex items-center justify-center text-gray-600',
      className
    )}>
      {fallback?.charAt(0).toUpperCase() || 'U'}
    </div>
  )
}