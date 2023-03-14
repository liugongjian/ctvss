<!--语音对讲-->
<template>
  <div>
    <!-- v-if="inProtocol === 'gb28181'" -->
    <el-tooltip content="开启语音对讲" placement="top">
      <!-- v-if="isLive" -->
      <div class="control__btn control__snapshot" @click.stop.prevent="toIntercom">
        <svg-icon name="micro" />
      </div>
    </el-tooltip>
    <el-dialog
      v-if="showDialog"
      title="语音对讲"
      :visible="true"
      :close-on-click-modal="true"
      :append-to-body="true"
      :destroy-on-close="true"
      class="intercom-box"
      width="80%"
      @close="closeThis"
    >
      <div class="intercom-content">
        <!--  v-if="intercomInfo.isLive" -->
        <div class="intercom-player live-view">
          <Player
            v-if="intercomInfo.url"
            ref="player"
            :type="intercomInfo.type"
            :codec="intercomInfo.codec"
            :url="intercomInfo.url"
            :is-live="true"
            :has-control="false"
            :has-playback="true"
            :volume="volume"
          />
          <div v-if="!intercomInfo.url && !intercomInfo.loading" class="tip-text">{{ intercomInfo.errorMsg || '无信号' }}</div>
        </div>
        <div class="intercom-micro">
          <div class="interco-micro-about">
            <div class="intercom-micro-vol">
              <div ref="intercomMicroVolCtx" class="intercom-micro-vol-ctx" />
            </div>
            <div
              class="intercom-micro-btn"
              @mousedown="intercomMousedown"
              @mouseup="intercomMouseup"
              @mouseleave="intercomMouseleave"
            >
              <svg-icon name="microphone" width="66px" height="66px" />
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator'
import { startTalk, stopTalk } from '@/api/intercom'
import { StreamInfo, DeviceInfo } from '@/components/VssPlayer/types/VssPlayer'
import Player from '@/components/Player/index.vue'
import { ScreenModule } from '@/store/modules/screen'
import ComponentMixin from './mixin'

@Component({
  name: 'Intercom',
  components: {
    Player
  }
})

export default class extends ComponentMixin {
  @Prop({
    default: {}
  }) private deviceInfo: DeviceInfo

  @Prop() private streamInfo: StreamInfo

  @Prop({
    default: ''
  }) private url: string

  @Prop({
    default: ''
  }) private type: string

  @Prop({
    default: ''
  }) private codec: string
  @Prop({
    default: 0.3
  }) private volume: number

  private intercomInfo?: any = {}
  private showDialog: boolean = false
  private streamAudio: any
  private ctxAudio: any
  private sourceAudio: any
  private maxVol = 0
  private scriptProcessor: any
  private ws: WebSocket
  private transPriority: any
  private ifCloseStatus = 0
  private last: number
  private cannotStop: boolean
  private audioKey: string

  @Watch('maxVol')
  private getVolStyle(val: number) {
    const dom = document.querySelector('.intercom-micro-vol-ctx') as HTMLElement
    if (val > 0) {
      dom.style.height = `${val * 2.6 + 10}px`
    } else {
      dom.style.height = '0'
    }
  }

  private closeThis() {
    this.showDialog = false
    if (this.ws || this.sourceAudio) {
      this.intercomMouseup()
    }
    ScreenModule.SetIsMutedAll(false)
  }

  private mounted() {
    // this.intercomInfo = { ...this.deviceInfo, ...this.streamInfo, ...{ type: this.type, url: this.url } }
  }

  private toIntercom() {
    this.intercomInfo = { ...this.deviceInfo, ...this.streamInfo, ...{ type: this.type, url: this.url } }
    this.showDialog = true
    ScreenModule.SetIsMutedAll(true)
    window.addEventListener('beforeunload', () => this.destroyIntercom())
  }

  private destroyed() {
    this.destroyIntercom()
    window.removeEventListener('beforeunload', () => this.destroyIntercom())
  }

  private destroyIntercom() {
    if (this.ws || this.sourceAudio) {
      this.intercomMouseup()
    }
  }

  private intercomMouseleave() {
    this.destroyIntercom()
  }

