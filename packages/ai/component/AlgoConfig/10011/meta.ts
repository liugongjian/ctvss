export const getData = (metaData) => {
  const locations: Location[] = []
  if (metaData.Data && metaData.Data.Boxes) {
    const boxes = metaData.Data.Boxes
    for (let i = 0; i < boxes.length; i++) {
      locations.push(
        {
          //@ts-ignore
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
