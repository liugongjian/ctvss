<template>
  <div class="canvasBox">
    <el-dialog
      :visible.sync="canvasIf"
      title="算法配置" width="800px"
      :destroy-on-close="true"
      :modal-append-to-body="false"
      top="7vh"
      @close="closeThis"
    >
      <div class="configureInfo">
        <div class="configureDetail">
          <span class="configureName">应用名称：</span>
          <span class="configureValue">{{ configAlgoInfo.name }}</span>
        </div>
        <div class="configureDetail">
          <span class="configureName">生效时段：</span>
          <span class="configureValue">
            {{ configAlgoInfo.effectiveTime ? `${JSON.parse(configAlgoInfo.effectiveTime)[0].start_time} ~ ${JSON.parse(configAlgoInfo.effectiveTime)[0].end_time}` : '' }}
          </span>
        </div>
        <div class="configureDetail">
          <span class="configureName">检测区域：</span>
          <span class="configureValue">
            <!--   -->
            <el-button v-if="configAlgoInfo.algorithm.code === '10032'" :disabled="cannotDraw" @click="chooseMode('line')">画直线</el-button>
            <el-button v-if="configAlgoInfo.algorithm.code !== '10032'" :disabled="cannotDraw" @click="chooseMode('rect')">画矩形</el-button>
            <el-button v-if="configAlgoInfo.algorithm.code !== '10032'" :disabled="cannotDraw" @click="chooseMode('polygon')">画多边形</el-button>
            <el-button @click="clear">清除</el-button>
          </span>
        </div>
        <div id="canvasDraw" class="canvasDraw">
          <canvas id="canvasWrapper" class="canvasConfig canvasWrapper" width="700">
            您的浏览器不支持canvas
          </canvas>
          <canvas
            id="drawLine"
            width="700px"
            height="360px"
            class="canvasConfig canvasOperator"
            @mousedown="mouseDown"
            @mousemove="mouseMove"
            @mouseup="mouseUp"
          />
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="sureThis">确 定</el-button>
        <el-button @click="closeThis">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import math from './utils/math'
import { getRectPropFromPoints,
  getVerticalLinePoints, drawArrow
} from './utils/index'
import { getAppDescribeLine, sendAppDescribeLine
// getAlgoStreamFrame
} from '@vss/device/api/ai-app'
// import plate from './plate4.jpg'
import { DRAW_MODES
//   DRAW_MODES_TEXT
} from './contants'

interface ValueObject<> {
  shape?: string
  points?: Array<number>
  origin?: boolean
}

@Component({
  name: 'AlgoConfig',
  components: {
  }
})

export default class extends Vue {
  // @Prop() private inProtocol?: string
  @Prop() private deviceId?: string
  @Prop() private canvasIf?: boolean
  @Prop() private configAlgoInfo?: any
  // @Prop() private deviceInfo?: any
  @Prop() private frameImage?: any

  private mode = ''
  private isDraw = false
  private lineWidth = 2
  private strokeStyle = '#50E3C2'
  // private areas = [{ shape: 'rect', points: [[11, 22], [33, 55]], origin: '' }]
  private areas: any[] = []
  private points: any[] = []
  private ratio = 1
  private cannotDraw = false
  private direction = false

  private mounted() {
    // this.$nextTick(() => {
    //   // 看接口，如果返回base64 就直接调用initCanvas，若不是，先调用img2Base64把图片转成base64再调用initCanvas
    //   this.img2Base64(plate)
    // })
    this.$nextTick(() => {
      this.initCanvas()
    })
  }

