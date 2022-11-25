<!-- 比例 -->
<template>
  <div class="poster-container">
    <div ref="poster" class="poster" :style="`background-image: url(${poster});`" />
  </div>
</template>
<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'Poster'
})
export default class extends ComponentMixin {
  @Prop()
  private poster

  @Prop()
  private scale

  @Watch('scale', { immediate: true })
  @Watch('poster')
  private onScaleChange() {
    this.player && this.scalePoster(this.scale)
  }

  /**
   * 切换比例
   */
  private scalePoster(scale) {
    const posterElement = this.$refs.poster as HTMLDivElement
    const width = this.player.container.clientWidth
    const height = this.player.container.clientHeight
    switch (scale) {
      case '16 / 9':
      case '4 / 3':
        {
          // 将字符串转为比例
          const ratio = this.replaceEvalByFunction(scale)
          if (width / height > ratio) {
            posterElement.style.height = '100%'
            posterElement.style.width = height / width * ratio * 100 + '%'
          } else {
            posterElement.style.width = '100%'
            posterElement.style.height = width / height * (1 / ratio) * 100 + '%'
          }
          posterElement.style.backgroundSize = '100% 100%'
        }
        break
      case 'normal':
        posterElement.style.height = '100%'
        posterElement.style.width = '100%'
        posterElement.style.backgroundSize = 'contain'
        posterElement.style.backgroundPosition = 'center'
        break
      case 'fit':
      default:
        posterElement.style.height = '100%'
        posterElement.style.width = '100%'
        posterElement.style.backgroundSize = '100% 100%'
        break
    }
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
  .poster-container {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    display: flex;
    align-items: center;

    .poster {
      background-size: 100% 100%;
    }
  }
</style>
