import { format, subDays, subHours, parseISO } from 'date-fns'

function getLogicalNow(dayStartHour: number): Date {
  return subHours(new Date(), dayStartHour)
}

export function getTodayDateStr(dayStartHour = 0): string {
  return format(getLogicalNow(dayStartHour), 'yyyy-MM-dd')
}

export function getDateStr(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function formatDisplayDate(dateStr: string, dayStartHour = 0): string {
  const logicalToday = getTodayDateStr(dayStartHour)
  const logicalYesterday = getDateStr(subDays(getLogicalNow(dayStartHour), 1))
  const date = parseISO(dateStr)
  if (dateStr === logicalToday) return `Today, ${format(date, 'MMM d')}`
  if (dateStr === logicalYesterday) return `Yesterday, ${format(date, 'MMM d')}`
  return format(date, 'EEE, MMM d')
}

export function formatTime(timestamp: number): string {
  return format(new Date(timestamp), 'h:mm a')
}

export function formatShortDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d')
}

export function formatDayLabel(dateStr: string, dayStartHour = 0): string {
  if (dateStr === getTodayDateStr(dayStartHour)) return 'Today'
  return format(parseISO(dateStr), 'EEE')
}

export function getLast7Days(dayStartHour = 0): string[] {
  const logicalNow = getLogicalNow(dayStartHour)
  return Array.from({ length: 7 }, (_, i) =>
    getDateStr(subDays(logicalNow, 6 - i))
  )
}

export function navigateDate(dateStr: string, direction: -1 | 1): string {
  const date = parseISO(dateStr)
  return getDateStr(subDays(date, -direction))
}

export function formatHour(hour: number): string {
  const d = new Date(2000, 0, 1, hour)
  return format(d, 'h:mm a')
}
