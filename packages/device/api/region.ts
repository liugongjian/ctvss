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

/**
 * 获取子地址列表，返回Promise
 */
 export const getAddressArea = (params: any, cancelToken: any): Promise<any> =>
 request({
   url: '/area/list',
   method: 'get',
   params,
   cancelToken
 })

/**
* 获取子地址列表, 返回地址列表
*/
export const getChildAddress = async(id: any, level: number, cancelToken: any) => {
 const params: any = {
   pid: id,
   level
 }
 const res = await getAddressArea(params, cancelToken)
 let list = []
 if (res.areas.length) {
   list = res.areas.map((item: any) => {
     return {
       name: item.name,
       code: item.id,
       level: item.level,
       leaf: item.level === '4' ? true : undefined
     }
   })
 }
 return list
}