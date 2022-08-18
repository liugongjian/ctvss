import { VideoInProtocolType } from './enums'

export const paramsMapping = {
  [VideoInProtocolType.Gb28181]: new Set([
    'outId',
    'inUserName'
  ])
}
