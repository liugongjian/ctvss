import { getDangerZone } from '@vss/ai/util/dangerzone'

export const getData = (metaData) => {
  let locations = []
  if (metaData.Data && metaData.Data.DetectBoxes) {
    const boxes = metaData.Data.DetectBoxes
    // const label = metaData.Data.Label
    for (let i = 0; i < boxes.length; i += 4) {
      locations.push(
        {
          top: boxes[i + 1],
          left: boxes[i],
          width: boxes[i + 2],
          height: boxes[i + 3],
          // label: label[i / 4],
          isWarning: !![1, 2].includes(metaData.Data.DetectClses[i / 4]),
          isNoReflective: metaData.Data.DetectClses[i / 4] === 1
        }
      )
    }
  }
  locations = getDangerZone(metaData, locations)
  return locations
}
