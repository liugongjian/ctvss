import { UserModule } from '@/store/modules/user'

export const checkPermission = (value: string[], data?: any): boolean => {
  // 主账号拥有所有权限
  if (!UserModule.iamUserId) {
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
