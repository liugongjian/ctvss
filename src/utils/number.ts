import _ from 'lodash'

/**
 * 后置补零
 * @param num 数字 | 字符串
 * @param n 位数
 */
export const suffixZero = (num: number | string, n: number) => {
  return (num + Array(n).join('0')).slice(0, n)
}

/**
 * 前置补零
 * @param num 数字
 * @param n 位数
 */
export const prefixZero = (num: number | number, n: number) => {
  return (Array(n).join('0') + num).slice(-n)
}

/**
 * 格式化存储单位
 */
export const formatStorage = (bytesize, index = 5, round = 3) => {
  let i = 0
  while (Math.abs(bytesize) >= 1024) {
    bytesize = bytesize / 1024
    i++
    if (i === index) break
  }
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const newsize = _.round(bytesize, round).toFixed(round)
  return newsize + units[i]
}

/**
 * 格式化带宽单位
 */
export const formatBandWidth = (mbps) => {
  let i = 0
  while (Math.abs(mbps) >= 1024) {
    mbps = mbps / 1024
    i++
    if (i === 1) break
  }
  const units = ['Mbps', 'Gbps', 'Tbps']
  const newsize = _.round(mbps, 3)
  return newsize + units[i]
}
