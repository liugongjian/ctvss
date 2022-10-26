export const getData = (metaData) => {
  const locations: Location[] = []
  // @ts-ignore
  locations.info = {
    BeeDensity: metaData.Data.BeeDensity ? `蜜蜂密度: ${metaData.Data.BeeDensity}` : null
  }
  return locations
}
