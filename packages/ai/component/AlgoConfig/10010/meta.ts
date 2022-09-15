export const getData = (metaData) => {
  let locations = []
  if (metaData.Data && metaData.Data.BeeDensity) {
    locations.push({
      beeDensity: Math.round(metaData.Data.BeeDensity)
    })
  }
  return locations
}
