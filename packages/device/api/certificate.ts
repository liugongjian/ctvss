import request from '@/utils/request'

/**
 * =============================
 * Video
 * =============================
 */

/* GB28181 */
export const getGb28181CertificateList = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181/list',
    method: 'get',
    params: {
      ...params,
      inProtocol: 'gb28181'
    }
  })

export const createGb28181Certificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181/create',
    method: 'post',
    data: {
      ...params,
      inProtocol: 'gb28181'
    }
  })

export const deleteGb28181Certificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181/delete',
    method: 'post',
    data: {
      ...params,
      inProtocol: 'gb28181'
    }
  })

export const updateGb28181Certificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181/update',
    method: 'post',
    data: {
      ...params,
      inProtocol: 'gb28181'
    }
  })

export const getGb28181Certificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181/describe',
    method: 'get',
    params: {
      ...params,
      inProtocol: 'gb28181'
    }
  })

/* ehome */
export const getEhomeCertificateList = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181/list',
    method: 'get',
    params: {
      ...params,
      inProtocol: 'ehome'
    }
  })

export const createEhomeCertificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181/create',
    method: 'post',
    data: {
      ...params,
      inProtocol: 'ehome'
    }
  })

export const deleteEhomeCertificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181/delete',
    method: 'post',
    data: {
      ...params,
      inProtocol: 'ehome'
    }
  })

export const updateEhomeCertificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181/update',
    method: 'post',
    data: {
      ...params,
      inProtocol: 'ehome'
    }
  })

export const getEhomeCertificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181/describe',
    method: 'get',
    params: {
      ...params,
      inProtocol: 'ehome'
    }
  })

/**
 * =============================
 * VIID
 * =============================
 */
export const getGa1400CertificateList = (params: any): Promise<any> =>
  request({
    url: '/certificate/ga1400/list',
    method: 'get',
    params
  })

export const createGa1400Certificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/ga1400/create',
    method: 'post',
    data: params
  })

export const deleteGa1400Certificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/ga1400/delete',
    method: 'post',
    data: params
  })

export const updateGa1400Certificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/ga1400/update',
    method: 'post',
    data: params
  })

export const getGa1400Certificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/ga1400/describe',
    method: 'get',
    params
  })

/**
 * =============================
 * GB35114
 * =============================
 */

/**
 * 设备证书请求文件(csr)上传
 * @param params
 * @returns
 */
export const uploadGb35114Csr = (params: any): Promise<any> =>
 request({
   url: '/cert/gb35114/uploadCsr',
   method: 'post',
   data: params
 })

/**
* 生成gb35114凭证
* @param params
* @returns
*/
export const generateGb35114Certificate = (params: any): Promise<any> =>
 request({
   url: '/cert/gb35114/generate',
   method: 'post',
   data: params
 })

/**
* 修改gb35114凭证
*/
export const updateGb35114Certificate = (params: any): Promise<any> =>
 request({
   url: '/cert/gb35114/modify',
   method: 'post',
   data: params
 })

/**
* 查询gb35114凭证详情
* @param params
* @returns
*/
export const describeGb35114Certificate = (params: any): Promise<any> =>
 request({
   url: '/cert/gb35114/describe',
   method: 'get',
   params
 })

/**
* 查询gb35114凭证列表
* @param params
* @returns
*/
export const describeGb35114CertificateList = (params: any): Promise<any> =>
 request({
   url: '/cert/gb35114/list',
   method: 'get',
   params
 })

/**
* 搜索gb35114凭证
*/
export const searchGb35114CertificateList = (params: any): Promise<any> =>
 request({
   url: '/cert/gb35114/list',
   method: 'get',
   params
 })

/**
* 删除gb35114凭证
* @param params
* @returns
*/
export const deleteGb35114Certificate = (params: any): Promise<any> =>
 request({
   url: '/cert/gb35114/delete',
   method: 'post',
   data: params
 })

/**
* 下载gb35114凭证
* @param params
* @returns
*/
export const downloadGb35114Certificate = (params: any): Promise<any> =>
 request({
   url: '/cert/gb35114/download',
   method: 'post',
   data: params
 })

