export const parseMetaData = (type: string, metaData: any) => {
  console.log(metaData)
  let locations = []
  switch (type) {
    case '1':
      locations = metaData.face_list && metaData.face_list.map((face: any) => {
        return {
          ...face.face_location,
          isWarning: !face.isMask
        }
      })
      break
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
    case '3':
      locations = metaData.data && metaData.data.map((face: any) => {
        return {
          ...face.location,
          isWarning: true
        }
      })
  }
  return locations
}
