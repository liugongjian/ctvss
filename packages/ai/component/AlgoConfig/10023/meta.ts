import { getDangerZone } from '@vss/ai/util/dangerzone'

export const getData = (metaData) => {
  let locations = []
  if (metaData.Data && metaData.Data.DetectBoxes) {
    const boxes = metaData.Data.DetectBoxes
    for (let i = 0; i < boxes.length; i += 4) {
      locations.push(
        {
          top: boxes[i + 1],
          left: boxes[i],
          width: boxes[i + 2],
          height: boxes[i + 3],
          isWarning: metaData.Data.DetectClses ? metaData.Data.DetectClses[i / 4] : false
        }
      )
    }
  }
  locations = getDangerZone(metaData, locations)
  return locations
}
