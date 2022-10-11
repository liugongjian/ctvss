import { getDangerZone } from '@vss/ai/util/dangerzone'

export const getData = (metaData) => {
  let locations = []
  if (metaData.Data && metaData.Data.Boxes) {
    locations = metaData.Data.Boxes.map((box: any, index: number) => {
      const xArray = box.map((point: any) => point[0])
      const yArray = box.map((point: any) => point[1])
      const [left, right] = [Math.min.apply(Math, xArray), Math.max.apply(Math, xArray)]
      const [top, bottom] = [Math.min.apply(Math, yArray), Math.max.apply(Math, yArray)]
      return {
        top: top,
        left: left,
        width: right - left,
        height: bottom - top,
        isWarning: true,
        text: metaData.Data.Texts[index]
      }
    })
  }
  locations = getDangerZone(metaData, locations)
  return locations
}
