import { BasePlayer } from './BasePlayer'
import { dateFormat } from '@/utils/date'

export class H265Player extends BasePlayer {
  public h265?: any
  public onLoading = true
  public seekTime = 0

  public init() {
    const videoElement = document.createElement('div')
    this.wrap.innerHTML = ''
    this.wrap.append(videoElement)
    videoElement.id = `h265_player_${new Date().getTime()}`
    // @ts-ignore
    const h265 = new WasmPlayer(null, videoElement.id, this.callbackfun.bind(this), {
      Height: true
    })
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
        this.onSeeked && this.onSeeked()
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
   * 回调-H265 Seeked
   */
  public onSeeked() {
    this.config.onSeeked && this.config.onSeeked(this.player.currentTime)
    if (this.player.currentTime === 0) {
      this.onCanplay && this.onCanplay()
    }
  }

  public onEndLoading() {
    if (this.onLoading && this.seekTime) {
      this.player.seekToSecs(this.seekTime)
    }
    this.onLoading = false
    if (this.isLive) {
      this.onCanplay && this.onCanplay()
    }
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
