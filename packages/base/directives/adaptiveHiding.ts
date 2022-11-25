/**
 * 判断是否需要隐藏内容
 */
function checkIsHidden(content: HTMLDivElement): boolean {
  return content.children.length === 0
}

export default {
  name: 'adaptiveHiding',
  bind(el: any, binding) {
    console.log(el, binding.value)
    const content: HTMLDivElement = el.getElementsByClassName(binding.value)[0]
    if (checkIsHidden(content)) {
      el.style.display = 'none'
    }
  }
}


