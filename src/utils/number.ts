import _ from 'lodash'

/**
 * 后置补零
 * @param num 数字 | 字符串
 * @param n 位数
 */
export const suffixZero = (num: number | string, n: number) => {
  return (num + Array(n).join('0')).slice(0, n)
}

export const formatStorage = (bytesize) => {
  let i = 0
  while (Math.abs(bytesize) >= 1024) {
    bytesize = bytesize / 1024
    i++
    if (i === 5) break
  }
  const units = ['B', 'K', 'M', 'G', 'T', 'P']
  const newsize = _.round(bytesize,3)
  return newsize + units[i]
}

export const formatBandWidth = (mbps) => {
  let i = 0
  while (Math.abs(mbps) >= 1024) {
    mbps = mbps / 1024
    i++
    if (i === 1) break
  }
  const units = ['Mbps', 'Gbps', 'Tbps']
  const newsize = _.round(mbps,3)
  return newsize + units[i]
}
