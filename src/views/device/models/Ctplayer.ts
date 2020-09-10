// @ts-ignore
import flvjs from 'flv.js/src/flv.js'
import Hls from 'hls.js'
import { dateFormat } from '@/utils/date'
import '@/libs/h265/goldplay.css'

export default class Ctplayer {
  public source: string
  public wrap: HTMLDivElement
  public autoPlay: boolean
  public hasControl: boolean
  public player: any
  public hls?: any
  public flv?: any
  public type?: string
  public isLive?: boolean
  public playbackRate?: number
  private onPlay?: Function
  private onPause?: Function
  private onTimeUpdate?: Function
  private onResizeScreen?: Function
  private onReset?: Function
  private onEnded?: Function
  private onRetry?: Function
  private onSeeked?: Function

  public constructor(config: any) {
    this.wrap = config.wrap
    this.source = config.source
    this.autoPlay = config.autoPlay
    this.hasControl = config.hasControl
    this.type = config.type
    this.isLive = config.isLive
    this.playbackRate = config.playbackRate || 1
    this.onPlay = config.onPlay
    this.onPause = config.onPause
    this.onTimeUpdate = config.onTimeUpdate
    this.onResizeScreen = config.onResizeScreen
    this.onReset = config.onReset
    this.onEnded = config.onEnded
    this.onRetry = config.onRetry
    this.onSeeked = config.onSeeked
    this.init()
  }

  private init() {
    this.type = this.type || this.getType(this.source)
    if (!this.type) {
      throw new Error('不支持当前视频类型')
    }
    const wrapElement: HTMLDivElement = this.wrap

    if (!wrapElement) {
      throw new Error('找不到指定的ID Video元素')
    }
    this.player = this.createPlayer(wrapElement)
    if (!this.player) {
      throw new Error('播放器创建失败')
    }
    this.bindEvent()
    this.setDefault()
  }

  private createPlayer(wrapElement: HTMLDivElement) {
    switch (this.type) {
      case 'flv':
        return this.createFlv(wrapElement)
      case 'hls':
        return this.createHls(wrapElement)
      case 'mp4':
        return this.createDefault(wrapElement)
      case 'h265-flv':
        return this.createH265Flv(wrapElement)
      case 'h265-hls':
        return this.createH265Hls(wrapElement)
    }
  }

  /**
   * 绑定事件
   */
  private bindEvent() {
    switch (this.type) {
      case 'flv':
      case 'hls':
        this.player.addEventListener('play', this.h264Play.bind(this))
        this.player.addEventListener('pause', this.h264Pause.bind(this))
        this.player.addEventListener('timeupdate', this.h264TimeUpdate.bind(this))
        this.player.addEventListener('ended', this.h264Ended.bind(this))
        this.player.addEventListener('seeked', this.h264Seeked.bind(this))
        break
      case 'h265-hls':
        this.player.events.on('Player.resizeScreen', this.resizeH265Hls.bind(this))
        this.player.events.on('Player.timeUpdate', this.h265HlsTimeUpdate.bind(this))
    }
  }

  /**
   * 设置默认值
   */
  private setDefault() {
    switch (this.type) {
      case 'flv':
      case 'hls':
        this.player.playbackRate = this.playbackRate
    }
  }

