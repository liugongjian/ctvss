import { getDangerZone } from '@vss/ai/util/dangerzone'
import { AnimalType } from '@/dics'

export const getData = (metaData) => {
  let locations = []
  let counts = {}
  AnimalType.forEach(item => { counts[item.label] = 0 })
  locations = metaData.Data && metaData.Data.Boxes.map((box: any) => {
    try {
      if (box.Label && typeof counts[box.Label] !== 'undefined') {
        counts[box.Label] += 1
      }
      return {
        top: box.TopLeftY,
        left: box.TopLeftX,
        width: box.BottomRightX - box.TopLeftX,
        height: box.BottomRightY - box.TopLeftY,
        isWarning: box.Score.length > 0 && box.Score > 60,
        label: box.Label
      }
    } catch (error) {
      console.log(error)
    }
  })
  locations = getDangerZone(metaData, locations)
  AnimalType.forEach(type => {
    if (counts[type.label]) {
      // @ts-ignore
      locations.info[type.label] = `${type.cname}数量：${counts[type.label]}只`
    }
  })
  return locations
}