  // 获取已编辑过的划线
  private getHasLine() {
    const param = {
      id: this.configAlgoInfo.id,
      deviceId: this.deviceId
    }

    // 一维数组变成二维数组 后续有时间优化此函数
    const oneToTwo = (arr: any) => {
      const len = arr.length
      const n = 2
      const lineNum = len % n === 0 ? len / n : Math.floor(len / n + 1)
      const res = []
      for (let i = 0; i < lineNum; i++) {
        const temp = arr.slice(i * n, i * n + n)
        res.push(temp)
      }
      return res
    }

    getAppDescribeLine(param).then(res => {
      if (res) {
        const { algorithmMetadata } = res
        const algorithmMetadataParse = algorithmMetadata ? JSON.parse(algorithmMetadata) : {}
        const { DangerZone } = algorithmMetadataParse
        // const DangerZoneParse = JSON.parse(DangerZone)
        if (DangerZone) {
          const DangerZoneParse = oneToTwo(DangerZone)
          if (DangerZoneParse.length) {
            this.cannotDraw = true
            const shape = () => {
              if (this.configAlgoInfo.algorithm.code === '10032') {
                return 'line'
              } else {
                if (DangerZoneParse.length === 2) {
                  return 'line'
                } else if (DangerZoneParse.length === 4) {
                  return 'rect'
                } else if (DangerZoneParse.length > 4) {
                  return 'polygon'
                }
              }
            }
            const perDangerZoneParse = DangerZoneParse.map((item: any) => {
              const [x, y] = item
              return [Math.floor(x / this.ratio * this.imageWidth / 100), Math.floor(y / this.ratio * this.imageHeight / 100)]
            })

            this.areas = [
              {
                shape: shape(),
                points: perDangerZoneParse,
                ratio: 1,
                imageHeight: this.imageHeight,
                imageWidth: this.imageWidth,
                name: `area-${this.areas.length}`
              }
            ]
            this.renderBeforeAreas()
          }
        }
      }
    }).catch(e => {
      this.$message.error(e && e.message)
    })
  }

  private initCanvas() {
    // this.frameImage
    this.imgSrc = this.frameImage
    const that = this
    const img = new Image()
    img.src = `data:image/png;base64,${this.imgSrc}`
    // let img = new Image()
    // img.src = that.dataURL

    const backgroundLayer = document.querySelector('#canvasWrapper') as HTMLCanvasElement
    const backgroundCtx = backgroundLayer.getContext('2d')!

    const canvasDom = document.querySelector('#drawLine') as HTMLCanvasElement
    const canvas = canvasDom.getContext('2d')

    backgroundCtx.font = '24px bold 黑体'
    backgroundCtx.fillStyle = 'black'
    backgroundCtx.textAlign = 'center'
    backgroundCtx.textBaseline = 'middle'
    backgroundCtx.fillText('图片正在加载中', 300, 200)

    this.canvasDom = canvasDom
    this.canvas = canvas

    img.onload = () => {
      const ratio = math.divide!(img.width, backgroundLayer.width)
      that.ratio = ratio
      that.imageHeight = img.height
      that.imageWidth = img.width

      const canvasDraw = document.querySelector('#canvasDraw') as HTMLCanvasElement
      const canvasHeight = math.divide!(img.height, ratio)
      backgroundLayer.height = canvasHeight
      canvasDom.height = canvasHeight
      canvasDraw.setAttribute('style', `width:${backgroundLayer.width}px;height:${canvasHeight}px`)
      backgroundCtx.drawImage(img, 0, 0, backgroundLayer.width, backgroundLayer.height)
      // that.imageHeight = backgroundLayer.height * this.ratio
      // that.imageWidth = backgroundLayer.width * this.ratio
      that.getHasLine()
    }

    //   this.image = img
    // 右键菜单禁用
    this.canvasDom.oncontextmenu = function() {
      const w = window.event
      if (w) {
        w.returnValue = false
      }
    }
  }

  private img2Base64(img: any) {
    const imag = new Image()
    const that = this
    imag.src = img
    imag.onload = function() {
      const canvas = document.createElement('canvas') as HTMLCanvasElement
      const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!
      canvas.width = imag.width
      canvas.height = imag.height
      ctx.drawImage(imag, 0, 0, imag.width, imag.height)
      that.dataURL = canvas.toDataURL('image/png')
      that.initCanvas()
    }
  }

  private chooseMode(mode: string) {
    if (this.mode === mode) {
      this.mode = ''
      this.isDraw = false
    } else {
      this.mode = mode
      this.isDraw = false
    }
    this.points = []
  }

  private closeThis() {
    this.$parent.closeCanvasDialog()
  }

