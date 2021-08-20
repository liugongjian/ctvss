import math from './math'
export const getRectPropFromPoints = (startPoint:Array<number>, endPoint:Array<number>) => {
  const left = startPoint[0]
  const top = startPoint[1]
  const width = endPoint[0] - left
  const height = endPoint[1] - top
  return {
    left, top, width, height
  }
}

const getOffsetX = (offsetZ:number, k:number) => {
  const powK = Number(math.pow!(k, 2))
  return math.divide!(offsetZ, math.sqrt!(1 + powK))
}

export const getVerticalLinePoints = (start:Array<number>, end:Array<number>, length:number) => {
  // 中垂线求法
  // 设两点的坐标分别为A（x1,y1）,B（x2,y2）.中垂线L的方程为y=kx+b,则：
  // A,B两点间的中点坐标为C （ (x1+x2)/2,(y1+y2)/2 ）
  // A,B两点所在直线的斜率k'=(y1-y2)/(x1-x2)
  // 所以中垂线L的斜率k=-1/k'=-(x1-x2)/(y1-y2)
  // 因为中垂线经过点C,将C点的坐标和斜率k'代入方程式y=kx+b,得：
  // (y1+y2)/2 =-(x1-x2)/(y1-y2)*(x1+x2)/2+b 解得：
  // b=(y1+y2)/2+(x1-x2)/(y1-y2)*(x1+x2)/2
  // 将斜率k和b分别代入方程式L,可得：
  // y=-(x1-x2)/(y1-y2)x+(y1+y2)/2+(x1-x2)/(y1-y2)*(x1+x2)/2
  // 求中点
  const midPoint = [
    math.divide!(start[0] + end[0], 2),
    math.divide!(start[1] + end[1], 2)
  ]
  // 如果是水平线，立刻返回结果。
  if (start[1] - end[1] === 0) {
    const verticalLen = math.divide!(length, 2)
    const startPoint = [midPoint[0], midPoint[1] - verticalLen]
    const endPoint = [midPoint[0], midPoint[1] + verticalLen]
    // if (direction === DIRECTION_OPTIONS.REVERSAL.value) {
    //   return [endPoint, startPoint]
    // }
    return [startPoint, endPoint]
  }
  // 中垂线斜率
  const verticalK = -1 * math.divide!(start[0] - end[0], start[1] - end[1])
  console.log('verticalK', verticalK)
  // 统一长度为100
  const verticalLen = math.divide!(length, 2)
  const offsetX = getOffsetX(verticalLen, verticalK) // 中垂线起止点距离中点的偏移量
  // 中垂线方程 y=-(x1-x2)/(y1-y2)x+(y1+y2)/2+(x1-x2)/(y1-y2)*(x1+x2)/2
  const C = math.divide!(start[1] + end[1], 2) +
                    math.divide!(start[0] - end[0], start[1] - end[1]) *
                    math.divide!(start[0] + end[0], 2)
  // 中垂线方程
  const getVeticalY = (x:any) => (verticalK * x + C)
  const startPoint = [midPoint[0] - offsetX, getVeticalY(midPoint[0] - offsetX)]
  const endPoint = [midPoint[0] + offsetX, getVeticalY(midPoint[0] + offsetX)]
  //   if (direction === DIRECTION_OPTIONS.REVERSAL.value) {
  //     return [endPoint, startPoint]
  //   }
  return [startPoint, endPoint]
}
