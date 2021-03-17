import { FlvPlayer } from './FlvPlayer'
import { HlsPlayer } from './HlsPlayer'
import { RtcPlayer } from './RtcPlayer'

export const createPlayer = (config: any) => {
  if (!config.type) {
    throw new Error('不支持当前视频类型')
  }
  const wrapElement: HTMLDivElement = config.wrap

  if (!wrapElement) {
    throw new Error('找不到指定的ID Video元素')
  }
  if (config.type !== 'h265-flv') {
    config.source = config.isWs ? config.source.replace('http://', 'ws://') : config.source
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
const initPlayer = (config: any) => {
  switch (config.type) {
    case 'flv':
      return new FlvPlayer(config)
    case 'hls':
      return new HlsPlayer(config)
    case 'rtc':
      return new RtcPlayer(config)
  }
}

/**
 * 根据后缀检查视频类型
 */
const getType = (source: string) => {
  const a = document.createElement('a')
  a.href = source
  const allowType = ['flv', 'mp4', 'm3u8']
  const path = /[^.]+$/.exec(a.pathname)
  if (path && allowType.includes(path[0])) {
    return path[0]
  }
}