  private intercomMousedown() {
    const nowTime = Date.now()
    if (this.last && nowTime - this.last < 1000) {
      if (document.querySelectorAll('.el-message').length === 0) {
        this.$message.warning('点的太快了，请稍后再点击~')
      }
    } else {
      this.audioKey = this.randomKey()
      const param = {
        deviceId: this.intercomInfo.deviceId,
        transPriority: 'UDP', // 先使用UDP，等流媒体侧兼容之后再使用参数
        inProtocol: this.intercomInfo.inProtocol,
        audioKey: this.audioKey
      }

      this.ifCloseStatus = 0
      startTalk(param).then((res: any) => {
        if (this.ws) {
          this.stopRecord()
        }
        this.cannotStop = false
        const { streamServerAddr } = res
        const ifwss = window.location.protocol === 'https:' ? 'wss' : 'ws'
        const wsUrl = `${ifwss}://${streamServerAddr}/talk/${this.intercomInfo.deviceId}`
        try {
          this.ws = new WebSocket(wsUrl)
          this.ws.onopen = (e: any) => {
            console.log('连接建立', e, this.ifCloseStatus)
            if (this.ifCloseStatus !== 1) {
              this.ws.send(this.intercomInfo.deviceId)
              this.startRecord()
            } else {
              this.ws.close()
            }
          }
          this.ws.onerror = () => {
            this.$message.error('连接已被提前终止')
            this.intercomMouseup()
          }
          this.ws.onmessage = (e: any) => {
            const { data } = e
            if (data === 'streamserver error') {
              this.intercomMouseup()
            }
          }
        } catch (e) {
          console.log(`连接错误：${e}`)
        }
      }).catch((err: any) => {
        if (err.message.indexOf('不支持') > -1) {
          this.cannotStop = true
        }
        if (this.ifCloseStatus !== 1) {
          this.$message.error(`${err.message ? err.message : err}`)
        }
      })
    }
  }

  private intercomMouseup() {
    if (!this.cannotStop) {
      const nowTime = Date.now()
      if (!this.last || nowTime - this.last > 1000) {
        // this.last = Date.now()
        this.isClick = false
        this.last = nowTime
        const param = {
          deviceId: this.intercomInfo.deviceId,
          audioKey: this.audioKey
        }
        this.stopRecord()
        stopTalk(param).then(() => {
          this.last = Date.now()
        }).catch((err: any) => {
          this.last = Date.now()
          this.$message.error(`${err.message ? err.message : err}`)
        })
      } else {
        // this.last = Date.now()
      }
    } else {
      // this.last = Date.now()
    }
  }

  private randomKey(len: any = 10) {
    let str = ''
    const arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l',
      'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
      'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' ]

