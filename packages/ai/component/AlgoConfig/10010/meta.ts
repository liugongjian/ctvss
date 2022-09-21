export const getData = (metaData) => {
  let locations = []
  // @ts-ignore
  locations.info = {
    BeeDensity: metaData.Data.BeeDensity ? `蜜蜂密度: ${metaData.Data.BeeDensity}` : null
  }
  return locations
}
