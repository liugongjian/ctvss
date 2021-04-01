import { FlvPlayer } from './FlvPlayer'
import { HlsPlayer } from './HlsPlayer'
import { RtcPlayer } from './RtcPlayer'
import { H265Player } from './H265Player'

export const createPlayer = (config: any) => {
  const wrapElement: HTMLDivElement = config.wrap
  if (!wrapElement) {
    throw new Error('找不到指定的ID Video元素')
  }
  if (!config.type) {
    throw new Error('不支持当前视频类型')
  }
  // 使用ws播放
  // config.source = config.isWs ? config.source.replace('http://', 'ws://') : config.source
  const player = initPlayer(config)
  if (!player) {
    throw new Error('播放器创建失败')
  }
  return player
}

/**
 * 初始化播放器
 */
const initPlayer = (config: any) => {
  if (config.codec === 'h265') {
    return new H265Player(config)
  } else {
    switch (config.type) {
      case 'flv':
        return new FlvPlayer(config)
      case 'hls':
        return new HlsPlayer(config)
      case 'rtc':
        return new RtcPlayer(config)
    }
  }
}
