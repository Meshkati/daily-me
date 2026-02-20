import { format, subDays, isToday, isYesterday, parseISO } from 'date-fns'

export function getTodayDateStr(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function getDateStr(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function formatDisplayDate(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isToday(date)) return `Today, ${format(date, 'MMM d')}`
  if (isYesterday(date)) return `Yesterday, ${format(date, 'MMM d')}`
  return format(date, 'EEE, MMM d')
}

export function formatTime(timestamp: number): string {
  return format(new Date(timestamp), 'h:mm a')
}

export function formatShortDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d')
}

export function formatDayLabel(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isToday(date)) return 'Today'
  return format(date, 'EEE')
}

export function getLast7Days(): string[] {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) =>
    getDateStr(subDays(today, 6 - i))
  )
}

export function navigateDate(dateStr: string, direction: -1 | 1): string {
  const date = parseISO(dateStr)
  return getDateStr(subDays(date, -direction))
}
