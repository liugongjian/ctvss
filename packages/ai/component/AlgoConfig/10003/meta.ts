export const getData = (metaData) => {
  let locations = []
  if (metaData.Data && metaData.Data.FaceRectangles) {
    const boxes = metaData.Data.FaceRectangles
    for (let i = 0; i < boxes.length; i += 4) {
      const type = metaData.Data.ClassList[i / 4]
      locations.push(
        {
          top: boxes[i + 1],
          left: boxes[i],
          width: boxes[i + 2],
          height: boxes[i + 3],
          isWarning: type === 0 || type === 2,
          type
        }
      )
    }
  }
  return locations
}
