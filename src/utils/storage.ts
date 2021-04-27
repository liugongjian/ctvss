/**
 * 存储localStorage
 */
export const setLocalStorage = (name: any, content: any) => {
  if (!name) return
  if (typeof content !== 'string') {
    content = JSON.stringify(content)
  }
  window.localStorage.setItem(name, content)
}

/**
* 获取localStorage
*/
export const getLocalStorage = (name: any) => {
  if (!name) return
  return window.localStorage.getItem(name)
}

/**
* 删除localStorage
*/
export const removeLocalStorage = (name: any) => {
  if (!name) return
  window.localStorage.removeItem(name)
}