  private sureThis() {
    let pointsInfo = []
    if (this.areas && this.areas[0] && Object.keys(this.areas[0]).length > 0) {
      // 过滤 rect 矩形数据
      if (this.mode === 'rect') {
        const { points: [x, y] } = this.areas[0]
        pointsInfo = this.getRectPoints(x, y)
      } else if (this.configAlgoInfo.algorithm.code === '10032') {
        const directorP = this.areas.find((item: any) => { return item.shape === 'director' })
        const { points: [x, y] } = directorP
        if (this.direction) {
          pointsInfo = this.getLinePoints(y, x)
        } else {
          pointsInfo = this.getLinePoints(x, y)
        }
      } else {
        pointsInfo = this.areas[0].points
      }
    } else {
      pointsInfo = []
    }
    const perPoints = pointsInfo.map((item: any) => {
      const [x, y] = item
      return [Math.floor(x * this.ratio / this.imageWidth * 100), Math.floor(y * this.ratio / this.imageHeight * 100)]
    })

    const metaData = () => {
      // if (pointsInfo.length > 0) {
      //   return JSON.stringify({ DangerZone: pointsInfo.flat().map(item => Math.round(item).toString()) })
      // } else {
      //   return JSON.stringify({ DangerZone: [] })
      // }
      if (perPoints.length > 0) {
        return JSON.stringify({ DangerZone: perPoints.flat().map(item => item.toString()) })
      } else {
        return JSON.stringify({ DangerZone: [] })
      }
    }

    const param = {
      algorithmMetadata: metaData(),
      deviceId: this.deviceId,
      appId: this.configAlgoInfo.id
    }
    sendAppDescribeLine(param).then((res) => {
      if (res) {
        this.$message.success(`算法 ${this.configAlgoInfo.name} 区域划线配置成功！`)
        this.$parent.closeCanvasDialog()
      }
    }).catch(e => {
      this.$message.error(e && e.message)
    })
  }

  private clear() {
    this.points = []
    this.areas = []
    this.isDraw = false
    this.mode = ''
    this.cannotDraw = false
    this.canvas.clearRect(0, 0, this.canvasDom.width, this.canvasDom.height)
  }

  private getRectPoints(startP: Array<number>, endP: Array<number>) {
    const point2 = [endP[0], startP[1]]
    const point4 = [startP[0], endP[1]]
    return [startP, point2, endP, point4]
  }

  private getLinePoints(startP: Array<number>, endP: Array<number>) {
    const lineP = this.areas.find((item: any) => { return item.shape === 'line' })
    const { points: [x, y] } = lineP
    return [x, y, startP, endP]
  }

  private renderBeforeAreas() {
    if (this.areas?.length) {
      for (const area of this.areas) {
        this.canvas.lineWidth = this.lineWidth
        this.canvas.strokeStyle = this.strokeStyle
        const { points, origin, shape } = area
        switch (shape) {
          case DRAW_MODES.RECT: {
            this.drawPolygon(this.canvas, area, points, this.ratio)
            // this.canvas.beginPath()

            // if (points && points.length > 2) {
            //   this.drawPolygon(this.canvas, area, points, this.ratio)
            //   break
            // }
            // const {
            //   left, top, width, height
            // } = getRectPropFromPoints(points[0], points[1])
            // this.canvas.strokeRect(left, top, width, height)
            // this.canvas.closePath()
            // const rectPoints = this.getRectPoints(points[0], points[1])
            // for (const point of rectPoints) {
            //   this.drawPoint(this.canvas, point[0], point[1])
            // }
            break
          }
          case DRAW_MODES.POLYGON: {
            this.drawPolygon(this.canvas, area, points, this.ratio)
            break
          }
          case DRAW_MODES.LINE: {
            const curRatio = origin ? this.ratio : 1
            const toRatio = (x: number) => math.divide!(x, curRatio)
            const startPoint = [toRatio(points[0][0]), toRatio(points[0][1])]
            const endPoint = [toRatio(points[1][0]), toRatio(points[1][1])]
            this.canvas.beginPath()
            this.canvas.moveTo(startPoint[0], startPoint[1])
            this.canvas.lineTo(endPoint[0], endPoint[1])
            // 绘制方向
            this.canvas.stroke()
            this.canvas.closePath()
            if (this.configAlgoInfo.algorithm.code === '10032') {
              const [, , x, y] = points
              const startP = [toRatio(x[0]), toRatio(x[1])]
              const endP = [toRatio(y[0]), toRatio(y[1])]
              this.canvas.beginPath()
              this.canvas.setLineDash([3, 1])
              if (this.direction) {
                drawArrow(this.canvas, endP[0], endP[1], startP[0], endP[1], 30, 10)
              } else {
                drawArrow(this.canvas, startP[0], startP[1], endP[0], endP[1], 30, 10)
              }
              this.canvas.closePath()
            }
            break
          }
          default: break
        }
      }
    }
  }

