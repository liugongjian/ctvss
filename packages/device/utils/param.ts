import { paramsMapping } from '../settings'

export const checkVisible = (deviceType, inVideoProtocol, prop) => {
  console.log(inVideoProtocol)
  if (paramsMapping[inVideoProtocol].has(prop)) {
    return true
  }
}
