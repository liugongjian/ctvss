// isIE
export const isIE = () => {
  if (navigator.userAgent.indexOf('Trident') !== -1) {
    return true
  }
}

// ifWebRTC
export const ifWebRTC = () => {
  // @ts-ignore
  return !!window.webkitRTCPeerConnection || !!window.mozRTCPeerConnection | !!window.RTCPeerConnection
}
