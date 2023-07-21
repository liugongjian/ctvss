import request from '@/utils/request'

export const createUser = (params: any): Promise<any> =>
  request({
    url: '/iam/user/create',
    method: 'post',
    data: params
  })

export const deleteUser = (params: any): Promise<any> =>
  request({
    url: '/iam/user/delete',
    method: 'post',
    data: params
  })

export const modifyUser = (params: any): Promise<any> =>
  request({
    url: '/iam/user/modify',
    method: 'post',
    data: params
  })

export const getUser = (params: any): Promise<any> =>
  request({
    url: '/iam/user',
    method: 'get',
    params
  })

export const getUserList = (params: any): Promise<any> =>
  request({
    url: '/iam/users',
    method: 'get',
    params
  })

export const createGroup = (params: any): Promise<any> =>
  request({
    url: '/iam/group/create',
    method: 'post',
    data: params
  })

export const deleteGroup = (params: any): Promise<any> =>
  request({
    url: '/iam/group/delete',
    method: 'post',
    data: params
  })

export const modifyGroup = (params: any): Promise<any> =>
  request({
    url: '/iam/group/modify',
    method: 'post',
    data: params
  })

export const getGroup = (params: any): Promise<any> =>
  request({
    url: '/iam/group',
    method: 'get',
    params
  })

export const getGroupInheritedPolicies = (params: any): Promise<any> =>
  request({
    url: '/iam/group/inherited',
    method: 'get',
    params
  })

export const combineGroup = (params: any): Promise<any> =>
  request({
    url: '/iam/group/combine',
    method: 'post',
    data: params
  })

export const getGroupList = (params: any): Promise<any> =>
  request({
    url: '/iam/group/list',
    method: 'get',
    params
  })

export const getGUserList = (params: any): Promise<any> =>
  request({
    url: '/iam/group/children',
    method: 'get',
    params
  })

export const addToGroup = (params: any): Promise<any> =>
  request({
    url: '/iam/user/addToGroup',
    method: 'post',
    data: params
  })

export const delFromGroup = (params: any): Promise<any> =>
  request({
    url: '/iam/user/delFromGroup',
    method: 'post',
    data: params
  })

export const iamCreateRole = (params: any): Promise<any> =>
  request({
    url: '/iam/role/create',
    method: 'post',
    data: params
  })

export const iamModifyRole = (params: any): Promise<any> =>
  request({
    url: '/iam/role/modify',
    method: 'post',
    data: params
  })

export const iamGetRole = (params: any): Promise<any> =>
  request({
    url: '/iam/role',
    method: 'get',
    params
  })

export const iamDeleteRole = (params: any): Promise<any> =>
  request({
    url: '/iam/role/delete',
    method: 'post',
    data: params
  })

export const getIamRoleList = (params: any): Promise<any> =>
  request({
    url: '/iam/role/list',
    method: 'get',
    params
  })

export const getUserRoleList = (params: any): Promise<any> =>
  request({
    url: '/iam/role/authorized/list',
    method: 'get',
    params
  })

export const getPolicyList = (params: any): Promise<any> =>
  request({
    url: '/iam/policy/list',
    method: 'get',
    params
  })

export const getPolicyInfo = (params: any): Promise<any> =>
  request({
    url: '/iam/policy',
    method: 'get',
    params
  })

export const createPolicy = (data: any): Promise<any> =>
  request({
    url: '/iam/policy/create',
    method: 'post',
    data
  })

export const editPolicy = (data: any): Promise<any> =>
  request({
    url: '/iam/policy/update',
    method: 'post',
    data
  })

export const deletePolicy = (data: any): Promise<any> =>
  request({
    url: '/iam/policy/delete',
    method: 'post',
    data
  })

/*
 * 查询策略绑定的主体信息
 */
export const getPolicyPrincipals = (params: any): Promise<any> =>
  request({
    url: '/iam/policy/principals',
    method: 'get',
    params
  })

export const detachUserPolicy = (data: any): Promise<any> =>
  request({
    url: '/iam/policy/detach',
    method: 'post',
    data
  })

// 获取主账号 黑白名单
export const getIpRules = (type: number): Promise<any> =>
  request({
    url: `/user/iprules?type=${type}`,
    method: 'get'
  })

// 配置IP黑白名单
export const setIpRules = (data: any): Promise<any> =>
  request({
    url: '/user/iprules',
    method: 'post',
    data
  })

// 解除锁定
export const unlockIpRules = (data: any): Promise<any> =>
  request({
    url: '/user/ipunlock',
    method: 'post',
    data
  })

// 查询子账号锁定记录
export const getIplock = (): Promise<any> =>
  request({
    url: '/user/iplock',
    method: 'get'
  })

// 添加子账号锁定策略
export const setIpLock = (data: any): Promise<any> =>
  request({
    url: '/user/iplock',
    method: 'post',
    data
  })

// 查询账号列表
export const getAccessList = (params?: any): Promise<any> =>
  request({
    url: '/iam/user/accessmgmt/list',
    method: 'get',
    params
  })

// 解锁
export const accountUnlock = (data: any): Promise<any> =>
  request({
    url: '/iam/user/unlock',
    method: 'post',
    data
  })

// 锁定
export const accountLock = (data: any): Promise<any> =>
  request({
    url: '/iam/user/lock',
    method: 'post',
    data
  })

// 账号权限-预览
export const previewAuthActions = (data: any): Promise<any> =>
  request({
    url: '/iam/authpreview',
    method: 'post',
    data
  })

// 账号权限-查看（前端暂未用到）
export const getAuthActions = (data: any): Promise<any> =>
  request({
    url: '/iam/auth',
    method: 'post',
    data
  })

// 查看指定设备或目录的赋权子账号列表
export const describeAuthIamUsers = (data: any): Promise<any> =>
  request({
    url: '/iam/auth/users',
    method: 'post',
    data
  })

// 获取用户登录状态
export const getLoginState = (params?: any): Promise<any> =>
  request({
    url: '/user/loginstate',
    method: 'get',
    params
  })

// 设置独立密码
export const setLoginPwd = (data?: any): Promise<any> =>
  request({
    url: '/user/addpwd',
    method: 'post',
    data
  })

// 注销用户
export const cancelUser = (data: any): Promise<any> =>
  request({
    url: '/user/lock',
    method: 'post',
    data
  })

// 验证用户手机号
export const verifyPhone = (data: any): Promise<any> =>
  request({
    url: '/iam/user/verifyphone',
    method: 'post',
    data
  })
