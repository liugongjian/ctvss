import { UserModule } from '@/store/modules/user'

export const checkPermission = (value: string[]): boolean => {
  if (value && value instanceof Array && value.length > 0) {
    const perms = UserModule.perms
    const permissions = value
    const hasPermission = perms.indexOf('*') !== -1 || perms.some((perm: string) => {
      return permissions.includes(perm)
    })
    return hasPermission
  } else {
    console.error(`need perms! Like v-permission="['GET']"`)
    return false
  }
}
