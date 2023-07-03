import { UserModule } from '@/store/modules/user'
import { SystemType, AppModule } from '@/store/modules/app'

/**
 * 权限判断
 * @param value 需要进行判断的权限字段
 * @param data 权限对象或者多个权限对象组成的数组
 * @returns
 */
export const checkPermission = (value: string[], data?: any): boolean => {
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
