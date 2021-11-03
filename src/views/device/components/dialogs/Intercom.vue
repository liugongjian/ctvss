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
      <template v-if="screen.isLive">
        <div class="intercomPlayer live-view">
          <player
            v-if="screen.url"
            type="flv"
            :codec="screen.codec"
            :url="screen.url"
            :is-live="true"
            :is-ws="true"
            :is-fullscreen="false"
            :auto-play="true"
            :has-control="false"
            :has-playback="true"
            :device-name="screen.deviceName"
            :stream-num="screen.streamNum"
          />
          <div v-if="!screen.url && !screen.loading" class="tip-text">{{ screen.errorMsg || '无信号' }}</div>
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

@Component({
  name: 'IntercomDialog',
  components: {
    Player
  }
})

export default class extends Mixins(ScreenMixin) {
 @Prop() private intercomInfo?: any
 @Prop() private ifIntercom?:false

  private screen = {}
  private streamAudio:any
  private ctxAudio:any
  private sourceAudio:any
  private analyserNode:any
  private maxVol=0
  private scriptProcessor:any

  private recBuffers:Array<any> = []
  private recLength = 0

  @Watch('maxVol')
  private getVolStyle(val:any) {
    console.log('val', val)
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
    this.screen = this.intercomInfo
  }

  private intercomMousedown() {
    this.startRecord()
  }

  private intercomMouseup() {
    this.stopRecord()
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
    const tracks = this.streamAudio.getAudioTracks()
    for (let i = 0, len = tracks.length; i < len; i++) {
      tracks[i].stop()
    }
    // this.analyserNode.disconnect()
    this.sourceAudio.disconnect()
    this.scriptProcessor.disconnect()
    // this.analyserNode = null
    this.sourceAudio = null
    this.scriptProcessor = null
    this.maxVol = 0
  }

  private writeString(view:DataView, offset:number, string:string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  // 如果处理多channel时放开，暂不需要

  // private handleChannelBuffer(inputBuffer:any) {
  //   for (let channel = 0; channel < 2; channel++) {
  //     this.recBuffers[channel].push(inputBuffer[channel])
  //   }
  //   this.recLength += inputBuffer[0].length
  // }

  // private mergeBuffers(recBuffers:any, recLength:number) {
  //   let result = new Float32Array(recLength)
  //   let offset = 0
  //   for (let i = 0; i < recBuffers.length; i++) {
  //     result.set(recBuffers[i], offset)
  //     offset += recBuffers[i].length
  //   }
  //   return result
  // }

  private initRecordMicro(stream:any) {
    this.streamAudio = stream
    this.ctxAudio = new window.AudioContext()
    this.sourceAudio = this.ctxAudio.createMediaStreamSource(this.streamAudio)
    // 通过 AudioContext 获取麦克风中音频音量
    this.scriptProcessor = this.ctxAudio.createScriptProcessor(4096, 1, 1)
    this.sourceAudio.connect(this.scriptProcessor)
    this.scriptProcessor.connect(this.ctxAudio.destination)
    this.scriptProcessor.onaudioprocess = (audioProcessingEvent:any) => {
      // buffer处理
      const buffer = audioProcessingEvent.inputBuffer.getChannelData(0)
      // let inputBuffer = []
      // for (let channel = 0; channel < 2; channel++) {
      //   inputBuffer.push(audioProcessingEvent.inputBuffer(channel))
      // }
      // this.handleChannelBuffer(inputBuffer)

      let sum = 0
      let outputData:any = []
      for (let i = 0; i < buffer.length; i++) {
        sum += buffer[i] * buffer[i]
      }

      this.maxVol = Math.round(Math.sqrt(sum / buffer.length) * 100)

      // 和流对接使用
      outputData = this.encodeBuffer(buffer)
      console.log('outputData==>', outputData)
    }
  }

  private encodeBuffer(bufferArray:[]) {
    const buffer = new ArrayBuffer(44 + bufferArray.length * 2)
    const view = new DataView(buffer)
    const dataview = this.floatTo16BitPCM(view, 44, bufferArray)
    const result = new Int16Array(dataview.buffer)
    return result
  }

  private floatTo16BitPCM(output:DataView, offset:number, input:[]) {
    for (let i = 0; i < input.length; i++, offset += 2) {
      // 保证采样帧的值在-1到1之间
      let s = Math.max(-1, Math.min(1, input[i]))
      // 将32位浮点映射为16位整形 值
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
    }
    return output
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
