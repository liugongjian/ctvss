export const getData = (metaData) => {
  let locations = []
  if (metaData.Data && metaData.Data.Boxes) {
    const boxes = metaData.Data.Boxes
    for (let i = 0; i < boxes.length; i++) {
      locations.push(
        {
          top: boxes[i].TopLeftY,
          left: boxes[i].TopLeftX,
          width: boxes[i].BottomRightX - boxes[i].TopLeftX,
          height: boxes[i].BottomRightY - boxes[i].TopLeftY,
          isWarning: true
        }
      )
    }
  }
  return locations
}