  /**
   * 销毁播放器
   */
  public disposePlayer() {
    try {
      const wrapElement: HTMLDivElement = this.wrap
      switch (this.type) {
        case 'flv':
          this.player.removeEventListener('play', this.h264Play)
          this.player.removeEventListener('pause', this.h264Pause)
          this.player.removeEventListener('timeupdate', this.h264TimeUpdate)
          this.player.removeEventListener('ended', this.h264Ended)
          this.player.removeEventListener('seeked', this.h264Seeked)
          this.flv.destroy()
          break
        case 'hls':
          this.player.removeEventListener('play', this.h264Play)
          this.player.removeEventListener('pause', this.h264Pause)
          this.player.removeEventListener('timeupdate', this.h264TimeUpdate)
          this.player.removeEventListener('ended', this.h264Ended)
          this.player.removeEventListener('seeked', this.h264Seeked)
          this.hls.destroy()
          break
        case 'mp4':
          this.player.stop()
          break
        case 'h265-flv':
          this.player.destroy()
          this.player = null
          break
        case 'h265-hls':
          this.player.events.off('Player.resizeScreen', this.resizeH265Hls)
          this.player.events.off('Player.timeUpdate', this.h265HlsTimeUpdate)
          this.player.destroy()
          break
      }
      wrapElement!.innerHTML = ''
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 重新加载视频
   */
  public reloadPlayer() {
    switch (this.type) {
      case 'flv':
        this.player.unload()
        this.player.load()
        this.player.play()
        break
      case 'hls':
      case 'mp4':
    }
  }

  /**
   * 播放
   */
  public play() {
    switch (this.type) {
      case 'flv':
      case 'hls':
      case 'mp4':
      case 'h265-flv':
        this.player.play()
        break
    }
  }

  /**
   * 暂停
   */
  public pause() {
    switch (this.type) {
      case 'flv':
      case 'hls':
      case 'mp4':
      case 'h265-flv':
        this.player.pause()
        break
    }
  }

  /**
   * Seek
   * @param time 秒
   */
  public seek(time: number) {
    switch (this.type) {
      case 'flv':
      case 'hls':
        this.player.currentTime = time
        break
      case 'h265-hls':
        this.player.seek(time)
        break
    }
  }

  /**
   * 切换播放速度
   * @param playbackRate
   */
  public setPlaybackRate(playbackRate: number) {
    switch (this.type) {
      case 'flv':
      case 'hls':
        this.player.playbackRate = playbackRate
        break
    }
  }

  /**
   * 停止
   */
  public stop() {
    this.player.stop()
  }

  /**
   * 截图
   */
  public snapshot(name: string = 'snapshot') {
    let $video: HTMLVideoElement | null = this.wrap.querySelector('video')
    if (!$video) return
    let $canvas: any | null = document.createElement('canvas')
    $canvas.width = $video.videoWidth
    $canvas.height = $video.videoHeight
    $canvas!.getContext('2d').drawImage($video, 0, 0, $canvas.width, $canvas.height)
    let $link: any = document.createElement('a')
    $link.download = `${name}_${dateFormat(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.png`
    $link.href = $canvas.toDataURL('image/png')
    $link.click()
  }

  /**
   * H265 Flv 方式播放
   */
  private createH265Flv(wrapElement: HTMLDivElement) {
    // @ts-ignore
    const KsPlayer = window.h265js
    const canvasElement = document.createElement('canvas')
    const width = wrapElement.clientWidth
    const height = width * 9 / 16
    canvasElement.setAttribute('width', width.toString())
    canvasElement.setAttribute('height', height.toString())
    const audioElement = document.createElement('audio')
    wrapElement.innerHTML = ''
    wrapElement.append(canvasElement)
    wrapElement.append(audioElement)
    let player = KsPlayer.createPlayer({
      isLive: true
    },
    {
      wasmFilePath: `${window.location.origin}/lib/libqydecoder.wasm`,
      maxLength4ToBeDecodeQueue: 7 + 30 * 30, // 待解码NALU队列最大长度 (fps * s) 7 + 30 * 30
      maxLength4ToBeRenderQueue: 200, // 待渲染frame队列最大长度 (720p每帧2M，1080p每帧3M) 200
      enableYUVrender: true,
      enableSkipFrame: false,
      disableStreamLoader: false,
      lazyLoadMaxDuration: 3 * 60,
      seekType: 'range',
      url: this.source,
      timeToDecideWaiting: 500, // 暂停多久算卡顿, 默认500ms
      bufferTime: 500, // 启播前缓冲视频时长（ms）
      token: '30ed327e0ccbdbf594223f0f8f092f12'
    }, {
      audioElement: audioElement,
      canvas: canvasElement
    })

    player.on(KsPlayer.Events.WAITING, (event: any, data: any) => {
      // console.log('WAITING: ', event, data)
    })
    player.on(KsPlayer.Events.PLAYING, (event: any, data: any) => {
      // console.log('PLAYING: ', event, data)
    })
    player.on(KsPlayer.Events.RELOAD, (event: any, data: any) => {
      // console.log('RELOAD: ', event, data)
    })
    player.on(KsPlayer.Events.MEDIAINFO, (event: any, data: any) => {
      // console.log('MEDIAINFO: ', event, data)
    })
    player.on(KsPlayer.Events.READY, () => {
      player.load()
    })
    player.on(KsPlayer.Events.ERROR, (event: any, data: any) => {
      if (data.detail === 'AudioAutoPlayUnsupported') {
        player.destroy()
        const playButton = document.createElement('div')
        playButton.className = 'play'
        playButton.addEventListener('click', () => {
          player = this.createH265Flv(wrapElement)
          this.onReset && this.onReset(player)
        })
        wrapElement.append(playButton)
      }
    })
    return player
  }

  private createH265Hls(wrapElement: HTMLDivElement) {
    // @ts-ignore
    const GoldPlay = window.GoldPlay
    const player: any = new GoldPlay(wrapElement, {
      sourceURL: this.source,
      type: 'HLS',
      autoPlay: this.autoPlay,
      libPath: `${window.location.origin}/lib/`,
      playBackRate: 1,
      containerFullPage: false
    })
    player.muted = true
    return player
  }

  /**
   * Flv 方式播放
   */
  private createFlv(wrapElement: any) {
    if (!flvjs.isSupported()) {
      throw new Error('当前浏览器不支持Flv播放器')
    }
    const videoElement: HTMLVideoElement = document.createElement('video')
    videoElement.controls = this.hasControl
    wrapElement.innerHTML = ''
    wrapElement.append(videoElement)
    const flvPlayer = flvjs.createPlayer({
      type: 'flv',
      isLive: true,
      url: this.source
    })
    flvPlayer.attachMediaElement(videoElement)
    flvPlayer.load()
    flvPlayer.play()
    flvPlayer.on(flvjs.Events.ERROR, (e: any) => {
      console.log('ERROR', e)
      if (e === flvjs.ErrorTypes.NETWORK_ERROR) {
        this.onRetry && this.onRetry()
      }
    })
    flvPlayer.on(flvjs.Events.STATISTICS_INFO, (e: any) => {
      // console.log('STATISTICS_INFO', e)
    })
    flvPlayer.on(flvjs.Events.METADATA_ARRIVED, (e: any) => {
      console.log('METADATA_ARRIVED', e)
    })
    flvPlayer.on(flvjs.Events.METADATA_ARRIVED, (e: any) => {
      console.log('LOADING_COMPLETE', e)
    })
    flvPlayer.on(flvjs.Events.MEDIA_ENDED, () => {
      if (this.isLive) {
        this.onRetry && this.onRetry()
      }
    })
    this.flv = flvPlayer
    return videoElement
  }

  /**
   * Hls 方式播放
   */
  private createHls(wrapElement: any) {
    if (!flvjs.isSupported()) {
      throw new Error('当前浏览器不支持Hls播放器')
    }
    const videoElement: HTMLVideoElement = document.createElement('video')
    videoElement.controls = this.hasControl
    wrapElement.innerHTML = ''
    wrapElement.append(videoElement)
    const hls = new Hls({
      manifestLoadingMaxRetry: 2
    })
    hls.loadSource(this.source)
    hls.attachMedia(videoElement)
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      this.autoPlayVideo(videoElement, videoElement)
    })
    this.hls = hls
    return videoElement
  }

