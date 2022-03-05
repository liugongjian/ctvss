<!-- 截图 -->
<template>
  <el-tooltip content="保存截图" placement="top">
    <div class="controls__btn controls__snapshot" @click.stop.prevent="snapshot">
      <svg-icon name="snapshot" width="18px" height="18px" />
    </div>
  </el-tooltip>
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import { dateFormat } from '@/utils/date'
import { isIE } from '@/utils/browser'
import ComponentMixin from './mixin'

@Component({
  name: 'Snapshot'
})
export default class extends ComponentMixin {
  @Prop()
  private videoName: string

  /**
   * 截图保存
   */
  private snapshot() {
    if (!this.player) return
    console.log('snapshot', this.player.type)
    const name = this.videoName || 'snapshot'
    const canvas = this.getCanvas()

    // IE兼容下载、未加载出视频时点击截图无效
    // 修改
    if (isIE()) {
      let arr = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream').split(',')
      if (arr[0] === 'data:') return
      let mime = arr[0].match(/:(.*?);/)[1]
      let bstr = atob(arr[1])
      let n = bstr.length
      let u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      let pngName = `${name}_${dateFormat(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.png`
      // @ts-ignore
      window.navigator.msSaveBlob(new Blob([u8arr], { type: mime }), pngName)
    } else {
      let $link: any = document.createElement('a')
      $link.download = `${name}_${dateFormat(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.png`
      $link.href = canvas.toDataURL('image/png')
      $link.click()
    }
  }

  private getCanvas(): HTMLCanvasElement {
    let canvas: HTMLCanvasElement
    if (this.player.type === 'h265') {
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
