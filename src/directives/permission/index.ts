import { DirectiveOptions } from 'vue'
import { UserModule } from '@/store/modules/user'

function checkPermission(el: any, binding: any) {
  // 主账号拥有所有权限
  if (!UserModule.iamUserId) {
    return true
  }
  console.log('---binding: ', binding)
  const { value } = binding
  const perms = UserModule.perms
  if (value && value instanceof Array && value.length > 0) {
    const permissions = value
    const hasPermission = perms.indexOf('*') !== -1 || perms.some((perm: any) => {
      return permissions.includes(perm)
    })
    if (!hasPermission) {
      el.style.display = 'none'
      // el.parentNode && el.parentNode.removeChild(el)
    }
  } else {
    throw new Error('need roles! Like v-permission="[\'GET\']"')
  }
}
export const permission: DirectiveOptions = {
  // inserted(el: any, binding: any) {
  //   checkPermission(el, binding)
  // },
  update(el: any, binding: any) {
    checkPermission(el, binding)
  }
}
