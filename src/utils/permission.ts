import { UserModule } from '@/store/modules/user'

export const checkPermission = (value: string[], data?: any): boolean => {
  if (value && value instanceof Array && value.length > 0) {
    const perms = UserModule.perms
    const resourcesSet = UserModule.resourcesSet
    const permissions = value
    const hasPermission = perms.indexOf('*') !== -1 || (perms.some((perm: string) => {
      return permissions.includes(perm)
    }) && !resourcesSet.has(data?.id || ''))
    return hasPermission
  } else {
    console.error(`need perms! Like v-permission="['GET']"`)
    return false
  }
}
