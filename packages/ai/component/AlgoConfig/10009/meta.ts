export const getData = (metaData) => {
  const locations: Location[] = []
  if (metaData.Data && metaData.Data.Boxes) {
    const boxes = metaData.Data.Boxes
    const attributes = metaData.Data.Attributes
    for (let i = 0; i < boxes.length; i++) {
      locations.push(
        {
          // @ts-ignore
          top: boxes[i].TopLeftY,
          left: boxes[i].TopLeftX,
          width: boxes[i].BottomRightX - boxes[i].TopLeftX,
          height: boxes[i].BottomRightY - boxes[i].TopLeftY,
          attributes: parseBodyAttributes(attributes[i]),
          isWarning: false
        }
      )
    }
  }
  return locations
}

const parseBodyAttributes = (attributes: any) => {
  const attributesArray = []
  for (const key in attributes) {
    attributesArray.push({
      key: key.toLocaleLowerCase(),
      value: attributes[key].Name
    })
  }
  return attributesArray
}
