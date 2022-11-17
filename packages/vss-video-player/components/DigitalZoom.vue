<!-- 电子缩放 -->
<template>
  <el-tooltip :content="isZoom ? '关闭电子缩放' : '开启电子缩放'" placement="top">
    <div class="control__btn control__zoom" :class="{ 'selected': isZoom }" @click.stop.prevent="toggleZoom">
      <svg-icon name="zoom" />
    </div>
  </el-tooltip>
</template>
<script lang="ts">
import { Component, Watch } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'DigtalZoom'
})
export default class extends ComponentMixin {
  private isZoom = false
  private isDragging = false
  private containerMoveData = {
    x: null,
    y: null
  }

  private get playerContainer(): HTMLDivElement {
    return this.player.container
  }

  private get playerWrap(): HTMLElement {
    return this.player.container.parentElement
  }

  private mounted() {
    this.bindEvent(this.playerContainer)
  }

  /**
   * Zoom开关
   */
  public toggleZoom() {
    this.isZoom = !this.isZoom
    if (this.isZoom) {
      this.$emit('dispatch', {
        eventType: 'enableZoom',
        payload: 'digital'
      })
    }
  }

  public close() {
    this.isZoom = false
  }

  private bindEvent(container: HTMLDivElement) {
    container.addEventListener('wheel', this.zoom.bind(container))
    container.addEventListener('mousedown', this.mouseDownHandle.bind(container))
    container.addEventListener('mouseup', this.mouseUpHandle.bind(container))
  }

  private removeEvent(container: HTMLDivElement) {
    container.removeEventListener('wheel', this.zoom)
    container.removeEventListener('mousedown', this.mouseDownHandle)
    container.removeEventListener('mouseup', this.mouseUpHandle)
  }

  @Watch('isZoom')
  getIsZoom(val: boolean) {
    if (!val) {
      this.setPlayerSize(this.playerContainer, '', '', '', '')
    }
  }

  /**
   *  开始拖拽
   * @param event 鼠标事件
   */
  public mouseDownHandle(event: MouseEvent) {
    if (!this.isZoom) {
      return
    }
    // const player = this.videoMoveData.player
    this.containerMoveData.x = event.pageX - this.playerContainer.offsetLeft
    this.containerMoveData.y = event.pageY - this.playerContainer.offsetTop
    // 监听鼠标移动
    window.onmousemove = this.mouseMoveHandle
    const currentTarget = event.currentTarget as HTMLElement
    currentTarget.style.cursor = 'move'
    this.isDragging = true
  }

  /**
   *  结束拖拽
   * @param event 鼠标事件
   */
  public mouseUpHandle(event: MouseEvent) {
    if (!this.isZoom) {
      return
    }
    // 取消鼠标移动监听
    window.onmousemove = null
    const currentTarget = event.currentTarget as HTMLElement
    currentTarget.style.cursor = 'auto'
    this.isDragging = false
  }

  /**
   *  拖拽
   * @param event 鼠标事件
   */
  public mouseMoveHandle(event: MouseEvent) {
    const playerWrap = this.playerWrap
    const playerContainer = this.playerContainer
    const playerWrapSize = playerWrap.getBoundingClientRect()
    const playerSize = playerContainer.getBoundingClientRect()
    const moveLeft = event.pageX - this.containerMoveData.x
    const moveTop = event.pageY - this.containerMoveData.y
    // 左右拖拽判断
    if (playerWrap.clientWidth < playerContainer.clientWidth) {
      if (moveLeft > 0) {
        if (playerWrapSize.x - playerSize.x + moveLeft <= 0) {
          playerContainer.style.left = moveLeft + 'px'
        } else {
          playerContainer.style.left = '0px'
        }
      } else {
        if (playerSize.width + moveLeft >= playerWrapSize.width) {
          playerContainer.style.left = moveLeft + 'px'
        } else {
          playerContainer.style.left = playerWrap.offsetWidth - playerContainer.offsetWidth + 'px'
        }
      }
    }
    // 上下拖拽判断
    if (playerWrap.clientHeight < playerContainer.clientHeight) {
      if (moveTop > 0) {
        if (playerWrapSize.y - playerSize.y + moveTop <= 0) {
          playerContainer.style.top = moveTop + 'px'
        } else {
          playerContainer.style.top = '0px'
        }
      } else {
        if (playerSize.height + moveTop >= playerWrapSize.height) {
          playerContainer.style.top = moveTop + 'px'
        } else {
          playerContainer.style.top = playerWrap.offsetHeight - playerContainer.offsetHeight + 'px'
        }
      }
      // 判断鼠标是否出框
      if ((event.target as Node).nodeName !== 'VIDEO' && (event.target as Node).nodeName !== 'CANVAS') {
        window.onmousemove = null
      }
    }
  }

  /**
   * 电子放大
   * @param event 滚轮事件
   */
  public zoom(event: WheelEvent) {
    if (!this.isZoom) {
      return
    }
    // 禁止滚轮触发默认事件
    event.preventDefault()

    const playerWrap = this.playerWrap
    const playerContainer = this.playerContainer
    const playerWrapSize = playerWrap.getBoundingClientRect()
    let width
    let height
    let top
    let left
    if (event.deltaY < 0) {
      width = 1.1 * playerContainer.offsetWidth
      height = 1.1 * playerContainer.offsetHeight
      left = playerContainer.offsetLeft - 0.1 * event.offsetX
      top = playerContainer.offsetTop - 0.1 * event.offsetY
    } else {
      width = 0.9 * playerContainer.offsetWidth
      height = 0.9 * playerContainer.offsetHeight
      left = playerContainer.offsetLeft + 0.1 * event.offsetX
      top = playerContainer.offsetTop + 0.1 * event.offsetY
      if (width <= playerWrapSize.width) {
        this.setPlayerSize(this.playerContainer, '', '', '', '')
        return
      }
    }
    this.setPlayerSize(playerContainer, width + 'px', height + 'px', left + 'px', top + 'px')
  }
  /**
   * 调整播放器尺寸及位置
   * @param player 播放器DOM
   * @param width 播放器宽度
   * @param height 播放器高度
   * @param left 播放器的相对左偏移
   * @param top 播放器的相对上偏移
   */
  private setPlayerSize(player: HTMLDivElement, width: string, height: string, left: string, top: string) {
    player.style.position = 'absolute'
    player.style.width = width
    player.style.height = height
    player.style.left = left
    player.style.top = top
  }
}

</script>
