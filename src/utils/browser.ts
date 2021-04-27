// isIE
export const isIE = () => {
  if (navigator.userAgent.indexOf('Trident') !== -1) {
    return true
  }
}