    for (let i = 0; i < len; i++) {
      const pos = Math.round(Math.random() * (arr.length - 1))
      str += arr[pos]
    }
    return str
  }

  private startRecord() {
    if (window.navigator.mediaDevices) {
      window.navigator.mediaDevices
      // 获取浏览器麦克风权限
        .getUserMedia({ 'audio': true })
      // 用户同意赋予麦克风权限
        .then(this.initRecordMicro)
      // 用户拒绝麦克风权限，或者当前浏览器不支持
        .catch(e => {
          this.$message.error(`获取麦克风权限失败,原因：${e}`)
        })
    } else {
      this.$message.error('您当前浏览器或者浏览器版本暂不支持麦克风')
    }
  }

  private stopRecord() {
    this.ifCloseStatus = 1
    if (this.ws) {
      this.ws.close()
    }
    this.ws = null
    if (this.streamAudio && this.streamAudio.getAudioTracks()) {
      const tracks = this.streamAudio.getAudioTracks()
      for (let i = 0, len = tracks.length; i < len; i++) {
        tracks[i].stop()
      }
    }
    this.sourceAudio && this.sourceAudio.disconnect()
    this.scriptProcessor && this.scriptProcessor.disconnect()
    this.sourceAudio = null
    this.scriptProcessor = null
    this.maxVol = 0
  }

  private initRecordMicro(stream: any) {
    this.streamAudio = stream
    this.ctxAudio = new window.AudioContext()
    this.sourceAudio = this.ctxAudio.createMediaStreamSource(this.streamAudio)
    // 通过 AudioContext 获取麦克风中音频音量
    // 256, 512, 1024, 2048, 4096, 8192, 16384
    this.scriptProcessor = this.ctxAudio.createScriptProcessor(4096, 1, 1)
    this.sourceAudio.connect(this.scriptProcessor)
    this.scriptProcessor.connect(this.ctxAudio.destination)
    this.scriptProcessor.onaudioprocess = (audioProcessingEvent: any) => {
      // buffer处理
      const buffer = audioProcessingEvent.inputBuffer.getChannelData(0)

      let sum = 0
      let outputData: any = []
      for (let i = 0; i < buffer.length; i++) {
        sum += buffer[i] * buffer[i]
      }

      this.maxVol = Math.round(Math.sqrt(sum / buffer.length) * 100)

      // 浏览器麦克风采样率为 this.ctxAudio.sampleRate 一般是44100
      const inputSampleRate = this.ctxAudio.sampleRate
      // 流需要输出的是8000采样率的，所以需要压缩一次
      outputData = this.compress(buffer, inputSampleRate, 8000)

      this.ws.send(outputData)
    }
  }

  private floatTo16BitPCM(bytes: any) {
    let offset = 0
    const dataLen = bytes.length
    // 默认采样率以16计算，而不是8位
    const buffer = new ArrayBuffer(dataLen * 2)
    const data = new DataView(buffer)

    for (let i = 0; i < bytes.length; i++, offset += 2) {
      // 保证采样帧的值在-1到1之间
      let s = Math.max(-1, Math.min(1, bytes[i]))
      // 将32位浮点映射为16位整形 值
      // 16位的划分的是 2^16=65536，范围是-32768到32767
      //  获取到的数据范围是[-1,1]之间，所以要转成16位的话，需要负数*32768，正数*32767，就可以得到[-32768，32767]范围内的数据
      // 第三个参数，true 含义是  是否是小端字节序 这里设置为true
      data.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
    }
    return data
  }

  private compress(data: any, inputSampleRate: number, outputSampleRate: number) {
    const rate = inputSampleRate / outputSampleRate
    const compression = Math.max(rate, 1)
    const length = Math.floor(data.length / rate)
    const result = new Float32Array(length)
    let index = 0
    let j = 0
    // 循环间隔 compression 位取一位数据
    while (index < length) {
      // 取整是因为存在比例compression不是整数的情况
      let temp = Math.floor(j)
      result[index] = data[temp]
      index++
      j += compression
    }
    // 将压缩过的数据转成pcm格式数据
    return this.floatTo16BitPCM(result)
  }

  private onRetry(aruments) {
    this.$emit('onRetry', aruments)
  }
}
</script>

<style lang="scss">
.intercom-box {
  .intercom-player {
    min-width: 700px;
    min-height: 390px;

    video {
      width: 100% !important;
      position: static; // 清空device/preview 中使用liveview组件的副作用
    }

    .controls {
      display: none;
    }

    .video-ref {
      width: 100% !important;
      height: 100% !important;
      position: static !important;
    }

    .video-wrap {
      position: static; // 清空device/preview 中使用liveview组件的副作用
    }
    // 清空h265 中使用canvas播放H265 行内样式的副作用 -start-
    .player-box {
      width: 100% !important;
      height: 100% !important;
      position: static !important;
    }

    canvas {
      width: 100% !important;
      position: static !important;
    }
    // 清空h265 中使用canvas播放H265 行内样式的副作用 -end-
  }
}

</style>
<style lang="scss" scoped>
.intercom-box {
  ::v-deep .el-dialog__body {
    height: 70%;
  }
}

.intercom-player {
  width: 70%;
  height: 70%;
  background-color: #000;
}

.intercom-content {
  display: flex;

  .intercom-micro {
    flex: 1;
    position: relative;
  }

  .interco-micro-about {
    width: 100px;
    display: flex;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .intercom-micro-btn {
    display: inline-block;
    cursor: pointer;
    width: 70px;
    height: 70px;
    text-align: center;
    color: #d3d3d3;

    &:active {
      color: #2777b2;
    }
  }

  .intercom-micro-vol {
    width: 10px;
    height: 260px;
    margin: 10px 20px 0 0;
    background-color: #d3d3d3;
    border-radius: 5px;
    position: relative;
  }

  .intercom-micro-vol-ctx {
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    background-color: #000;
  }
}

</style>
