import { UserModule } from '@/store/modules/user'
import { SystemType, AppModule } from '@/store/modules/app'

/**
 * 权限判断
 * @param value 需要进行判断的权限字段
 * @param data 权限对象或者多个权限对象组成的数组
 * @returns 
 */
export const checkPermission = (value: string[], data?: any): boolean => {
  // 运营平台中权限控制(运营平台v2版本复用包，设备管理的权限控制单独出来，和运营平台自身的policy体系隔离)
  if (AppModule.system === SystemType.SYSTEM_OPERATION) {
    const operationSystemAllowActions = [
      'ivs:GetDevice',
      'ivs:GetLiveStream',
      'ivs:GetCloudRecord'
    ]
    if (!value || !value[0] || operationSystemAllowActions.indexOf(value[0]) !== -1) {
      return true
    }
    return false
  }

  // 业务平台中主账号拥有所有权限
  if (AppModule.system === SystemType.SYSTEM_USER && !UserModule.iamUserId) {
    return true
  }

  if (value && value instanceof Array && value.length > 0) {
    let dataPerms = null
    if (!Array.isArray(data)) {
      data = [data]
    }
    return data.every((item) => {
      if (item) {
        dataPerms = Object.keys(item)
          .filter((key: string) => key.startsWith('ivs:'))
          .filter((permKey: string) => item[permKey].auth || item[permKey].Auth)
      }
      const perms = dataPerms || UserModule.perms
      const neededPermissions = value
      const hasPermission = perms.indexOf('*') !== -1 || (perms.some((perm: string) => {
        return neededPermissions.includes(perm)
      }))
      return hasPermission
    })
  } else {
    return true
  }
}
