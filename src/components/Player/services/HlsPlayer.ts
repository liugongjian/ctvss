import { Player } from './Player'
import { EnhanceHTMLVideoElement } from '../types/Player'
import HlsJS from 'hls.js'

export class HlsPlayer extends Player {
  private hls?: any

  /**
   * 初始化
   */
  protected init() {
    if (!HlsJS.isSupported()) {
      throw new Error('当前浏览器不支持Hls播放器')
    }
    const videoElement: EnhanceHTMLVideoElement = document.createElement('video')
    videoElement.controls = false
    videoElement.autoplay = true
    this.container.innerHTML = ''
    this.container.append(videoElement)
    const hls = new HlsJS({
      manifestLoadingMaxRetry: 2
    })
    hls.loadSource(this.url)
    hls.attachMedia(videoElement)
    hls.on(HlsJS.Events.MANIFEST_PARSED, () => {
      this.startAutoPlay()
    })
    this.hls = hls
    this.video = videoElement
  }

  /**
   * 绑定事件
   */
  protected bindEvent() {
    this.video.addEventListener('play', this.onPlay.bind(this))
    // 添加音量控制 在 baseplayer 里面声明方法
    // 这里的绑定都是将每个播放器的方法绑定到 baseplayer 上面。base player 里面只有几个共有的方法
    // 后期 可能需要调整 base player 和各个播放器之间的属性、方法关系
    this.video.addEventListener('pause', this.onPause.bind(this))
    this.video.addEventListener('timeupdate', this.onTimeUpdate.bind(this))
    this.video.addEventListener('durationchange', this.onDurationChange.bind(this))
    this.video.addEventListener('volumechange', this.onVolumeChange.bind(this))
    this.video.addEventListener('ratechange', this.onRateChange.bind(this))
    this.video.addEventListener('ended', this.onEnded.bind(this))
    this.video.addEventListener('seeked', this.onSeeked.bind(this))
    this.video.addEventListener('progress', this.onBuffered.bind(this))
    this.video.addEventListener('loadstart', this.onLoadStart.bind(this))
    this.video.addEventListener('canplay', this.onCanplay.bind(this))
  }

  /**
   * 重新加载视频
   */
  public reloadPlayer() {
    this.disposePlayer()
    this.init()
  }

  /**
   * Seek
   * @param time 秒
   */
  public seek(time: number) {
    this.video.currentTime = time
  }

  /**
   * 销毁播放器
   */
  public disposePlayer() {
    this.video.removeEventListener('play', this.onPlay)
    this.video.removeEventListener('pause', this.onPause)
    this.video.removeEventListener('timeupdate', this.onTimeUpdate)
    this.video.removeEventListener('durationchange', this.onDurationChange)
    this.video.removeEventListener('volumechange', this.onVolumeChange)
    this.video.removeEventListener('ratechange', this.onRateChange)
    this.video.removeEventListener('ended', this.onEnded)
    this.video.removeEventListener('seeked', this.onSeeked)
    this.video.removeEventListener('progress', this.onBuffered)
    this.video.removeEventListener('loadstart', this.onLoadStart)
    this.video.removeEventListener('canplay', this.onCanplay)
    this.hls && this.hls.destroy()
    this.isLoading = false
  }
}
