import { BasePlayer } from './BasePlayer'
import { dateFormat } from '@/utils/date'

export class H265Player extends BasePlayer {
  public h265?: any
  public onLoading = true
  public seekTime = 0
  public muteTimeout: any = null

  public init() {
    const videoElement = document.createElement('div')
    this.wrap.innerHTML = ''
    this.wrap.append(videoElement)
    videoElement.id = `h265_player_${new Date().getTime()}`
    // @ts-ignore
    const h265 = new WasmPlayer(null, videoElement.id, this.callbackfun.bind(this), {
      Height: true,
      enableAudio: true
    })
    console.log(h265)
    this.player = h265
    this.config.onLoadStart && this.onLoadStart()
    this.config.autoPlay && this.play()
  }

  /**
   * 设置默认值
   */
  public setDefault() {}

  /**
   * 绑定回调
   */

  private callbackfun(...res: any) {
    switch (res[0]) {
      case 'play':
        this.player.paused = !this.player.playFlag
        this.onPlay && this.onPlay()
        return
      case 'pause':
        this.player.paused = !this.player.playFlag
        this.onPause && this.onPause()
        return
      case 'ended':
        this.player.paused = !this.player.playFlag
        this.onEnded && this.onEnded()
        return
      case 'playbackTime':
        this.player.currentTime = res[1]
        this.onTimeUpdate && this.onTimeUpdate()
        return
      case 'endLoading':
        this.onEndLoading && this.onEndLoading()
    }
  }

  /**
   * 播放
   */
  public play() {
    this.player.play(this.source, 1)
  }

  /**
   * 回调-开始播放
   */
  public onPlay() {
    this.config.onLoadStart && this.onLoadStart()
    this.config.onPlay && this.config.onPlay()
  }

  /**
   * 重新加载视频
   */
  public reloadPlayer() {}

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
    this.seekTime = Math.floor(time)
    this.player.seekToSecs(this.seekTime)
  }

  /**
   * 回调-H265更新时间
   */
  public onTimeUpdate() {
    // console.log('onTimeUpdate', this.player.currentTime)
    this.config.onTimeUpdate && this.config.onTimeUpdate(this.player.currentTime)
    if (this.player.currentTime === 0) {
      this.onCanplay && this.onCanplay()
    }
  }

  public onEndLoading() {
    console.log('onEndloading')
    if (this.onLoading && this.seekTime) {
      this.player.seekToSecs(this.seekTime)
    }
    this.onLoading = false
    this.onCanplay && this.onCanplay()
  }

  /**
   * 停止
   */
  public stop() {
    this.player.stop()
  }

  /**
   * 静音
   * @param isMute
   */
  public switchMuteStatus(isMute: boolean) {
    clearTimeout(this.muteTimeout)
    if (isMute) {
      this.player.closeAudio()
    } else {
      this.player.openAudio()
      this.muteTimeout = setTimeout(() => {
        this.player.openAudio()
      }, 1000)
    }
    this.config.onVolumeChange && this.config.onVolumeChange(1, isMute)
  }

  /**
   * 销毁播放器
   */
  public disposePlayer() {
    this.player.destroy()
  }

  /**
   * 截图
   */
  public snapshot(name: string = 'snapshot') {
    let $canvas: HTMLCanvasElement | null = this.wrap.querySelector('canvas')
    if (!$canvas) return
    let $link: any = document.createElement('a')
    $link.download = `${name}_${dateFormat(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.png`
    $link.href = $canvas.toDataURL('image/png')
    $link.click()
  }

  /**
   * 自动播放
   */
  public autoPlayVideo(player: any) {
    player.autoPlay = 1
  }
}
