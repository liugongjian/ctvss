import { getDangerZone } from '@vss/ai/util/dangerzone'
import { CityGovType } from '@vss/ai/dics/contants'

export const getData = (metaData) => {
  let locations: Location[] = []
  locations = metaData.Data && metaData.Data.Boxes.map((box: any) => {
    try {
      let label
      const temp = CityGovType.filter(type => type.label === box.Label)
      if (temp.length > 0) {
        label = temp[0].cname
      }
      return {
        top: box.TopLeftY,
        left: box.TopLeftX,
        width: box.BottomRightX - box.TopLeftX,
        height: box.BottomRightY - box.TopLeftY,
        isWarning: (box.Score.length > 0 && box.Score > 60),
        label,
        label_en: box.Label
      }
    } catch (error) {
      console.log(error)
    }
  })
  locations = getDangerZone(metaData, locations)
  return locations
}
