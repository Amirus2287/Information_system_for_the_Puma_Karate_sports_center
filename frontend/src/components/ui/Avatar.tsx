import { useState } from 'react'
import { cn } from '../../lib/utils'

interface AvatarProps {
  src?: string
  alt?: string
  className?: string
  fallback?: string
}

export default function Avatar({ src, alt, className, fallback }: AvatarProps) {
  const [imageError, setImageError] = useState(false)
  
  // Если src есть и не было ошибки загрузки
  if (src && !imageError) {
    // В dev режиме, если URL абсолютный и указывает на localhost:8000, используем прокси
    let imageSrc = src
    if (import.meta.env.DEV) {
      // Если URL абсолютный с localhost:8000, заменяем на относительный для прокси
      if (src.includes('localhost:8000')) {
        imageSrc = src.replace(/https?:\/\/localhost:8000/, '')
      } else if (src.startsWith('http://') || src.startsWith('https://')) {
        // Оставляем абсолютные URL как есть
        imageSrc = src
      } else if (src.startsWith('/media/')) {
        // Относительный URL с /media/ - используем как есть (прокси обработает)
        imageSrc = src
      } else if (src.startsWith('media/')) {
        // Относительный URL без начального слеша
        imageSrc = `/${src}`
      }
    }
    
    return (
      <img
        src={imageSrc}
        alt={alt}
        className={cn('rounded-full object-cover', className)}
        onError={(e) => {
          console.error('Avatar image load error:', imageSrc, 'Original:', src)
          setImageError(true)
        }}
        onLoad={() => {
          // Сбрасываем ошибку при успешной загрузке
          setImageError(false)
        }}
      />
    )
  }
  
  return (
    <div className={cn(
      'rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold shadow-md',
      className
    )}>
      {fallback?.charAt(0).toUpperCase() || 'U'}
    </div>
  )
}