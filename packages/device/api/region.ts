import request from '@/utils/request'

export const getRegions = async() => {
  const res: any = await request({
    url: '/region/list',
    method: 'get'
  })
  if (!res.provinces) return []
  return res.provinces.map((province: any) => {
    const regions: any = []
    province.citys.forEach((city: any) => {
      city.regions.forEach((region: any) => {
        regions.push({
          value: region.region,
          label: region.regionName
        })
      })
    })
    return {
      value: province.name,
      label: province.name,
      children: regions
    }
  })
}
