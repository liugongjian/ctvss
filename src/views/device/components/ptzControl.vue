<template>
  <div class="container" v-if="deviceId">
    <div class="container__ptz" v-show="!isClosed">
      <div class="container__ptz__title">
        <label>云台控制</label>
      </div>
      <div class="container__ptz__content">
        <div class="content-left">
          <div title="关闭" class="toggle-icon" @click="isClosed = true"></div>
        </div>
        <div class="content-right">
          <div class="ptz-ctrl">
            <div class="ctrl-l">
              <span class="direction" @mousedown="startPtzMove(5, speed)" @click="endPtzMove(5)">
                <i class="icon-ptz-left-up"></i>
              </span>
              <span class="direction" @mousedown="startPtzMove(1, speed)" @click="endPtzMove(1)">
                <i class="icon-ptz-up"></i>
              </span>
              <span class="direction" @mousedown="startPtzMove(7, speed)" @click="endPtzMove(7)">
                <i class="icon-ptz-right-up"></i>
              </span>
              <span class="direction" @mousedown="startPtzMove(3, speed)" @click="endPtzMove(3)">
                <i class="icon-ptz-left"></i>
              </span>
              <span class="direction" @mousedown="startPtzMove(15, speed)" @click="endPtzMove(15)">
                <i class="icon-ptz-auto"></i>
              </span>
              <span class="direction" @mousedown="startPtzMove(4, speed)" @click="endPtzMove(4)">
                <i class="icon-ptz-right"></i>
              </span>
              <span class="direction" @mousedown="startPtzMove(6, speed)" @click="endPtzMove(6)">
                <i class="icon-ptz-left-down"></i>
              </span>
              <span class="direction" @mousedown="startPtzMove(2, speed)" @click="endPtzMove(2)">
                <i class="icon-ptz-down"></i>
              </span>
              <span class="direction" @mousedown="startPtzMove(8, speed)" @click="endPtzMove(8)">
                <i class="icon-ptz-right-down"></i>
              </span>
            </div>
            <div class="ctrl-r">
              <span class="operation">
                <i class="icon-ptz-zoomout" title="调焦 -" @mousedown="startPtzMove(9, speed)" @click="endPtzMove(9)"></i>
                <i class="icon-ptz-zoomin" title="调焦 +" @mousedown="startPtzMove(10, speed)" @click="endPtzMove(10)"></i>
              </span>
              <span class="operation">
                <i class="icon-ptz-focusout" title="聚焦 -" @mousedown="startPtzAdjust(11, speed)" @click="endPtzAdjust(11)"></i>
                <i class="icon-ptz-focusin" title="聚焦 +" @mousedown="startPtzAdjust(12, speed)" @click="endPtzAdjust(12)"></i>
              </span>
              <span class="operation">
                <i class="icon-ptz-irisout" title="光圈 -" @mousedown="startPtzAdjust(13, speed)" @click="endPtzAdjust(13)"></i>
                <i class="icon-ptz-irisin" title="光圈 +" @mousedown="startPtzAdjust(14, speed)" @click="endPtzAdjust(14)"></i>
              </span>
            </div>
          </div>
          <div class="ptz-slider">
            <el-slider
              v-model="speed"
              :min="1"
              :max="15"
              :show-input="true"
              :show-input-controls="false"
              :format-tooltip="formatToolTip"
              input-size="mini"
            ></el-slider>
          </div>
        </div>
      </div>
    </div>
    <div class="container__ptz--shrink" v-show="isClosed">
      <div title="打开" class="toggle-icon__closed" @click="isClosed = false"></div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { startDeviceMove, endDeviceMove, startDeviceAdjust, endDeviceAdjust } from '@/api/ptz_control'
