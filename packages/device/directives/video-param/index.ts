import { DirectiveOptions } from 'vue'

function checkVisiable(el: any, binding: any) {
  const { value } = binding
  if (value && value instanceof Array && value.length > 0) {
    console.log(1)
  } else {
    console.log(1)
  }
}
export const permission: DirectiveOptions = {
  update(el: any, binding: any) {
    checkVisiable(el, binding)
  }
}
