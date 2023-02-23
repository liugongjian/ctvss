import { UserModule } from '@/store/modules/user'

// export const checkPermission = (value: string[], data?: any): boolean => {
//   console.log('data: ', data)
//   if (value && value instanceof Array && value.length > 0) {
//     const permissions = value

//     return hasPermission
//   } else {
//     console.error('need perms! Like v-permission="[\'GET\']"')
//     return false
//   }
// }

export const checkPermission = (value: string[], data?: any): boolean => {
  // 主账号拥有所有权限
  if (!UserModule.iamUserId) {
    return true
  }

  if (value && value instanceof Array && value.length > 0) {
    let dataPerms = null
    if (data) {
      dataPerms = Object.keys(data)
        .filter((key: string) => key.startsWith('ivs:'))
        .filter((permKey: string) => data[permKey].auth)
    }
    const perms = dataPerms || UserModule.perms
    const neededPermissions = value
    const hasPermission = perms.indexOf('*') !== -1 || (perms.some((perm: string) => {
      return neededPermissions.includes(perm)
    }))
    return hasPermission
  } else {
    console.error('need perms! Like v-permission="[\'ivs:GetGroup\']"')
    return false
  }
}
