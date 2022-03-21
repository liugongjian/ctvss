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
    if (i === 4) break
  }
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const newsize = Math.round(bytesize)
  return newsize + units[i]
}
