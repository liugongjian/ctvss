import { FlvPlayer } from './FlvPlayer'
import { HlsPlayer } from './HlsPlayer'
import { PlayerConfig } from './Player.d'

export const createPlayer = (config: PlayerConfig) => {
  const wrapElement: HTMLDivElement = config.container
  if (!wrapElement) {
    throw new Error('找不到指定的ID Video元素')
  }
  if (!config.type) {
    throw new Error('不支持当前视频类型')
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
  switch (config.type) {
    case 'flv':
      return new FlvPlayer(config)
    case 'hls':
      return new HlsPlayer(config)
  }
}
