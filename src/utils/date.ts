import { format } from 'date-fns'
import { isIE } from './browser'

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

export const durationFormatInVideo = (duration: number) => {
  if (duration < 3600) {
    const minute = Math.floor(duration / 60)
    const second = duration % 60
    return `${minute}:${prefixZero(second, 2)}`
  } else {
    const hour = Math.floor(duration / 3600)
    const minute = Math.floor(duration % 3600 / 60)
    const second = duration % 60
    return `${hour}:${minute}:${prefixZero(second, 2)}`
  }
}

export const getLocaleDate = () => {
  if (isIE()) {
    const date = new Date()
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
  } else {
    return new Date(new Date().toLocaleDateString())
  }
}

export const getTimestamp = (time: string) => {
  let timestamp
  if (isIE()) {
    timestamp = new Date(time.replace(/-/g, '/').replace(/T|Z/g, ' ').trim()).getTime()
  } else {
    // 非IE
    timestamp = new Date(time).getTime()
  }
  return timestamp
}

/**
 * 补零
 * @param num 数字
 * @param n 位数
 */
export const prefixZero = (num: number, n: number) => {
  return (Array(n).join('0') + num).slice(-n)
}
