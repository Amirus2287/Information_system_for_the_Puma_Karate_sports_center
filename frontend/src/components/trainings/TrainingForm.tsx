import React, { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { trainingsApi } from '../../api/trainings'
import Dialog from '../ui/Dialog'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import toast from 'react-hot-toast'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']

function getMonthGrid(year: number, month: number): (string | null)[] {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const firstWeekday = (first.getDay() + 6) % 7
  const daysInMonth = last.getDate()
  const cells: (string | null)[] = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push(dateStr)
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function isPast(dateStr: string): boolean {
  const today = new Date().toISOString().slice(0, 10)
  return dateStr < today
}

interface TrainingFormProps {
  open: boolean
  onClose: () => void
  initialDate?: string
  initialTime?: string
}

export default function TrainingForm({ open, onClose, initialDate, initialTime }: TrainingFormProps) {
  const queryClient = useQueryClient()
  const [calendarYear, setCalendarYear] = useState(() => {
    if (initialDate) return new Date(initialDate + 'T12:00:00').getFullYear()
    return new Date().getFullYear()
  })
  const [calendarMonth, setCalendarMonth] = useState(() => {
    if (initialDate) return new Date(initialDate + 'T12:00:00').getMonth()
    return new Date().getMonth()
  })
  const [selectedDates, setSelectedDates] = useState<Set<string>>(() => {
    if (initialDate) return new Set([initialDate])
    return new Set()
  })

  const { register, handleSubmit, reset } = useForm<any>({
    defaultValues: {
      group: '',
      time_start: initialTime || '18:00',
      time_end: '19:30',
      topic: '',
    },
  })

  React.useEffect(() => {
    if (!open) return
    if (initialDate) {
      setSelectedDates(new Set([initialDate]))
      setCalendarYear(new Date(initialDate + 'T12:00:00').getFullYear())
      setCalendarMonth(new Date(initialDate + 'T12:00:00').getMonth())
    } else {
      setSelectedDates(new Set())
      const n = new Date()
      setCalendarYear(n.getFullYear())
      setCalendarMonth(n.getMonth())
    }
  }, [open, initialDate])

  const monthGrid = useMemo(
    () => getMonthGrid(calendarYear, calendarMonth),
    [calendarYear, calendarMonth]
  )

  const toggleDate = (dateStr: string | null) => {
    if (!dateStr) return
    setSelectedDates((prev) => {
      const next = new Set(prev)
      if (next.has(dateStr)) next.delete(dateStr)
      else next.add(dateStr)
      return next
    })
  }

  const goPrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarYear((y) => y - 1)
      setCalendarMonth(11)
    } else {
      setCalendarMonth((m) => m - 1)
    }
  }

  const goNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarYear((y) => y + 1)
      setCalendarMonth(0)
    } else {
      setCalendarMonth((m) => m + 1)
    }
  }

  const sortedDates = useMemo(
    () => Array.from(selectedDates).sort(),
    [selectedDates]
  )

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: () => trainingsApi.getGroups(),
  })

  const bulkMutation = useMutation({
    mutationFn: (data: { group: number; time_start: string; time_end: string; topic?: string; dates: string[] }) =>
      trainingsApi.createTrainingsBulk(data),
    onSuccess: (res: { created: number; errors?: string[] }) => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] })
      onClose()
      reset()
      setSelectedDates(new Set())
      if (res.created > 0) {
        toast.success(`Создано тренировок: ${res.created}`)
      }
      if (res.errors?.length) {
        res.errors.forEach((e) => toast.error(e))
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Ошибка при создании тренировок')
    },
  })

  const onSubmit = (data: any) => {
    const groupId = Number(data.group)
    if (!groupId) {
      toast.error('Выберите группу')
      return
    }
    if (sortedDates.length === 0) {
      toast.error('Выберите дни тренировок в календаре')
      return
    }
    bulkMutation.mutate({
      group: groupId,
      time_start: data.time_start,
      time_end: data.time_end,
      topic: data.topic || undefined,
      dates: sortedDates,
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose()
          reset()
          setSelectedDates(new Set())
        }
      }}
      title="Новая тренировка"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select label="Группа" {...register('group', { required: true })}>
          <option value="">Выберите группу</option>
          {groups?.map((group: any) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </Select>

        <div className="rounded-xl border-2 border-gray-200 bg-gray-50/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={goPrevMonth}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              aria-label="Предыдущий месяц"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-600" />
              {MONTHS[calendarMonth]} {calendarYear}
            </h3>
            <button
              type="button"
              onClick={goNextMonth}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              aria-label="Следующий месяц"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500 py-1"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthGrid.map((cell, i) => {
              if (cell === null) {
                return <div key={`e-${i}`} className="aspect-square" />
              }
              const selected = selectedDates.has(cell)
              const past = isPast(cell)
              const dayNum = parseInt(cell.slice(8), 10)
              return (
                <button
                  key={cell}
                  type="button"
                  onClick={() => toggleDate(cell)}
                  className={`
                    aspect-square rounded-lg text-sm font-medium transition-all
                    ${past && !selected ? 'text-gray-400 hover:bg-gray-100' : 'hover:bg-primary-100'}
                    ${selected ? 'bg-primary-500 text-white hover:bg-primary-600 shadow' : 'text-gray-700'}
                  `}
                >
                  {dayNum}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Нажмите на день, чтобы отметить тренировку. Можно выбирать и прошедшие даты.
          </p>
        </div>

        {sortedDates.length > 0 && (
          <p className="text-sm text-primary-600 font-medium">
            Выбрано дней: {sortedDates.length}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input type="time" label="Время начала" {...register('time_start')} />
          <Input type="time" label="Время окончания" {...register('time_end')} />
        </div>

        <Input
          label="Тема тренировки"
          {...register('topic')}
          placeholder="Например: Основы стойки и перемещения"
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" loading={bulkMutation.isPending}>
            Создать
          </Button>
        </div>
      </form>
    </Dialog>
  )
}