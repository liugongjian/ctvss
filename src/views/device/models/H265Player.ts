import { BasePlayer } from './BasePlayer'
import { dateFormat } from '@/utils/date'

export class H265Player extends BasePlayer {
  public h265?: any

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
    this.play()
  }

  /**
   * 设置默认值
   */
  public setDefault() {}

  /**
   * 绑定回调
   */

  private callbackfun(...res: any) {
    console.log(res)
    switch (res[0]) {
      case 'play':
        this.player.paused = false
        this.onPlay && this.onPlay()
        return
      case 'pause':
        this.player.paused = true
        this.onPause && this.onPause()
        return
      case 'ended':
        this.onEnded && this.onEnded()
        return
      case 'playbackTime':
        this.onSeeked && this.onSeeked()
        this.player.currentTime = res[1]
        this.onTimeUpdate && this.onTimeUpdate()
        return
      case 'endLoading':
        this.onCanplay && this.onCanplay()
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
  public reloadPlayer() {
    // this.player.destroy()
    // this.player = null
    // this.init()
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
    this.player.seekToSecs(time)
  }

  /**
   * 停止
   */
  public stop() {
    this.player.destroy()
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
    console.log($canvas.width, $canvas.height)
    let $link: any = document.createElement('a')
    $link.download = `${name}_${dateFormat(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.png`
    $link.href = $canvas.toDataURL('image/png')
    console.log($link.href)
    $link.click()
  }

  /**
   * 自动播放
   */
  public autoPlayVideo(player: any) {
    player.autoPlay = 1
  }
}
