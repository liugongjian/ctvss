export const addClass = (elem, className) => {
  if (!className) return
  const els = Array.isArray(elem) ? elem : [elem]
  els.forEach((el) => {
    if (el.classList) {
      el.classList.add(className.split(' '))
    } else {
      el.className += ` ${className}`
    }
  })
}

export const removeClass = (elem, className) => {
  if (!className) return
  const els = Array.isArray(elem) ? elem : [elem]
  els.forEach((el) => {
    if (el.classList) {
      el.classList.remove(className.split(' '))
    } else {
      el.className = el.className.replace(new RegExp(`(^|\\b)${className.split(' ').join('|')}(\\b|$)`, 'gi'), ' ')
    }
  })
}
