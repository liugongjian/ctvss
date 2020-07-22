export const formatSeconds = (row: any, col: any, val: any) => {
  let res = ''
  if (val / 3600 >= 1) {
    res += Math.floor(val / 3600) + '小时'
    val %= 3600
  }
  if (val / 60 >= 1) {
    res += Math.floor(val / 60) + '分钟'
    val %= 60
  }
  if (val >= 1) {
    res += val + '秒'
  }
  return res
}