  private getLocation(x: number, y: number) {
    const {
      x: canvasClientX, y: canvasClientY, width, height
    } = this.canvasDom?.getBoundingClientRect()
    const pointX = Number(math.subtract!(x, canvasClientX))
    const pointY = Number(math.subtract!(y, canvasClientY))
    const curPoint = [pointX, pointY]
    // 超出边界
    if (pointX > canvasClientX + width || pointX < 0) {
      return false
    }
    if (pointY > canvasClientY + height || pointY < 0) {
      return false
    }
    return curPoint
  }

  private drawPoint(canvas: CanvasRenderingContext2D, x: number, y: number) {
    canvas.beginPath()
    canvas.arc(x, y, 3, 0, 2 * Math.PI, true)
    canvas.fillStyle = 'white'
    canvas.fill()
    canvas.lineWidth = this.lineWidth
    canvas.fillStyle = 'white'
    canvas.strokeStyle = this.strokeStyle
    canvas.stroke()// 画空心圆
    // canvas.moveTo(x, y);
    canvas.closePath()
    // this.clearPointInner(canvas, x, y);
  }

  private drawPolygon(canvas: CanvasRenderingContext2D, area: ValueObject, points: Array<Array<number>>, ratio: number) {
    const curRatio = area.origin ? ratio : 1
    const toRatio = (x: number) => math.divide!(x, curRatio)
    const startPoint = [toRatio(points[0][0]), toRatio(points[0][1])]
    canvas.beginPath()
    canvas.moveTo(startPoint[0], startPoint[1])
    for (const point of points) {
      const pointXY = [toRatio(point[0]), toRatio(point[1])]
      canvas.lineTo(pointXY[0], pointXY[1])
      // this.drawPoint(canvas, pointXY[0], pointXY[1]);
    }
    canvas.lineTo(startPoint[0], startPoint[1])
    canvas.stroke()
    canvas.closePath()
    for (const point of points) {
      const pointXY = [toRatio(point[0]), toRatio(point[1])]
      this.drawPoint(canvas, pointXY[0], pointXY[1])
    }
  }

  private closePolygon() {
    const newArea = {
      shape: DRAW_MODES.POLYGON,
      points: this.points,
      ratio: this.ratio,
      imageHeight: this.imageHeight,
      imageWidth: this.imageWidth,
      name: `area-${this.areas.length}`
    }

    this.canvas.lineTo(this.points[0][0], this.points[0][1])
    this.canvas.stroke()
    this.canvas.closePath()
    this.areas.push(newArea)
    this.points = []

    //   this.renderBeforeAreas()
    //    this.$parent.onAreasChange([...areas, newArea])
  }

  private showSingleAreaMessage() {
    this.$message.warning('仅允许配置单个区域')
  }

  private mouseDown(eve: MouseEvent) {
    if (this.areas?.length > 0) {
      this.showSingleAreaMessage()
      return
    }
    const curPoint = this.getLocation(eve.clientX, eve.clientY)
    if (curPoint) {
      if (this.mode === DRAW_MODES.POLYGON) {
        if (!this.isDraw) {
          this.isDraw = true
        } else if (eve.button === 2) {
          this.points = [...this.points, curPoint]
          this.closePolygon()
        }
      } else {
        this.isDraw = true
      }
    }
  }

