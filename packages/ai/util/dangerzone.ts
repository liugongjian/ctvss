export const getDangerZone = (metaData, locations) => {
  if (metaData.DangerZoneBox && metaData.DangerZoneBox.length) {
    locations.push(
      {
        zone: metaData.DangerZoneBox
      }
    )
  }
  return locations
}
