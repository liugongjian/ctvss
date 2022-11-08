import request from '@/utils/request'

export const createDir = (params: any): Promise<any> =>
  request({
    url: '/dir/create',
    method: 'post',
    data: params
  })

export const updateDir = (params: any): Promise<any> =>
  request({
    url: '/dir/update',
    method: 'post',
    data: params
  })

export const deleteDir = (params: any): Promise<any> =>
  request({
    url: '/dir/delete',
    method: 'post',
    data: params
  })

/**
 * 获取设备目录树节点
 */
export const getNodeInfo = (params: any): Promise<any> =>
 request({
   url: '/dir/list/status',
   method: 'get',
   params
 })

/**
 * 获取目录下所有设备
 */
export const getDirDevices = (params: any): Promise<any> =>
request({
  url: '/dir/device/list',
  method: 'get',
  params
})

export const getDeviceTree = (params): Promise<any> => {
 console.log(params)
 const res = [{
   id: 1,
   type: 'platform',
   label: '一级 1',
   children: [{
     id: 4,
     type: 'dir',
     label: '二级 1-1',
     children: [{
       id: 9,
       type: 'ipc',
       label: '三级 1-1-1'
     }, {
       id: 10,
       type: 'ipc',
       label: '三级 1-1-2'
     }]
   }]
 }, {
   id: 2,
   type: 'platform',
   label: '一级 2',
   children: [{
     id: 5,
     type: 'ipc',
     label: '二级 2-1'
   }, {
     id: 6,
     type: 'ipc',
     label: '二级 2-2'
   }]
 }, {
   id: 3,
   type: 'platform',
   label: '一级 3',
   children: [{
     id: 7,
     type: 'dir',
     label: '二级 3-1'
   }, {
     id: 8,
     type: 'dir',
     label: '二级 3-2',
     children: [{
       id: 9,
       type: 'dir',
       label: '二级 3-1'
     }, {
       id: 10,
       type: 'nvr',
       label: '二级 3-2',
       children: [{
         id: 11,
         type: 'ipc',
         label: '二级 3-1'
       }, {
         id: 12,
         type: 'ipc',
         label: '二级 3-2'
       }]
     }]
   }]
 }]
 return new Promise(resolve => {
   setTimeout(() => {
     resolve(res)
   }, 1000)
 })
}

/**
 * 获取目录对应路径（面包屑）
 * @param params
 * @returns 
 */
 export const getDirPath = (params: any): Promise<any> => 
 request({
   url: '/dir/path',
   method: 'get',
   params
 })

/**
 * 目录排序
 * @param params
 * @returns 
 */
 export const sortDir = (params: any): Promise<any> => 
 request({
   url: '/location/move',
   method: 'post',
   data: params
 })

export const bindDir = (params: any): Promise<any> =>
  request({
    url: '/dir/bind',
    method: 'post',
    data: params
  })
