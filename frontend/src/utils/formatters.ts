/**
 * Форматирование времени из формата HH:MM:SS в HH:MM
 */
export function formatTime(time: string | undefined): string {
  if (!time) return ''
  return time.slice(0, 5) // Убираем секунды из "HH:MM:SS"
}

/**
 * Форматирование промежутка времени работы зала
 */
export function formatWorkingHours(workStart?: string, workEnd?: string): string {
  if (!workStart) return 'Не указано'
  const start = formatTime(workStart)
  if (!workEnd) return `с ${start}`
  const end = formatTime(workEnd)
  return `${start} — ${end}`
}

/**
 * Форматирование даты
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Форматирование даты кратко
 */
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
