export const encodeBase64 = (base64: string) => {
  const chars: any = {
    '+': '-',
    '/': '_'
  }
  return base64.replace(/[+/]/g, m => chars[m])
}

export const decodeBase64 = (base64: string) => {
  const chars: any = {
    '-': '+',
    '_': '/'
  }
  return base64.replace(/[-_]/g, m => chars[m])
}
