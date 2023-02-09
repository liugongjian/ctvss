import request from '@/utils/request'

/**
 * 设备证书请求文件(csr)上传
 * @param params
 * @returns
 */
export const uploadCsr = (params: any): Promise<any> =>
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
export const generateCertificate = (params: any): Promise<any> =>
  request({
    url: '/cert/gb35114/generate',
    method: 'post',
    data: params
  })

/**
 * 查询gb35114凭证详情
 * @param params
 * @returns
 */
export const describeCertificate = (params: any): Promise<any> =>
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
export const describeCertificateList = (params: any): Promise<any> =>
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
export const deleteCertificate = (params: any): Promise<any> =>
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
export const downloadCertificate = (params: any): Promise<any> =>
  request({
    url: '/cert/gb35114/download',
    method: 'post',
    data: params
  })
