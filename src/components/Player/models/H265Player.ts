/**
 * @easydarwin/easywasmplayer
 * 1.0.4
 * https://www.npmjs.com/package/@easydarwin/easywasmplayer/v/1.0.4
 * EasyPlayer.js H5播放器，是一款能够同时支持HTTP、RTMP、HTTP-FLV、HLS（m3u8）视频直播与视频点播等多种协议，支持H.264、H.265、AAC等多种音视频编码格式，支持mse、wasm等多种解码方式，支持Windows、Linux、Android、iOS全平台终端的H5播放器。
 */

import { Player } from './Player'

export class H265Player extends Player {
  public canvas: HTMLCanvasElement
  private wasmPlayer?: any
  private onLoading = true
  private seekTime = 0
  private muteTimeout: any = null

  protected init() {
    this.container.id = `h265_player_${new Date().getTime()}`
    // @ts-ignore
    this.wasmPlayer = new WasmPlayer(null, this.container.id, this.callbackfun.bind(this), {
      Height: true,
      enableAudio: true
    })
    this.canvas = this.wasmPlayer.canvas as HTMLCanvasElement
    // this.config.onLoadStart && this.onLoadStart()
    this.config.isAutoPlay && this.play()
  }

  /**
   * 绑定事件
   */
  private callbackfun(...res: any) {
    switch (res[0]) {
      case 'play':
        this.onPlay && this.onPlay()
        return
      case 'pause':
        this.onPause && this.onPause()
        return
      case 'ended':
        this.onEnded && this.onEnded()
        return
      case 'playbackTime':
        this.video.currentTime = res[1]
        this.onTimeUpdate && this.onTimeUpdate()
        return
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
    console.log('play', this.url)
    this.wasmPlayer.play(this.url, 1)
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
   * 回调-开始播放
   */
  public onPlay() {
    this.config.onLoadStart && this.onLoadStart()
    this.config.onPlay && this.config.onPlay()
  }

  public onEndLoading() {
    console.log('onEndloading')
    if (this.onLoading && this.seekTime) {
      this.wasmPlayer.seekToSecs(this.seekTime)
    }
    this.onLoading = false
    this.onCanplay && this.onCanplay()
  }

  /**
   * 检测是否有音频
   */
  public testHasAudio() {
    this.config.onTestHasAudio && this.config.onTestHasAudio(true)
  }
}
