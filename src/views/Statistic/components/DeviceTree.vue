<template>
  <div
    class="statistic-box__device__tree"
    :style="{ height: `${maxHeight}px` }"
  >
    <div
      class="device-list__handle"
      :style="`left: ${dirDrag.width}px`"
      @mousedown="changeWidthStart($event)"
    />
    <div
      ref="dirList"
      class="device-list__left"
      :style="`width: ${dirDrag.width}px`"
    >
      <SimpleDeviceTree @handle-node="getDevice" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import SimpleDeviceTree from '@vss/device/components/Tree/SimpleDeviceTree.vue'

@Component({
  name: 'DeviceTree',
  components: {
    SimpleDeviceTree
  }
})
export default class extends Vue {
  @Prop() private wrap

  private maxHeight = 0

  public dirDrag = {
    isDragging: false,
    start: 0,
    offset: 0,
    orginWidth: 200,
    width: 250
  }

  private mounted() {
    this.calMaxHeight()
    window.addEventListener('resize', this.calMaxHeight)
  }

  private destroyed() {
    window.removeEventListener('resize', this.calMaxHeight)
  }

  private getDevice(node: any) {
    this.$emit('treeback', node.id)
  }

  /**
   * 计算最大高度
   */
  public calMaxHeight() {
    const wrap = this.wrap
    const size = wrap.getBoundingClientRect()
    const top = size.top
    const documentHeight = document.body.offsetHeight
    this.maxHeight = documentHeight - top - 90
  }

  /**
   * 设置左侧宽度
   */
  public changeWidthStart(e: MouseEvent) {
    const $dirList: any = this.$refs.dirList
    this.dirDrag.isDragging = true
    this.dirDrag.start = e.x
    this.dirDrag.orginWidth = $dirList.clientWidth

    window.addEventListener('mousemove', (e) => {
      if (!this.dirDrag.isDragging) return
      this.dirDrag.offset = this.dirDrag.start - e.x
      const width = this.dirDrag.orginWidth - this.dirDrag.offset
      if (width < 50) return
      this.dirDrag.width = width
    })
    window.addEventListener('mouseup', () => {
      this.dirDrag.isDragging = false
    })
  }
}
</script>

<style lang="scss" scoped>
.device-list__left {
  height: 100%;
}
::v-deep {
  .common-tree {
    height: 100%;
  }
}
</style>
