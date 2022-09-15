import { getDangerZone } from '@vss/ai/util/dangerzone'

export const getData = (metaData) => {
  let locations = []
  locations = metaData && metaData.map((person: any) => {
    try {
      const rect = JSON.parse(person.FaceRectangles)
      return {
        top: rect[1],
        left: rect[0],
        width: rect[2],
        height: rect[3],
        isWarning: true,
        score: person.Score && Math.round(person.Score * 100),
        name: person.Name
      }
    } catch (error) {
      console.log(error)
    }
  })
  locations = getDangerZone(metaData, locations)
  // @ts-ignore
  // locations.info = {
  //   PersonNum: metaData.Data.PersonNum ? '人群聚集:' + metaData.Data.PersonNum : null,
  //   Duty: metaData.Data.IsOffDuty || metaData.Data.IsSleepOnDuty ? `${metaData.Data?.IsOffDuty ? '脱岗' : ''}${metaData.Data.IsSleepOnDuty ? '睡岗' : ''}告警` : null
  // }

  return locations
}
