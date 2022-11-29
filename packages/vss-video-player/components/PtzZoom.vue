<!--云台局部缩放-->
<template>
  <el-tooltip :content="showCanvasBox ? '关闭云台局部缩放' : '云台局部缩放(需设备侧支持)'" placement="top">
    <div class="control__btn control__snapshot" :class="{ 'selected': showCanvasBox }" @click.stop.prevent="changeScaleCanvas">
      <svg-icon name="screenscale" />
    </div>
  </el-tooltip>
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import { dragCanvasZoom } from '@vss/device/api/device'
import { StreamInfo, DeviceInfo } from '../types/VssPlayer'
import ComponentMixin from './mixin'
import { throttle } from 'lodash'
import ResizeObserver from 'resize-observer-polyfill'

@Component({
  name: 'PtzZoom'
})

export default class extends ComponentMixin {
  @Prop({
    default: {}
  }) private deviceInfo: DeviceInfo
  @Prop({
    default: {}
  }) private streamInfo: StreamInfo

  private showCanvasBox = false
  private oCanvas: any = null
  private oCanvasWidth = null
  private oCanvasHeight = null
  private ctxShape: any = null
  private ctxDrawState: boolean = null
  private iShape = null
  private oShape = null
  private resizeObserver = null


  public close() {
    this.showCanvasBox = false
    if (this.oCanvas) {
      this.oCanvas.style.cursor = 'auto'
      this.oCanvas.remove()
      this.removeListener()
    }
  }

  private addResizeListener() {
    this.resizeObserver = new ResizeObserver(throttle(() => {
      const width = this.player.container.clientWidth
      const height = this.player.container.clientHeight
      this.oCanvas.width = width
      this.oCanvas.height = height
    }, 300))
    this.resizeObserver.observe(this.player.container)
  }

  private changeScaleCanvas() {
    this.showCanvasBox = !this.showCanvasBox

    if (this.showCanvasBox) {
      this.$emit('dispatch', {
        eventType: 'enableZoom',
        payload: 'ptz'
      })
    }

    if (this.showCanvasBox) {
      const video = this.player.video || this.player.canvas
      const width = video.clientWidth
      const height = video.clientHeight
      this.$nextTick(() => {
        // 监听播放器容器大小变化，触发比例缩放
        const canvasEle = document.createElement('canvas')
        this.player.container.appendChild(canvasEle)
        // this.oCanvas = oDom.querySelector('canvas')
        this.oCanvas = canvasEle
        this.oCanvas.style.cursor = 'crosshair'

        this.oCanvas.width = width
        this.oCanvas.height = height

        this.oCanvas.style.width = `${width}px`
        this.oCanvas.style.height = `${height}px`

        this.oCanvasWidth = this.player.container.clientWidth
        this.oCanvasHeight = this.player.container.clientHeight

        // this.player.container.style.position = 'relative'
        this.addResizeListener()
        this.oCanvas.style.position = 'absolute'
        // this.oCanvas.style.left = `${(width - video.clientWidth) / 2}px`
        // this.oCanvas.style.top = `${(height - video.clientHeight) / 2}px`
        this.ctxShape = this.oCanvas.getContext('2d')
        this.oCanvas.addEventListener('mousedown', (e) => { this.canvasMouseDown(e) })
        this.oCanvas.addEventListener('mousemove', (e) => { this.canvasMouseMove(e) })
        this.oCanvas.addEventListener('mouseup', (e) => { this.canvasMouseUp(e) })
        this.oCanvas.addEventListener('mouseleave', (e) => { this.canvasMouseleave(e) })
        this.oCanvas.addEventListener('click', (e) => { this.canvasClickHandle(e) })
        document.addEventListener('keydown', (e) => { this.keydownEvent(e) })
      })
    } else {
      this.oCanvas.style.cursor = 'auto'
      this.removeListener()
      this.oCanvas && this.oCanvas.remove()
    }
  }

  private destroyed() {
    this.oCanvas && this.oCanvas.remove()
    document.removeEventListener('keydown', (e) => { this.keydownEvent(e) })
    if (this.resizeObserver) this.resizeObserver.disconnect()
  }

  // 解绑canvas缩放事件
  private removeListener() {
    this.oCanvas.removeEventListener('mousedown', (e) => { this.canvasMouseDown(e) })
    this.oCanvas.removeEventListener('mousemove', (e) => { this.canvasMouseMove(e) })
    this.oCanvas.removeEventListener('mouseup', (e) => { this.canvasMouseUp(e) })
    this.oCanvas.removeEventListener('mouseleave', (e) => { this.canvasMouseleave(e) })
    this.oCanvas.removeEventListener('click', (e) => { this.canvasClickHandle(e) })
  }

  // 获取canvas 点坐标
  private getCanvasMousePos(e: any) {
    const {
      x: canvasClientX, y: canvasClientY, width, height, left, top
    } = this.oCanvas?.getBoundingClientRect()

    const pointX = (e.clientX - left) * this.oCanvas.width / width
    const pointY = (e.clientY - top) * this.oCanvas.height / height
    const curPoint = [ pointX, pointY ]
    // 超出边界
    if (pointX > canvasClientX + width || pointX < 0) {
      return false
    }
    if (pointY > canvasClientY + height || pointY < 0) {
      return false
    }
    return curPoint
  }

