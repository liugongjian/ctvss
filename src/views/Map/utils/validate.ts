export const validateIsLng = (str: any) => {
  return /^[-+]?(0(\.\d{1,15})?|([1-9](\d)?)(\.\d{1,14})?|1[0-7]\d{1}(\.\d{1,14})?|180\.0{1,14})$/.test(str)
}

export const validateIsLat = (str: any) => {
  return /^[-+]?((0|([1-9]\d?))(\.\d{1,14})?|90(\.0{1,14})?)$/.test(str)
}

export const validateNum = (str: any, min, max) => {
  const num = Number(str)
  return num >= min && num <= max
}
