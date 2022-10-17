import { getDangerZone } from '@vss/ai/util/dangerzone'

export const getData = (metaData) => {
  let locations: Location[] = []
  if (metaData.Data && metaData.Data.Boxes) {
    const boxes = metaData.Data.Boxes
    for (let i = 0; i < boxes.length; i++) {
      locations.push(
        {
          // @ts-ignore
          top: boxes[i].TopLeftY,
          left: boxes[i].TopLeftX,
          width: boxes[i].BottomRightX - boxes[i].TopLeftX,
          height: boxes[i].BottomRightY - boxes[i].TopLeftY,
          isWarning: true
        }
      )
    }
  }
  locations = getDangerZone(metaData, locations)
  // @ts-ignore
  locations.info = {
    // 根据变量的null值决定是否展示
    JamCount: metaData.Data.JamCount ? `实际车辆数: ${metaData.Data.JamCount || 0}, 检测阈值: ${metaData.Data.JamThreshold || 0}` : null
  }
  return locations
}
