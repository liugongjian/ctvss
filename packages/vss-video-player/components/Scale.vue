<!-- 比例 -->
<template>
  <el-popover
    placement="top"
    trigger="hover"
    popper-class="player__popover"
    @after-enter="enterPopover"
    @after-leave="leavePopover"
  >
    <ul class="player__popover__panel">
      <li
        v-for="item in scaleKind"
        :key="item.kind"
        :class="{ 'selected': scale === item.kind }"
        @click.stop.prevent="scaleVideo(item.kind)"
      >
        {{ item.label }}
      </li>
    </ul>
    <div slot="reference" class="control__btn control__scale">
      <svg-icon name="screenratio" />
    </div>
  </el-popover>
</template>
<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator'
import { UserModule } from '@/store/modules/user'
import { ScaleKind } from '../dics/index'
import ComponentMixin from './mixin'
import { throttle } from 'lodash'
import ResizeObserver from 'resize-observer-polyfill'

@Component({
  name: 'Scale'
})
export default class extends ComponentMixin {
  @Prop()
  private url

  @Prop()
  private defaultScale

  private scale: string = null

  private scaleKind = ScaleKind

  private resizeObserver: ResizeObserver

  private get globalScale() {
    if (!UserModule.settings) {
      return null
    }
    const num = UserModule.settings.screenCache.videoScale
    const scale = this.scaleKind.find(_scale => {
      return _scale.num === num
    })
    return scale && scale.kind
  }

  private mounted() {
    // 监听播放器容器大小变化，触发比例缩放
    this.resizeObserver = new ResizeObserver(throttle(() => {
      this.scaleVideo(this.scale)
    }, 300))
    this.resizeObserver.observe(this.player.container.parentElement)
  }

  private beforeDestroy() {
    if (this.resizeObserver) this.resizeObserver.disconnect()
  }

  @Watch('url')
  private onUrlChange() {
    this.scaleVideo(this.scale)
  }

  /**
   * 获取全局系统配置中的缩放比例
   */
  @Watch('globalScale', {
    immediate: true
  })
  private onGlobalScaleChange(globalScale) {
    this.scale = this.defaultScale || globalScale || 'fit'
    this.scaleVideo(this.scale)
  }

  /**
   * 切换比例
   */
  private scaleVideo(scale) {
    this.scale = scale
    this.player.scale = scale
    // h264使用video，h265使用canvas
    const video = this.player.video || this.player.canvas
    const width = this.player.container.clientWidth
    const height = this.player.container.clientHeight
    switch (scale) {
      case '16 / 9':
      case '4 / 3':
        {
          // 将字符串转为比例
          const ratio = this.replaceEvalByFunction(scale)
          if (width / height > ratio) {
            video.style.height = '100%'
            video.style.width = height / width * ratio * 100 + '%'
          } else {
            video.style.width = '100%'
            video.style.height = width / height * (1 / ratio) * 100 + '%'
          }
          video.style.objectFit = 'initial'
        }
        break
      case 'normal':
        video.style.height = '100%'
        video.style.width = '100%'
        video.style.objectFit = 'contain'
        break
      case 'fit':
      default:
        video.style.height = '100%'
        video.style.width = '100%'
        video.style.objectFit = 'fill'
        break
    }
    this.$emit('change', this.scale)
  }

  /**
   * 替代eval，计算字符串
   */
  private replaceEvalByFunction(expression: string) {
    return window.Function('"use strict";return (' + expression + ')')()
  }
}
</script>
<style lang="scss" scoped>
  .control__scale .control__popup {
    width: 78px;
    left: -26px;
    text-align: center;
  }
</style>
