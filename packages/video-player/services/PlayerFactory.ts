import { PlayerConfig } from '../types/Player'
import { Mp4Player } from './Mp4Player'
import { FlvPlayer } from './FlvPlayer'
import { HlsPlayer } from './HlsPlayer'
import { H265Player } from './H265Player'
import { FlvH265Player } from './FlvH265Player'
import { RtcPlayer } from './RtcPlayer'
import { TypeEnum, CodecEnum } from '../enums'
import { isSupportH265 } from '@vss/base/utils/video'

export const createPlayer = (config: PlayerConfig) => {
  const wrapElement: HTMLDivElement = config.container
  if (!wrapElement) {
    throw new Error('找不到指定的ID Video元素')
  }
  if (!config.type) {
    throw new Error('不支持当前视频类型')
  }
  if (!config.codec) {
    throw new Error('不支持当前视频编码')
  }
  if (!config.url) {
    throw new Error('未传入视频URL')
  }
  const player = initPlayer(config)
  if (!player) {
    throw new Error('播放器创建失败')
  }
  return player
}

/**
 * 初始化播放器
 */
const initPlayer = (config: PlayerConfig) => {
  if (config.codec === CodecEnum.H264) {
    switch (config.type) {
      case TypeEnum.MP4:
        return new Mp4Player(config)
      case TypeEnum.FLV:
        return new FlvPlayer(config)
      case TypeEnum.HLS:
        return new HlsPlayer(config)
      case TypeEnum.RTC:
        return new RtcPlayer(config)
    }
  } else {
    switch (config.type) {
      case TypeEnum.MP4:
        return new Mp4Player(config)
      case TypeEnum.FLV:
        if (isSupportH265()) {
          return new FlvH265Player(config)
        } else {
          return new H265Player(config)
        }
      default:
        return new H265Player(config)
    }
  }
}

