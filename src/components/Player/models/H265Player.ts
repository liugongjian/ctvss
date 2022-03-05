/**
 * @easydarwin/easywasmplayer
 * 4.0.13
 * https://www.npmjs.com/package/@easydarwin/easywasmplayer
 * EasyPlayer.js H5播放器，是一款能够同时支持HTTP、RTMP、HTTP-FLV、HLS（m3u8）视频直播与视频点播等多种协议，支持H.264、H.265、AAC等多种音视频编码格式，支持mse、wasm等多种解码方式，支持Windows、Linux、Android、iOS全平台终端的H5播放器。
 */

import { Player } from './Player'

export class H265Player extends Player {
  private wasmPlayer?: any
  private loading = true
  private seekTime = 0
  private muteTimeout: any = null

  /* 是否已暂停 */
  private _isPaused: boolean = true
  public get isPaused(): boolean {
    return this._isPaused
  }

  /**
   * 初始化
   */
  protected init() {
    this.container.id = `h265_player_${new Date().getTime()}`
    // @ts-ignore
    this.wasmPlayer = new WasmPlayer(null, this.container.id, this.bindH265Event.bind(this), {
      Height: true,
      enableAudio: true
    })
    console.log('wasmPlayer', this.wasmPlayer)
    this.canvas = this.wasmPlayer.canvas as HTMLCanvasElement
    this.canvas.parentElement.className = 'player__container'
    this.canvas.style = ''
    this.config.onLoadStart && this.onLoadStart()
    this.wasmPlayer.play(this.url, this.config.isAutoPlay)
  }

  /**
   * 绑定事件
   */
  private bindH265Event(...res: any) {
    // this.isDebug && console.log('H265播放器事件:', res)
    switch (res[0]) {
      case 'play':
        this.onPlay && this.onPlay()
        break
      case 'resume':
        this.onResume && this.onResume()
        break
      case 'pause':
        this.onPause && this.onPause()
        break
      case 'ended':
        this.onEnded && this.onEnded()
        break
      case 'playbackTime':
        this.wasmPlayer.currentTime = res[1]
        this.onTimeUpdate && this.onTimeUpdate()
        break
      case 'endLoading':
        this.onEndLoading && this.onEndLoading()
    }
  }

  /**
   * 设置默认值
   */
  protected setDefault() {}

  /**
   * 播放
   */
  public play() {
    this.wasmPlayer.resume()
  }

  /**
   * 播放
   */
  public pause() {
    this.wasmPlayer.pause()
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
    this.seekTime = Math.floor(time)
    this.wasmPlayer.seekToSecs(this.seekTime)
  }

  /**
   * 静音
   * @param isMute
   */
  public switchMuteStatus(isMute: boolean) {
    clearTimeout(this.muteTimeout)
    if (isMute) {
      this.wasmPlayer.closeAudio()
    } else {
      this.wasmPlayer.openAudio()
      this.muteTimeout = setTimeout(() => {
        this.wasmPlayer.openAudio()
      }, 1000)
    }
    this.config.onVolumeChange && this.config.onVolumeChange(1, isMute)
  }

  /**
   * 销毁播放器
   */
  public disposePlayer() {
    this.wasmPlayer.destroy()
  }

  /**
   * 回调事件
   * 当开始播放
   */
  protected onPlay() {
    this._isPaused = false
    this.config.onLoadStart && this.onLoadStart()
    this.config.onPlay && this.config.onPlay()
  }

  /**
   * 回调事件
   * 当恢复播放
   */
  protected onResume() {
    this._isPaused = false
    this.config.onPlay && this.config.onPlay()
  }

  /**
   * 回调事件
   * 当暂停
   */
  protected onPause() {
    this._isPaused = true
    this.config.onPause && this.config.onPause()
  }

  /**
   * 回调事件
   * 更新时间
   */
  protected onTimeUpdate() {
    this.getDuration()
    this.config.onTimeUpdate && this.config.onTimeUpdate(this.wasmPlayer.currentTime)
    // if (this.wasmPlayer.currentTime === 0) {
    //   this.onCanplay && this.onCanplay()
    // }
  }

  /**
   * 回调事件
   * 当更新时长
   */
  protected onDurationChange() {
    this.config.onDurationChange && this.config.onDurationChange(this.wasmPlayer.duration)
  }

  /**
   * 回调事件
   * Loading完成
   */
  private onEndLoading() {
    if (this.loading && this.seekTime) {
      this.wasmPlayer.seekToSecs(this.seekTime)
    }
    this.loading = false
    this.onResume && this.onResume()
    this.onCanplay && this.onCanplay()
  }

  /**
   * 检测是否有音频
   */
  protected testHasAudio() {
    this.config.onTestHasAudio && this.config.onTestHasAudio(true)
  }

  /**
   * 获取视频时长
   * H265播放器没有返回duration属性，只能通过timeLabel中的string解析
   */
  private getDuration() {
    // 如已获得duration则不再解析
    if (this.wasmPlayer.duration) return
    const timeLabel = this.wasmPlayer.timeLabel.innerHTML
    if (timeLabel) {
      const durationString = timeLabel.split('/')[1]
      const time = durationString.split(':')
      this.wasmPlayer.duration = parseInt(time[0]) * 60 * 60 + parseInt(time[1]) * 60 + parseInt(time[2])
      this.onDurationChange()
    }
  }
}
