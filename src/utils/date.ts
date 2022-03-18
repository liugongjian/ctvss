import { format } from 'date-fns'
import { isIE } from './browser'

export const dateFormat = (date: Date | number, formatString = 'yyyy-MM-dd HH:mm:ss') => {
  if (!date) return ''
  return format(date, formatString)
}

export const dateFormatInTable = (row: any, col: any, val: any) => {
  if (!val) return '-'
  return dateFormat(val)
}

/**
 * 格式化时间段
 * @param duration 时间段(秒)
 * @returns 字符串
 */
export const durationFormat = (duration: number) => {
  if (duration < 60) {
    return `${duration}秒`
  }
  if (duration >= 60 && duration < 3600 * 3) {
    const minute = Math.floor(duration / 60)
    const second = duration % 60
    return second === 0 ? `${minute}分` : `${minute}分${second}秒`
  }
  if (duration >= 3600 * 3) {
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

/**
 * 格式化时间段
 * @param duration 时间段(秒)
 * @returns 字符串
 */
export const durationFormatInVideo = (duration: number) => {
  duration = Math.round(duration)
  if (duration < 60) {
    const second = duration
    return `00:${prefixZero(second, 2)}`
  } else if (duration < 3600) {
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

/**
 * 获取客户端日期 (待检查是否弃用)
 * @returns 日期
 */
export const getLocaleDate = () => {
  if (isIE()) {
    const date = new Date()
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
  } else {
    return new Date(new Date().toLocaleDateString())
  }
}

/**
 * 根据字符串转为时间戳
 * @param time 日期字符串
 * @returns 时间戳
 */
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
 * 获取日期的时间戳
 * @param timestamp 毫秒
 * @returns 时间戳
 */
export const getDateByTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const zero = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return zero.getTime()
}

/**
 * 获取下个整点的时间戳
 * @param timestamp 毫秒
 * @returns 时间戳
 */
export const getNextHour = (timestamp: number) => {
  const date = new Date(timestamp)
  const seconds = date.getMinutes() * 60 + date.getSeconds()
  const offsetTimestamp = (60 * 60 - seconds) * 1000
  return timestamp + offsetTimestamp
}

/**
 * 前置补零
 * @param num 数字
 * @param n 位数
 */
export const prefixZero = (num: number, n: number) => {
  return (Array(n).join('0') + num).slice(-n)
}

/**
 * 获取当前时间的零点偏移量（据零点的毫秒数）
 */
export const currentTimeZeroMsec = (currentTime: number) => {
  const currentDate = new Date(currentTime).toLocaleDateString()
  return currentTime - new Date(currentDate).getTime()
}

/**
 * 获取当前日期的后一天 / return s
 */
export const getDateAfter = (currentDate: number) => {
  const dayAfter = new Date(new Date(currentDate).getTime() + 24 * 60 * 60 * 1000).toLocaleDateString()
  const dayAfterStart = new Date(dayAfter).getTime() / 1000
  const dayAfterEnd = (new Date(dayAfter).getTime() + 24 * 60 * 60 * 1000 - 1000) / 1000
  console.log('后一天')
  return {
    dayAfterStart,
    dayAfterEnd
  }
}

/**
 * 获取当前日期的前一天 / return s
 */
export const getDateBefore = (currentDate: number) => {
  const datBefore = new Date(new Date(currentDate).getTime() - 24 * 60 * 60 * 1000).toLocaleDateString()
  const dayBeforeStart = new Date(datBefore).getTime() / 1000
  const dayBeforeEnd = (new Date(datBefore).getTime() + 24 * 60 * 60 * 1000 - 1000) / 1000
  console.log('前一天')
  return {
    dayBeforeStart,
    dayBeforeEnd
  }
}

/**
 * 移动时间轴前后时间是否跨天 / ms
 */
export const isCrossDays = (MoveStartTime: number, MoveEndTime: number) => {
  if (MoveStartTime === MoveEndTime) return false
  return new Date(MoveStartTime).getDate() - new Date(MoveEndTime).getDate() !== 0
}
