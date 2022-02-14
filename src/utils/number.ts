/**
 * 后置补零
 * @param num 数字 | 字符串
 * @param n 位数
 */
export const suffixZero = (num: number | string, n: number) => {
  return (num + Array(n).join('0')).slice(0, n)
}
