import { format } from 'date-fns'

export const dateFormat = (date?: Date, formatString = 'yyyy-MM-dd HH:mm:ss') => {
  if (!date) return ''
  return format(date, formatString)
}

export const dateFormatInTable = (row: any, col: any, val: any) => {
  if (!val) return '-'
  return dateFormat(val)
}

export const durationFormat = (duration: number) => {
  if (duration < 60) {
    return `${duration}秒`
  }
  if (duration > 60 && duration < 3600 * 3) {
    const minute = Math.floor(duration / 60)
    const second = duration % 60
    return second === 0 ? `${minute}分` : `${minute}分${second}秒`
  }
  if (duration > 3600 * 3) {
    const hour = Math.floor(duration / 3600)
    const minute = Math.floor(duration % 3600 / 60)
    const second = duration % 60
    if (second !== 0) {
      return `${hour}小时${minute}分${second}秒`
    } else if (minute !== 0) {
      return `${hour}小时${minute}分`
    } else {
      return `${hour}小时`
    }
  }
}

export const durationFormatInTable = (row: any, col: any, val: any) => {
  if (!val) return '-'
  return durationFormat(val)
}
