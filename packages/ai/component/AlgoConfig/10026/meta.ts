import { getDangerZone } from '@vss/ai/util/dangerzone'

export const getData = (metaData) => {
  let locations: Location[] = []
  locations = metaData.Data && metaData.Data.Boxes.map((box: any) => {
    console.log('box:', box)
    try {
      let label
      switch (box.Label) {
        case 'cask_yes':
          label = '垃圾桶已盖'
          break
        case 'trash':
          label = '地面垃圾'
          break
        case 'cask_no':
          label = '垃圾桶未盖'
          break
        case 'cask_overflows':
          label = '垃圾桶溢满'
          break
        case 'Bear':
          label = '狗熊'
          break
        default:
          label = box.LabelCh
          break
      }
      return {
        top: box.TopLeftY,
        left: box.TopLeftX,
        width: box.BottomRightX - box.TopLeftX,
        height: box.BottomRightY - box.TopLeftY,
        isWarning: (box.Score.length > 0 && box.Score > 60) || box.Label === 'others',
        label
      }
    } catch (error) {
      console.log(error)
    }
  })
  locations = getDangerZone(metaData, locations)
  return locations
}
