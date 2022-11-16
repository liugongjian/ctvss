<!-- 截图 -->
<template>
  <el-tooltip content="保存截图" placement="top">
    <div class="control__btn control__snapshot" @click.stop.prevent="snapshot">
      <svg-icon name="snapshot" />
    </div>
  </el-tooltip>
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import { dateFormat } from '@vss/base/utils/date'
import { isIE } from '@vss/base/utils/browser'
import { CodecEnum } from '@vss/video-player/enums'
import ComponentMixin from './mixin'

@Component({
  name: 'Snapshot'
})
export default class extends ComponentMixin {
  @Prop()
  private name: string

  /**
   * 截图保存
   */
  private snapshot() {
    if (!this.player) return
    const name = this.name || 'snapshot'
    const canvas = this.getCanvas()

    // IE兼容下载、未加载出视频时点击截图无效
    // 修改
    if (isIE()) {
      const arr = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream').split(',')
      if (arr[0] === 'data:') return
      const mime = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      const pngName = `${name}_${dateFormat(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.png`
      // @ts-ignore
      window.navigator.msSaveBlob(new Blob([u8arr], { type: mime }), pngName)
    } else {
      const $link: any = document.createElement('a')
      $link.download = `${name}_${dateFormat(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.png`
      $link.href = canvas.toDataURL('image/png')
      $link.click()
    }
  }

  private getCanvas(): HTMLCanvasElement {
    let canvas: HTMLCanvasElement
    if (this.player.codec === CodecEnum.H265) {
      /**
       * 需要修改EasyWasmPlayer.js
       * 在getContext webgl 增加 preserveDrawingBuffer: true
       */
      canvas = this.player.canvas
    } else {
      const $video = this.player.video
      if (!$video) return
      canvas = document.createElement('canvas')
      canvas.width = $video.videoWidth
      canvas.height = $video.videoHeight
      canvas!.getContext('2d').drawImage($video, 0, 0, canvas.width, canvas.height)
    }
    return canvas
  }
}
</script>
