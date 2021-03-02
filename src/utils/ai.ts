/**
 * @param type event id
 * @param metaData AI接口返回的源数据
 * @return {
 *  top: 上边距,
 *  left: 左边距,
 *  width: 宽度,
 *  height: 高度,
 *  isWarning: 是否警告
 * }
 */
export const parseMetaData = (type: string, metaData: any) => {
  let locations = []
  switch (type) {
    // 未带口罩
    case '1':
      locations = metaData.face_list && metaData.face_list.map((face: any) => {
        return {
          ...face.face_location,
          isWarning: !face.isMask
        }
      })
      break
    // 人员聚集
    case '2':
      locations = metaData.result && metaData.result.map((face: any) => {
        return {
          top: face.box[1],
          left: face.box[0],
          width: face.box[2] - face.box[0],
          height: face.box[3] - face.box[1],
          isWarning: metaData.result.length > 10
        }
      })
      break
    // 人员布控
    case '3':
      locations = metaData.data && metaData.data.map((face: any) => {
        return {
          ...face.location,
          isWarning: true
        }
      })
      break
    // 抽烟检测
    case '5':
      if (metaData.Data && metaData.Data.DetectBoxes) {
        const boxes = metaData.Data.DetectBoxes
        for (let i = 0; i < boxes.length; i += 4) {
          locations.push(
            {
              top: boxes[i + 1],
              left: boxes[i],
              width: boxes[i + 2],
              height: boxes[i + 3],
              isWarning: !!metaData.Data.DetectClses[i / 4]
            }
          )
        }
      }
  }
  return locations
}