  /**
   * 默认方式播放
   */
  private createDefault(wrapElement: any) {
    wrapElement.src = this.source
    return wrapElement
  }

  /**
   * 检测是否支持自动播放
   */
  private testAutoPlay() {
    return new Promise(resolve => {
      const audio = document.createElement('audio')
      let mp4 = document.createElement('source')
      mp4.src = 'data:video/mp4;base64,AAAAFGZ0eXBNU05WAAACAE1TTlYAAAOUbW9vdgAAAGxtdmhkAAAAAM9ghv7PYIb+AAACWAAACu8AAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAnh0cmFrAAAAXHRraGQAAAAHz2CG/s9ghv4AAAABAAAAAAAACu8AAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAFAAAAA4AAAAAAHgbWRpYQAAACBtZGhkAAAAAM9ghv7PYIb+AAALuAAANq8AAAAAAAAAIWhkbHIAAAAAbWhscnZpZGVBVlMgAAAAAAABAB4AAAABl21pbmYAAAAUdm1oZAAAAAAAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAAVdzdGJsAAAAp3N0c2QAAAAAAAAAAQAAAJdhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAFAAOABIAAAASAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGP//AAAAEmNvbHJuY2xjAAEAAQABAAAAL2F2Y0MBTUAz/+EAGGdNQDOadCk/LgIgAAADACAAAAMA0eMGVAEABGjuPIAAAAAYc3R0cwAAAAAAAAABAAAADgAAA+gAAAAUc3RzcwAAAAAAAAABAAAAAQAAABxzdHNjAAAAAAAAAAEAAAABAAAADgAAAAEAAABMc3RzegAAAAAAAAAAAAAADgAAAE8AAAAOAAAADQAAAA0AAAANAAAADQAAAA0AAAANAAAADQAAAA0AAAANAAAADQAAAA4AAAAOAAAAFHN0Y28AAAAAAAAAAQAAA7AAAAA0dXVpZFVTTVQh0k/Ou4hpXPrJx0AAAAAcTVREVAABABIAAAAKVcQAAAAAAAEAAAAAAAAAqHV1aWRVU01UIdJPzruIaVz6ycdAAAAAkE1URFQABAAMAAAAC1XEAAACHAAeAAAABBXHAAEAQQBWAFMAIABNAGUAZABpAGEAAAAqAAAAASoOAAEAZABlAHQAZQBjAHQAXwBhAHUAdABvAHAAbABhAHkAAAAyAAAAA1XEAAEAMgAwADAANQBtAGUALwAwADcALwAwADYAMAA2ACAAMwA6ADUAOgAwAAABA21kYXQAAAAYZ01AM5p0KT8uAiAAAAMAIAAAAwDR4wZUAAAABGjuPIAAAAAnZYiAIAAR//eBLT+oL1eA2Nlb/edvwWZflzEVLlhlXtJvSAEGRA3ZAAAACkGaAQCyJ/8AFBAAAAAJQZoCATP/AOmBAAAACUGaAwGz/wDpgAAAAAlBmgQCM/8A6YEAAAAJQZoFArP/AOmBAAAACUGaBgMz/wDpgQAAAAlBmgcDs/8A6YEAAAAJQZoIBDP/AOmAAAAACUGaCQSz/wDpgAAAAAlBmgoFM/8A6YEAAAAJQZoLBbP/AOmAAAAACkGaDAYyJ/8AFBAAAAAKQZoNBrIv/4cMeQ=='
      let webm = document.createElement('source')
      webm.src = 'data:video/webm;base64,GkXfo49CgoR3ZWJtQoeBAUKFgQEYU4BnAQAAAAAAF60RTZt0vE27jFOrhBVJqWZTrIIQA027jFOrhBZUrmtTrIIQbE27jFOrhBFNm3RTrIIXmU27jFOrhBxTu2tTrIIWs+xPvwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFUmpZuQq17GDD0JATYCjbGliZWJtbCB2MC43LjcgKyBsaWJtYXRyb3NrYSB2MC44LjFXQY9BVlNNYXRyb3NrYUZpbGVEiYRFnEAARGGIBc2Lz1QNtgBzpJCy3XZ0KNuKNZS4+fDpFxzUFlSua9iu1teBAXPFhL4G+bmDgQG5gQGIgQFVqoEAnIEAbeeBASMxT4Q/gAAAVe6BAIaFVl9WUDiqgQEj44OEE95DVSK1nIN1bmTgkbCBULqBPJqBAFSwgVBUuoE87EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB9DtnVB4eeBAKC4obaBAAAAkAMAnQEqUAA8AABHCIWFiIWEiAICAAamYnoOC6cfJa8f5Zvda4D+/7YOf//nNefQYACgnKGWgQFNANEBAAEQEAAYABhYL/QACIhgAPuC/rOgnKGWgQKbANEBAAEQEAAYABhYL/QACIhgAPuC/rKgnKGWgQPoANEBAAEQEAAYABhYL/QACIhgAPuC/rOgnKGWgQU1ANEBAAEQEAAYABhYL/QACIhgAPuC/rOgnKGWgQaDANEBAAEQEAAYABhYL/QACIhgAPuC/rKgnKGWgQfQANEBAAEQEAAYABhYL/QACIhgAPuC/rOgnKGWgQkdANEBAAEQEBRgAGFgv9AAIiGAAPuC/rOgnKGWgQprANEBAAEQEAAYABhYL/QACIhgAPuC/rKgnKGWgQu4ANEBAAEQEAAYABhYL/QACIhgAPuC/rOgnKGWgQ0FANEBAAEQEAAYABhYL/QACIhgAPuC/rOgnKGWgQ5TANEBAAEQEAAYABhYL/QACIhgAPuC/rKgnKGWgQ+gANEBAAEQEAAYABhYL/QACIhgAPuC/rOgnKGWgRDtANEBAAEQEAAYABhYL/QACIhgAPuC/rOgnKGWgRI7ANEBAAEQEAAYABhYL/QACIhgAPuC/rIcU7trQOC7jLOBALeH94EB8YIUzLuNs4IBTbeH94EB8YIUzLuNs4ICm7eH94EB8YIUzLuNs4ID6LeH94EB8YIUzLuNs4IFNbeH94EB8YIUzLuNs4IGg7eH94EB8YIUzLuNs4IH0LeH94EB8YIUzLuNs4IJHbeH94EB8YIUzLuNs4IKa7eH94EB8YIUzLuNs4ILuLeH94EB8YIUzLuNs4INBbeH94EB8YIUzLuNs4IOU7eH94EB8YIUzLuNs4IPoLeH94EB8YIUzLuNs4IQ7beH94EB8YIUzLuNs4ISO7eH94EB8YIUzBFNm3SPTbuMU6uEH0O2dVOsghTM'
      audio.appendChild(mp4)
      audio.appendChild(webm)
      document.body.appendChild(audio)

      const onLoad = (isSupport: boolean) => {
        audio.remove()
        resolve(isSupport)
      }

      audio.play().then(() => {
        onLoad(true)
      }).catch(err => {
        console.log(err)
        onLoad(false)
      })
    })
  }

