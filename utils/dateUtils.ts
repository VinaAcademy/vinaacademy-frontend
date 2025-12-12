import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

/**
 * Parse date from various formats including Spring Boot LocalDateTime array
 * Spring Boot serializes LocalDateTime as [year, month, day, hour, minute, second, nano]
 * or as string "YYYY-MM-DD HH:mm:ss"
 */
function parseDate(
  dateInput: string | number[] | Date | null | undefined,
): Date | null {
  if (!dateInput) return null

  // Already a Date object
  if (dateInput instanceof Date) return dateInput

  // Handle array format from Spring Boot [year, month, day, hour, minute, second]
  if (Array.isArray(dateInput) && dateInput.length >= 3) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateInput
    return new Date(year, month - 1, day, hour, minute, second)
  }

  // Handle string format
  if (typeof dateInput === 'string') {
    // Try parsing "YYYY-MM-DD HH:mm:ss" format from Spring Boot
    const match = dateInput.match(
      /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/,
    )
    if (match) {
      const [, year, month, day, hour, minute, second] = match
      return new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second),
      )
    }

    // Try standard date parsing
    const date = new Date(dateInput)
    if (!isNaN(date.getTime())) return date
  }

  return null
}

export function formatDate(
  dateInput: string | number[] | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  },
): string {
  const date = parseDate(dateInput)
  if (!date || isNaN(date.getTime())) return 'Không rõ'

  return date.toLocaleDateString('vi-VN', options)
}

export function formatDateTime(
  dateInput: string | number[] | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  },
): string {
  const date = parseDate(dateInput)
  if (!date || isNaN(date.getTime())) return 'Không rõ'

  return date.toLocaleDateString('vi-VN', options)
}

export const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Vừa xong'
  if (diffMins < 60) return `${diffMins} phút trước`
  if (diffHours < 24)
    return date.toLocaleTimeString('vi-VN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  if (diffDays < 7)
    return date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })

  return date.toLocaleDateString('vi-VN', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export const getTimeAgo = (dateString: string) => {
  return formatDistanceToNow(new Date(dateString), {
    addSuffix: true,
    locale: vi,
  })
}

export const calculateDuration = (startTime: string, endTime: string) => {
  const start = new Date(startTime)
  const end = new Date(endTime)
  const durationMs = end.getTime() - start.getTime()

  const minutes = Math.floor(durationMs / (1000 * 60))
  const seconds = Math.floor((durationMs % (1000 * 60)) / 1000)

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
