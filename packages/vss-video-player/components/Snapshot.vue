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
import ComponentMixin from './mixin'
import { addLog } from '@vss/device/api/operationLog'

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
    const base64 = this.player.snapshot()

    // IE兼容下载、未加载出视频时点击截图无效
    // 修改
    if (isIE()) {
      const arr = base64.replace('image/png', 'image/octet-stream').split(',')
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
      $link.href = base64
      $link.click()
    }
    const typeName = this.isLive ? '预览' : '录像'
    addLog({
      deviceId: this.deviceInfo.deviceId.toString(),
      inProtocol: this.deviceInfo.inProtocol,
      operationName: `${typeName}截图`
    })
  }
}
</script>