  // 画矩形
  private drawRect() {
    if (this.oShape && Object.keys(this.oShape).length > 0) {
      this.ctxShape.clearRect(0, 0, this.oCanvasWidth, this.oCanvasHeight)// 清除画板
      this.ctxShape.strokeStyle = '#FFFFFF'
      // this.ctxShape.lineCap = 'square'
      this.ctxShape.lineWidth = 2
      this.ctxShape.beginPath()
      // this.ctxShape.rect(Math.floor(this.oShape.startX) + 0.5, this.oShape.startY, Math.floor(this.oShape.endX - this.oShape.startX) + 0.5,
      //   Math.floor(this.oShape.endY - this.oShape.startY) + 0.5)
      this.ctxShape.rect(Math.floor(this.oShape.startX), this.oShape.startY, Math.floor(this.oShape.endX - this.oShape.startX),
        Math.floor(this.oShape.endY - this.oShape.startY))
      this.ctxShape.stroke()
      this.ctxShape.closePath()
    }
  }

  private canvasClickHandle(e: MouseEvent) {
    const mousePos = this.getCanvasMousePos(e)
    if (!mousePos) return
    const [x, y] = mousePos
    if (x === this.oShape.startX && y === this.oShape.startY) {
      this.oShape = {}
      this.ctxShape.clearRect(0, 0, this.oCanvasWidth, this.oCanvasHeight)// 清除画板
      this.ctxDrawState = false
      this.removeListener()
    }
  }

  private canvasMouseDown(e: MouseEvent) {
    e.stopPropagation()
    const mousePos = this.getCanvasMousePos(e)
    if (!mousePos) return
    const [x, y] = mousePos
    if (!this.iShape || Object.keys(this.oShape).length === 0) {
      this.ctxDrawState = true
      this.oShape = {
        startX: x,
        startY: y
      }
    }
  }

  private canvasMouseMove(e: MouseEvent) {
    e.stopPropagation()
    if (this.oShape && this.ctxDrawState) {
      const mousePos = this.getCanvasMousePos(e)
      if (!mousePos) {
        this.removeListener()
        return
      }
      const [x, y] = mousePos
      // 鼠标结束的位置
      this.oShape.endX = x
      this.oShape.endY = y
      this.drawRect()
    }
  }
  private canvasMouseUp(e: MouseEvent) {
    e.stopPropagation()
    // TODO 鼠标移入黑色区域，取消画框
    const mousePos = this.getCanvasMousePos(e)
    if (!mousePos) return
    // const [x, y] = mousePos
    const { startX, startY, endX, endY } = this.oShape
    const { videoWidth = 0, videoHeight = 0 } = this.streamInfo

    if (!endX || !endY) {
      return
    }

    const tempRatioWidth = this.oCanvas.width / videoWidth
    const tempRatioHeight = this.oCanvas.height / videoHeight

    const lengthX = Math.round(Math.abs(endX - startX) / tempRatioWidth).toString()
    const lengthY = Math.round(Math.abs(endY - startY) / tempRatioHeight).toString()
    const midPointX = Math.round((endX + startX) / 2 / tempRatioWidth).toString()
    const midPointY = Math.round((endY + startY) / 2 / tempRatioHeight).toString()
    const command = endX > startX ? 'zoomIn' : 'zoomOut'

    this.oShape = {}
    this.ctxShape.clearRect(0, 0, this.oCanvasWidth, this.oCanvasHeight)// 清除画板
    // this.removeListener()
    // this.oCanvas && this.oCanvas.remove()
    // this.ctxDrawState = false

    const { deviceId } = this.deviceInfo

    const param = {
      deviceId,
      command,
      length: videoWidth.toString(), // 信令侧要求左右为length，上下为width
      width: videoHeight.toString(),
      midPointX,
      midPointY,
      lengthX,
      lengthY
    }
    if (lengthX !== '0' || lengthY !== '0') {
      dragCanvasZoom(param).then(() => {
        this.$message.success('请等待设备调整角度')
        // this.showCanvasBox = false
        // this.oCanvas.style.cursor = 'auto'
      }).catch(err => {
        this.$message.error(err)
        this.showCanvasBox = false
        this.oCanvas.style.cursor = 'auto'
      })
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private canvasMouseleave(e: MouseEvent) {
    if (this.oShape && Object.keys(this.oShape).length > 0) {
      this.oShape = {}
      this.ctxShape.clearRect(0, 0, this.oCanvasWidth, this.oCanvasHeight)// 清除画板
      this.ctxDrawState = false
    }
    this.removeListener()
  }

  private keydownEvent(e: KeyboardEvent) {
    if (e.keyCode === 27 && this.oShape && Object.keys(this.oShape).length > 0) {
      this.oShape = {}
      this.ctxShape.clearRect(0, 0, this.oCanvasWidth, this.oCanvasHeight)// 清除画板
      this.ctxDrawState = false
    }
    this.removeListener()
  }
}
</script>