  /**
   * 根据后缀检查视频类型
   */
  private getType(url: string) {
    const a = document.createElement('a')
    a.href = this.source
    const allowType = ['flv', 'mp4', 'm3u8']
    const path = /[^.]+$/.exec(a.pathname)
    if (path && allowType.includes(path[0])) {
      return path[0]
    }
  }

  private autoPlayVideo(player: any, wrapElement: any) {
    if (this.autoPlay) {
      try {
        this.testAutoPlay().then(isSupport => {
          if (isSupport) {
            player.play()
          } else {
            wrapElement.muted = true
            player.play()
          }
        })
      } catch (e) {
        console.log(e)
      }
    }
  }

  /**
   * H264 开始播放
   */
  private h264Play() {
    this.onPlay && this.onPlay()
  }

  /**
   * H264 开始播放
   */
  private h264Pause() {
    this.onPause && this.onPause()
  }

  /**
   * H264 HLS更新时间
   */
  private h264TimeUpdate() {
    this.onTimeUpdate && this.onTimeUpdate(this.player.currentTime)
  }

  /**
   * H264 HLS播放结束
   */
  private h264Ended() {
    this.onEnded && this.onEnded()
  }

  /**
   * H264 HLS Seeked
   */
  private h264Seeked() {
    this.onSeeked && this.onSeeked(this.player.currentTime)
  }

  /**
   * H265 HLS设置播放器大小
   * @param width
   * @param height
   */
  private resizeH265Hls(width: number, height: number) {
    this.onResizeScreen && this.onResizeScreen(width, height)
  }

  /**
   * H265 HLS更新时间
   * @param e
   */
  private h265HlsTimeUpdate(e: any) {
    // 统一返回"秒"为单位
    this.onTimeUpdate && this.onTimeUpdate(e / 1000)
  }
}
