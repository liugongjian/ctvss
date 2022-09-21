import { getDangerZone } from '@vss/ai/util/dangerzone'

export const getData = (metaData) => {
  let locations = []
  locations = metaData.Data && metaData.Data.MatchList.map((person: any) => {
    try {
      const name = (person.FaceItems.length > 0 && person.FaceItems[0].Labels.length > 0) ? JSON.parse(person.FaceItems[0].Labels).name : '-'
      return {
        top: person.Location.Y,
        left: person.Location.X,
        width: person.Location.Width,
        height: person.Location.Height,
        isWarning: person.FaceItems.length > 0 && person.FaceItems[0].Score > 60,
        score: person.FaceItems.length > 0 && Math.round(person.FaceItems[0].Score),
        name
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