@Component({
  name: 'ptz-control'
})
export default class extends Vue {
  @Prop({default: ''})
  private deviceId!: string
  private speed = 1
  private isClosed = false
  private formatStartParam(direction: number, speed: number) {
    const param: any = {
      deviceId: this.deviceId
    }
    switch (direction) {
      case 5: 
        param.pan = -speed * 17
        param.tilt = speed * 17
        break;
      case 1:
        param.tilt = speed * 17
        break;
      case 7:
        param.pan = speed * 17
        param.tilt = speed * 17
        break;
      case 3:
        param.pan = -speed * 17
        break;
      case 4:
        param.pan = speed * 17
        break;
      case 6:
        param.pan = -speed * 17
        param.tilt = -speed * 17
        break;
      case 2:
        param.tilt = -speed * 17
        break;
      case 8: 
        param.pan = speed * 17
        param.tilt = -speed * 17
        break;
      case 9:
        param.zoom = -speed
        break;
      case 10:
        param.zoom = speed
        break;
      case 11:
        param.focus = -speed * 17
        break;
      case 12:
        param.focus = speed * 17
        break;
      case 13:
        param.iris = -speed * 17
        break;
      case 14:
        param.iris = speed * 17
        break;
    }
    return param
  }
  private formatEndParam(direction: number) {
    const param: any = {
      deviceId: this.deviceId
    }
    switch (direction) {
      case 5:
        param.panStopped = -1
        param.tiltStopped = 1
        break;
      case 1:
        param.tiltStopped = 1
        break;
      case 7:
        param.panStopped = 1
        param.tiltStopped = 1
        break;
      case 3:
        param.panStopped = -1
        break;
      case 4:
        param.panStopped = 1
        break;
      case 6:
        param.panStopped = -1
        param.tiltStopped = -1
        break;
      case 2:
        param.tiltStopped = -1
        break;
      case 8:
        param.panStopped = 1
        param.tiltStopped = -1
        break;
      case 9:
        param.zoomStopped = -1
        break;
      case 10:
        param.zoomStopped = 1
        break;
      case 11:
        param.focusStopped = -1
        break;
      case 12:
        param.focusStopped = 1
        break;
      case 13:
        param.irisStopped = -1
        break;
      case 14:
        param.irisStopped = 1
        break;
    }
    return param
  }
  private async startPtzMove(direction: number, speed: number) {
    const data = this.formatStartParam(direction, speed)
    const res = await startDeviceMove(data)
  }
  private async endPtzMove(direction: number) {
    const data = this.formatEndParam(direction)
    const res = await endDeviceMove(data)
  }
  private async startPtzAdjust(direction: number, speed: number) {
    const data = this.formatStartParam(direction, speed)
    const res = await startDeviceAdjust(data)
  }
  private async endPtzAdjust(direction: number) {
    const data = this.formatEndParam(direction)
    const res = await endDeviceAdjust(data)
  }
  private formatToolTip() {
    return "云台速度 " + this.speed
  }
}
</script>
<style lang="scss" scoped>
.container {
  &__ptz {
    width: 210px;
    height: 100%;
    position: relative;
    &__title {
      height: 40px;
      line-height: 40px;
      padding: 0 15px;
      border-bottom: 1px solid $borderGrey;
      background: #f8f8f8;
      transition: padding-left 0.2s;
      border-left: 1px solid #eee;
      text-align: center;
    }

    &__content {
      display: flex;
      height: calc(100% - 40px);
      .content-left {
        width: 10px;
        height: 100%;
        cursor: default;
        .toggle-icon {
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: url("~@/assets/ptz/expand.png") 0 50% no-repeat;
        }
      }
      .content-right {
        .ptz-ctrl {
          height: 120px;
          .ctrl-l {
            float: left;
            margin-top: 10px;
            width: 115px;
            .direction {
              float: left;
              width: 32px;
              height: 32px;
              margin: 0 4px 4px 0;
              cursor: pointer;
              background-image: url("~@/assets/ptz/ptz-icons.png");
              background-color: #ffffff;
              background-position: 0 -90px;
              i {
                display: inline-block;
                width: 30px;
                height: 30px;
                margin: 1px;
                background: url("~@/assets/ptz/ptz-icons.png");
              }
              i.icon-ptz-left-up {
                background-position: 0 0;
              }
              i.icon-ptz-up {
                background-position: -30px 0;
              }
              i.icon-ptz-right-up {
                background-position: -60px 0;
              }
              i.icon-ptz-left {
                background-position: 0 -30px;
              }
              i.icon-ptz-auto {
                background-position: -30px -30px;
              }
              i.icon-ptz-right {
                background-position: -60px -30px;
              }
              i.icon-ptz-left-down {
                background-position: 0px -60px;
              }
              i.icon-ptz-down {
                background-position: -30px -60px;
              }
              i.icon-ptz-right-down {
                background-position: -60px -60px;
              }
            }
          }
          .ctrl-r {
            float: left;
            margin-top: 10px;
            text-align: right;
            width: 75px;
            .operation {
              float: left;
              width: 75px;
              height: 32px;
              margin-bottom: 4px;
              cursor: pointer;
              background-image: url("~@/assets/ptz/ptz-icons.png");
              background-color: #ffffff;
              background-position: -32px -90px;
              i {
                float: left;
                width: 36px;
                height: 30px;
                margin: 1px 0 1px 1px;
                background: url("~@/assets/ptz/ptz-icons.png") no-repeat;
              }
              i.icon-ptz-zoomout {
                background-position: -90px 0;
              }
              i.icon-ptz-zoomin {
                background-position: -126px 0;
              }
              i.icon-ptz-focusout {
                background-position: -90px -30px;
              }
              i.icon-ptz-focusin {
                background-position: -126px -30px;
              }
              i.icon-ptz-irisout {
                background-position: -90px -60px;
              }
              i.icon-ptz-irisin {
                background-position: -126px -60px;
              }
            }
          }
        }
        .ptz-slider {
          ::v-deep {
            .el-slider.el-slider--with-input {
              .el-slider__input {
                width: 37px;
              }
              input {
                padding-left: 4px;
                padding-right: 4px;
              }
            }
            .el-slider__runway.show-input {
              margin-right: 52px;
            }
          }
        }
      }
    }
  }

  &__ptz--shrink {
    width: 10px;
    height: 100%;
    position: relative;
    cursor: default;
    .toggle-icon__closed {
      margin-top: 10px;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: url("~@/assets/ptz/expand.png") -10px 50% no-repeat;
    }
  }
}
</style>