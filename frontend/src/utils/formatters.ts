/**
 * Форматирование времени из формата HH:MM:SS в HH:MM
 */
export function formatTime(time: string | undefined): string {
  if (!time) return ''
  return time.slice(0, 5) // Убираем секунды из "HH:MM:SS"
}

/**
 * Форматирование промежутка времени работы зала или тренировки
 */
export function formatWorkingHours(workStart?: string, workEnd?: string): string {
  if (!workStart) return 'Не указано'
  const start = formatTime(workStart)
  if (!workEnd) return `с ${start}`
  const end = formatTime(workEnd)
  return `${start} — ${end}`
}

/** Время тренировки: "18:00 — 19:30" */
export function formatTrainingTime(timeStart?: string, timeEnd?: string): string {
  if (!timeStart) return ''
  const start = formatTime(timeStart)
  if (!timeEnd) return start
  return `${start} — ${formatTime(timeEnd)}`
}

/**
 * Парсинг даты YYYY-MM-DD как локальной (без сдвига по UTC).
 * new Date("2025-02-03") в JS = полночь UTC → в Москве показывается предыдущий день.
 */
export function toLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date()
  return new Date(dateStr + 'T12:00:00')
}

/** Локальная дата в формате YYYY-MM-DD (без перевода в UTC). */
export function toLocalDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Форматирование даты
 */
export function formatDate(dateString: string): string {
  const date = toLocalDate(dateString)
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
  const date = toLocalDate(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
