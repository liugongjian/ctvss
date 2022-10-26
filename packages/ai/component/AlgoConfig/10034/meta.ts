
import { getDangerZone } from '@vss/ai/util/dangerzone'

export const getData = (metaData) => {
  let locations: Location[] = []
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
  return locations
}
