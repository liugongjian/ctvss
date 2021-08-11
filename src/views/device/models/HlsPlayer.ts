// @ts-ignore
import Hls from 'hls.js'
import { BasePlayer } from './BasePlayer'

export class HlsPlayer extends BasePlayer {
  public hls?: any

  public init() {
    if (!Hls.isSupported()) {
      throw new Error('当前浏览器不支持Hls播放器')
    }
    const videoElement: HTMLVideoElement = document.createElement('video')
    videoElement.controls = this.hasControl
    this.wrap.innerHTML = ''
    this.wrap.append(videoElement)
    const hls = new Hls({
      manifestLoadingMaxRetry: 2
    })
    hls.loadSource(this.source)
    hls.attachMedia(videoElement)
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      this.autoPlayVideo(videoElement)
    })
    this.hls = hls
    this.player = videoElement
  }

  /**
   * 绑定事件
   */
  public bindEvent() {
    this.player.addEventListener('play', this.onPlay.bind(this))
    // 添加音量控制 在 baseplayer 里面声明方法
    // 这里的绑定都是将每个播放器的方法绑定到 baseplayer 上面。base player 里面只有几个共有的方法
    // 后期 可能需要调整 base player 和各个播放器之间的属性、方法关系
    this.player.addEventListener('volumechange', this.onVolumeChange.bind(this))
    // this.player.addEventListener('killvolume', this.onKillPlayVolume.bind(this))
    this.player.addEventListener('pause', this.onPause.bind(this))
    this.player.addEventListener('timeupdate', this.onTimeUpdate.bind(this))
    this.player.addEventListener('durationchange', this.onDurationChange.bind(this))
    this.player.addEventListener('ended', this.onEnded.bind(this))
    this.player.addEventListener('seeked', this.onSeeked.bind(this))
    this.player.addEventListener('progress', this.onBuffered.bind(this))
    this.player.addEventListener('loadstart', this.onLoadStart.bind(this))
    this.player.addEventListener('canplay', this.onCanplay.bind(this))
  }

  /**
   * 设置默认值
   */
  public setDefault() {
    this.player.playbackRate = this.playbackRate
  }

  /**
   * 设置默认值
   */
  public play() {
    this.player.play()
  }

  /**
   * 重新加载视频
   */
  public reloadPlayer() {
    this.player.destroy()
    this.player = null
    this.init()
  }

  /**
   * 暂停
   */
  public pause() {
    this.player.pause()
  }

  /**
   * Seek
   * @param time 秒
   */
  public seek(time: number) {
    this.player.currentTime = time
  }

  /**
   * 切换播放速度
   * @param playbackRate
   */
  public setPlaybackRate(playbackRate: number) {
    this.player.playbackRate = playbackRate
  }

  /**
   * 调整音量
   */
  public setPlayVolume(volume: any, testFlag: any) {
    console.log('hls player ts volume')
    console.log('volume ：', volume)
    console.log('testFlag ：', testFlag)
    this.player.volume = volume / 100
    console.log('this.player.volume ：', this.player.volume)
  }
  /**
   * 停止
   */
  public stop() {
    this.player.stop()
  }

  /**
   * 销毁播放器
   */
  public disposePlayer() {
    this.player.removeEventListener('play', this.onPlay)
    this.player.removeEventListener('pause', this.onPause)
    this.player.removeEventListener('timeupdate', this.onTimeUpdate)
    this.player.removeEventListener('ended', this.onEnded)
    this.player.removeEventListener('seeked', this.onSeeked)
    this.player.removeEventListener('progress', this.onBuffered)
    this.player.removeEventListener('loadstart', this.onLoadStart)
    this.player.removeEventListener('canplay', this.onCanplay)
    this.player.removeEventListener('volumechange', this.onVolumeChange.bind(this))
    // this.player.removeEventListener('killvolume', this.onKillPlayVolume.bind(this))
    this.hls && this.hls.destroy()
  }
}
