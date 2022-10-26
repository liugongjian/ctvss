import { getDangerZone } from '@vss/ai/util/dangerzone'

export const getData = (metaData) => {
  let locations: Location[] = []
  if (metaData.Data && metaData.Data.DetectBoxes) {
    const boxes = metaData.Data.DetectBoxes
    for (let i = 0; i < boxes.length; i += 4) {
      locations.push(
        {
          // @ts-ignore
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
  // @ts-ignore
  locations.info = {
    PersonNum: metaData.Data.PersonNum ? '人群聚集:' + metaData.Data.PersonNum : null,
    Duty: metaData.Data.IsOffDuty || metaData.Data.IsSleepOnDuty ? `${metaData.Data?.IsOffDuty ? '脱岗' : ''}${metaData.Data.IsSleepOnDuty ? '睡岗' : ''}告警` : null
  }
  return locations
}
