<template>
  <el-dialog
    title="语音对讲"
    :visible="ifIntercom"
    :close-on-click-modal="false"
    class="intercomBox"
    width="80%"
    @close="closeThis"
  >
    <div class="intercomContent">
      <template v-if="intercomInfo.isLive">
        <div class="intercomPlayer live-view">
          <player
            v-if="intercomInfo.url"
            type="flv"
            :codec="intercomInfo.codec"
            :url="intercomInfo.url"
            :is-live="true"
            :is-ws="true"
            :is-fullscreen="false"
            :auto-play="true"
            :has-control="false"
            :has-playback="true"
            :device-name="intercomInfo.deviceName"
            :stream-num="intercomInfo.streamNum"
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
               @mousedown.prevent="intercomMousedown"
               @mouseup.prevent="intercomMouseup"
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
// import { dateFormat } from '@/utils/date'
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
    this.$emit('onIntercom')
  }

  private mounted() {
    this.getDeviceInfo()
  }

  private getDeviceInfo() {
    const param = {
      deviceId: this.intercomInfo.deviceId,
      inProtocol: this.intercomInfo.inProtocol
    }
    getDevice(param).then((res) => {
      this.deviceInfo = res
      // 默认用UDP ，流侧只处理了UDP，暂未处理TCP
      this.transPriority = res.transPriority
    })
  }

  private intercomMousedown() {
    const param = {
      deviceId: this.intercomInfo.deviceId,
      transPriority: 'UDP', // 先使用UDP，等流媒体侧兼容之后再使用参数
      inProtocol: this.intercomInfo.inProtocol
    }
    startTalk(param).then((res:any) => {
      const { streamServerAddr } = res
      const wsUrl = `ws://${streamServerAddr}`
      this.ws = new WebSocket(wsUrl)
      this.ws.onopen = (e:any) => {
        console.log('连接建立', e)
        this.ws.send(this.intercomInfo.deviceId)
        this.startRecord()
      }
      this.ws.onerror = (e:any) => {
        console.log(e)
      }
    }).catch((err:any) => {
      this.$message.error(`${err},请稍后再试`)
    })
  }

  private intercomMouseup() {
    const param = {
      deviceId: this.intercomInfo.deviceId
    }
    stopTalk(param).then(() => {
      this.stopRecord()
    }).catch((err:any) => {
      this.$message.error(err)
    })
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
    if (this.streamAudio && this.streamAudio.getAudioTracks()) {
      const tracks = this.streamAudio.getAudioTracks()
      for (let i = 0, len = tracks.length; i < len; i++) {
        tracks[i].stop()
      }
      this.sourceAudio.disconnect()
      this.scriptProcessor.disconnect()
      this.sourceAudio = null
      this.scriptProcessor = null
      this.maxVol = 0
      this.ws.close()
    }
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
      width: 100%;
    }
    .controls{
      display: none;
    }
  }
}

</style>
<style lang="scss" scoped>
.intercomBox{
  .el-dialog__body{
    height: 70%;
  }
}
.intercomPlayer{
  width: 70%;
  height: 70%;
  /* display: flex; */
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