  private mouseMove(eve: MouseEvent) {
    if (!this.isDraw || this.areas?.length > 0) return

    const curPoint = this.getLocation(eve.clientX, eve.clientY)
    if (!curPoint) return

    if (!this.points.length) {
      this.points.push(curPoint)
    }
    switch (this.mode) {
      case DRAW_MODES.RECT: {
        const {
          left, top, width, height
        } = getRectPropFromPoints(this.points[0], curPoint)
        this.canvas.beginPath()
        this.canvas.lineWidth = this.lineWidth
        this.canvas.strokeStyle = this.strokeStyle
        // 清除绘图区域
        this.canvas.clearRect(0, 0, this.canvasDom.width, this.canvasDom.height)
        // 绘制已暂存区域
        this.renderBeforeAreas()
        // 绘制起点到当前点的矩形
        this.canvas.strokeRect(left, top, width, height)
        this.canvas.closePath()
        break
      }
      case DRAW_MODES.POLYGON: {
        this.canvas.beginPath()
        this.canvas.lineWidth = this.lineWidth
        this.canvas.strokeStyle = this.strokeStyle
        // 清除绘图区域
        this.canvas.clearRect(0, 0, this.canvasDom.width, this.canvasDom.height)
        // 绘制已暂存区域
        this.renderBeforeAreas()
        // 开始绘制当前多边形
        this.canvas.moveTo(this.points[0][0], this.points[0][1])
        // 绘制已暂存折点
        for (const point of this.points) {
          this.canvas.lineTo(point[0], point[1])
        }
        // 绘制当前点
        this.canvas.lineTo(curPoint[0], curPoint[1])
        this.canvas.stroke()
        // canvas.closePath();
        break
      }
      case DRAW_MODES.LINE: {
        this.canvas.beginPath()
        this.canvas.lineWidth = this.lineWidth
        this.canvas.strokeStyle = this.strokeStyle
        // 清除绘图区域
        this.canvas.clearRect(0, 0, this.canvasDom.width, this.canvasDom.height)
        // 绘制已暂存区域
        this.renderBeforeAreas()
        // 开始绘制当前多边形
        this.canvas.moveTo(this.points[0][0], this.points[0][1])
        this.canvas.lineTo(curPoint[0], curPoint[1])
        this.canvas.stroke()
        this.canvas.closePath()
        break
      }
      default:

        break
    }
  }

  private mouseUp(eve: MouseEvent) {
    if (!this.isDraw) return
    const curPoint = this.getLocation(eve.clientX, eve.clientY)
    if (!curPoint) return

    switch (this.mode) {
      case DRAW_MODES.RECT: {
        const newArea = {
          shape: DRAW_MODES.RECT,
          points: [this.points[0], curPoint],
          ratio: this.ratio,
          imageHeight: this.imageHeight,
          imageWidth: this.imageWidth
        }
        // 将区域暂存；清空轨迹；清除作画状态
        this.points = []
        this.isDraw = false
        //   this.$parent.onAreasChange([...areas, newArea])
        this.areas = [...this.areas, newArea]
        break
      }
      case DRAW_MODES.POLYGON: {
        // 记录轨迹
        this.points = [...this.points, curPoint]
        break
      }
      case DRAW_MODES.LINE: {
        const newArea = {
          shape: DRAW_MODES.LINE,
          points: [this.points[0], curPoint],
          ratio: this.ratio,
          imageHeight: this.imageHeight,
          imageWidth: this.imageWidth,
          name: `area-${this.areas.length}` // 父级传入 初始area信息
        }
        // TODO 绘制方向 中垂线求法
        const [startPoint, endPoint] = getVerticalLinePoints(this.points[0], curPoint, 140)
        const director = {
          shape: DRAW_MODES.DIRECTION,
          points: [startPoint, endPoint],
          ratio: this.ratio,
          imageHeight: this.imageHeight,
          imageWidth: this.imageWidth,
          name: `area-${this.areas.length + 1}`
        }

        this.canvas.beginPath()
        this.canvas.setLineDash([3, 1])
        if (this.direction) {
          drawArrow(this.canvas, endPoint[0], endPoint[1], startPoint[0], startPoint[1], 30, 10)
        } else {
          drawArrow(this.canvas, startPoint[0], startPoint[1], endPoint[0], endPoint[1], 30, 10)
        }
        this.canvas.closePath()

        // 将区域暂存；清空轨迹；清除作画状态
        this.points = []
        this.isDraw = false
        this.areas = [...this.areas, newArea, director]
        break
      }
      default:
        this.points = []
        break
    }
  }
}
</script>

<style  lang="scss" scoped>
.canvasBox {
  ::v-deep.el-dialog {
    .el-dialog__header {
      padding: 20px;
    }

    .el-dialog__body {
      padding: 0 20px 10px;
    }

    .el-dialog__footer {
      text-align: center;
      margin-top: 0;
    }
  }

  .configureDetail {
    padding: 10px 20px;
    font-size: 14px;

    .configureName {
      color: #878887;
    }
  }

  .canvasDraw {
    position: relative;
  }

  .canvasOperator {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 102;
  }
}
</style>
