export const isSupportH265 = () => {
  return window.MediaSource.isTypeSupported('video/mp4; codecs="hvc1.1.6.L93.B0"')
}