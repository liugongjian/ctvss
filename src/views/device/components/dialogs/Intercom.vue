<template>
  <el-dialog
    title="语音对讲"
    :visible="true"
    :close-on-click-modal="true"
    :append-to-body="true"
    :destroy-on-close="true"
    class="intercomBox"
    width="80%"
    @close="closeThis"
  >
    <div class="intercomContent">
      <template v-if="intercomInfo.isLive">
        <div class="intercomPlayer live-view">
          <player
            v-if="intercomInfo.url"
            :type="intercomInfo.type"
            :codec="intercomInfo.codec"
            :url="intercomInfo.url"
            :is-live="true"
            :is-ws="true"
            :is-fullscreen="false"
            :auto-play="true"
            :has-control="false"
            :has-playback="true"
            :default-volume="30"
            :device-name="intercomInfo.deviceName"
            :stream-num="intercomInfo.streamNum"
            :all-address="intercomInfo.allAddress"
          />
          <div v-if="!intercomInfo.url && !intercomInfo.loading" class="tip-text">{{ intercomInfo.errorMsg || '无信号' }}</div>
        </div>
      </template>
      <div class="intercomMicro">
        <div class="intercomMicroAbout">
          <div class="intercomMicroVol">
            <div ref="intercomMicroVolCtx" class="intercomMicroVolCtx" />
          </div>
          <div class="intercomMicroBtn"
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
</template>
<script lang="ts">
import { Component, Prop, Mixins, Watch } from 'vue-property-decorator'
import ScreenMixin from '../../mixin/screenMixin'
import Player from '../Player.vue'
import { getDevice } from '@/api/device'
import { startTalk, stopTalk } from '@/api/intercom'
import { Device } from '@/type/device'

@Component({
  name: 'IntercomDialog',
  components: {
    Player
  }
})

export default class extends Mixins(ScreenMixin) {
 @Prop() private intercomInfo?: any
 @Prop() private ifIntercom?:false

  private streamAudio:any
  private ctxAudio:any
  private sourceAudio:any
  private maxVol=0
  private scriptProcessor:any
  private ws:any
  private deviceInfo?:Device
  private transPriority:any
  private ifCloseStatus = 0
  private last:any
  private cannotStop:boolean
  private audioKey:string

  @Watch('maxVol')
  private getVolStyle(val:any) {
    const dom = document.querySelector('.intercomMicroVolCtx') as HTMLElement
    if (val > 0) {
      dom.style.height = `${val * 2.6 + 10}px`
    } else {
      dom.style.height = '0'
    }
  }

  private closeThis() {
    this.$emit('close')
  }

  private mounted() {
    this.getDeviceInfo()
  }

  private destroyed() {
    this.stopRecord()
  }

  private getDeviceInfo() {
    const param = {
      deviceId: this.intercomInfo.deviceId,
      inProtocol: this.intercomInfo.inProtocol
    }
    getDevice(param).then((res) => {
      this.deviceInfo = res
      // 默认用UDP ，流侧只处理了UDP，暂未处理TCP
      this.ifCloseStatus = 0
      this.transPriority = res.transPriority
    })
  }

  private intercomMouseleave() {
    if (this.ws || this.sourceAudio) {
      this.intercomMouseup()
    }
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
      startTalk(param).then((res:any) => {
        if (this.ws) {
          this.stopRecord()
        }
        this.cannotStop = false
        const { streamServerAddr } = res
        const ifwss = window.location.protocol === 'https:' ? 'wss' : 'ws'
        const wsUrl = `${ifwss}://${streamServerAddr}/talk/${this.intercomInfo.deviceId}`
        try {
          this.ws = new WebSocket(wsUrl)
          this.ws.onopen = (e:any) => {
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
          this.ws.onmessage = (e:any) => {
            const { data } = e
            console.log('message-data=======>', data)
            if (data === 'streamserver error') {
              this.intercomMouseup()
            }
          }
        } catch (e) {
          console.log(`连接错误：${e}`)
        }
      }).catch((err:any) => {
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
        }).catch((err:any) => {
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

  private randomKey(len:any = 10) {
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

  private initRecordMicro(stream:any) {
    this.streamAudio = stream
    this.ctxAudio = new window.AudioContext()
    this.sourceAudio = this.ctxAudio.createMediaStreamSource(this.streamAudio)
    // 通过 AudioContext 获取麦克风中音频音量
    // 256, 512, 1024, 2048, 4096, 8192, 16384
    this.scriptProcessor = this.ctxAudio.createScriptProcessor(4096, 1, 1)
    this.sourceAudio.connect(this.scriptProcessor)
    this.scriptProcessor.connect(this.ctxAudio.destination)
    this.scriptProcessor.onaudioprocess = (audioProcessingEvent:any) => {
      // buffer处理
      const buffer = audioProcessingEvent.inputBuffer.getChannelData(0)

      let sum = 0
      let outputData:any = []
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

  private floatTo16BitPCM(bytes:any) {
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

  private compress(data:any, inputSampleRate:number, outputSampleRate:number) {
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
}
</script>
<style lang="scss">
.intercomBox{
  .intercomPlayer{
    video{
      width: 100% !important;
      position: static; // 清空device/preview 中使用liveview组件的副作用
    }
    .controls{
      display: none;
    }
    .video-ref{
      width: 100% !important;
      height: 100% !important;
      position: static !important;
    }
    .video-wrap{
      position: static; // 清空device/preview 中使用liveview组件的副作用
    }
    // 清空h265 中使用canvas播放H265 行内样式的副作用 -start-
    .player-box{
      width: 100% !important;
      height: 100% !important;
      position: static !important;
    }
    canvas{
      width: 100% !important;
      position: static !important;
    }
    // 清空h265 中使用canvas播放H265 行内样式的副作用 -end-
  }
}

</style>
<style lang="scss" scoped>
.intercomBox{
  ::v-deep .el-dialog__body{
    height: 70%;
  }
}
.intercomPlayer{
  width: 70%;
  height: 70%;
  background-color: #000;
}
.intercomContent{
  display: flex;
  .intercomMicro{
    flex: 1;
    position: relative;
  }
  .intercomMicroAbout{
    width: 100px;
    display: flex;
    position:absolute;
    top:50%;
    left:50%;
    transform:translate(-50%,-50%)
  }
  .intercomMicroBtn{
    display: inline-block;
    cursor: pointer;
    width: 70px;
    height: 70px;
    text-align: center;
    color: #d3d3d3;
    &:active{
      color: #2777B2;
    }
  }
  .intercomMicroVol{
    width: 10px;
    height: 260px;
    margin: 10px 20px 0 0;
    background-color: #d3d3d3;
    border-radius: 5px;
    position: relative;
  }
  .intercomMicroVolCtx{
    width: 100%;
    position: absolute;
    bottom: 0;
    left:0;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    background-color: #000;
  }
}

</style>
