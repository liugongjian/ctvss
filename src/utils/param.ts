enum Method {
  ToLowerCase,
  ToUpperCase
}

const recursionData = (data, method) => {
  const newObj = Array.isArray(data) ? [] : {}
  for (const key in data) {
    let firstChar = key.substring(0, 1)
    firstChar = method === Method.ToLowerCase ? firstChar.toLowerCase() : firstChar.toUpperCase()
    const newKey = firstChar + key.substring(1, key.length)
    let value = data[key]
    if (value && typeof value === 'object') {
      value = recursionData(value, method)
    }
    newObj[newKey] = value
  }
  return newObj
}

export const toLowerCase = (data) => {
  return recursionData(data, Method.ToLowerCase)
}

export const toUpperCase = (data) => {
  return recursionData(data, Method.ToUpperCase)
}
