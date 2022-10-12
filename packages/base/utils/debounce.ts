export default function debounce(func: Function, wait: number = 1000) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let timeout: any
  return function() {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.call(this, arguments)
    }, wait)
  }
}
