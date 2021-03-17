import request from '@/utils/request'

export const getRegions = async() => {
  const res: any = await request({
    url: '/region/list',
    method: 'get'
  })
  if (!res.provinces) return []
  return res.provinces.map((province: any) => {
    return {
      value: province.name,
      label: province.name,
      children: province.citys.map((city: any) => {
        return {
          value: city.name,
          label: city.name,
          children: city.regions.map((region: any) => {
            return {
              value: region.region,
              label: region.regionName
            }
          })
        }
      })
    }
  })
}
