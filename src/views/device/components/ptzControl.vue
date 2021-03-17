<template>
  <div v-if="deviceId" class="container">
    <div v-show="!isClosed" class="container__ptz">
      <div class="container__ptz__title">
        <label>云台控制</label>
      </div>
      <div class="container__ptz__content">
        <div class="content-left">
          <div title="关闭" class="toggle-icon" @click="isClosed = true" />
        </div>
        <div class="content-right">
          <div class="ptz-ctrl">
            <div class="ctrl-l">
              <span class="direction" @mousedown="startPtzMove(5, speed)" @click="endPtzMove(5)">
                <i class="icon-ptz-left-up" />
              </span>
              <span class="direction" @mousedown="startPtzMove(1, speed)" @click="endPtzMove(1)">
                <i class="icon-ptz-up" />
              </span>
              <span class="direction" @mousedown="startPtzMove(7, speed)" @click="endPtzMove(7)">
                <i class="icon-ptz-right-up" />
              </span>
              <span class="direction" @mousedown="startPtzMove(3, speed)" @click="endPtzMove(3)">
                <i class="icon-ptz-left" />
              </span>
              <span class="direction" @mousedown="startPtzMove(15, speed)" @click="endPtzMove(15)">
                <i class="icon-ptz-auto" />
              </span>
              <span class="direction" @mousedown="startPtzMove(4, speed)" @click="endPtzMove(4)">
                <i class="icon-ptz-right" />
              </span>
              <span class="direction" @mousedown="startPtzMove(6, speed)" @click="endPtzMove(6)">
                <i class="icon-ptz-left-down" />
              </span>
              <span class="direction" @mousedown="startPtzMove(2, speed)" @click="endPtzMove(2)">
                <i class="icon-ptz-down" />
              </span>
              <span class="direction" @mousedown="startPtzMove(8, speed)" @click="endPtzMove(8)">
                <i class="icon-ptz-right-down" />
              </span>
            </div>
            <div class="ctrl-r">
              <span class="operation">
                <i class="icon-ptz-zoomout" title="调焦 -" @mousedown="startPtzMove(9, speed)" @click="endPtzMove(9)" />
                <i class="icon-ptz-zoomin" title="调焦 +" @mousedown="startPtzMove(10, speed)" @click="endPtzMove(10)" />
              </span>
              <span class="operation">
                <i class="icon-ptz-focusout" title="聚焦 -" @mousedown="startPtzAdjust(11, speed)" @click="endPtzAdjust(11)" />
                <i class="icon-ptz-focusin" title="聚焦 +" @mousedown="startPtzAdjust(12, speed)" @click="endPtzAdjust(12)" />
              </span>
              <span class="operation">
                <i class="icon-ptz-irisout" title="光圈 -" @mousedown="startPtzAdjust(13, speed)" @click="endPtzAdjust(13)" />
                <i class="icon-ptz-irisin" title="光圈 +" @mousedown="startPtzAdjust(14, speed)" @click="endPtzAdjust(14)" />
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
            />
          </div>
          <div v-loading="loading" class="ptz-preset">
            <template v-for="(preset, index) in presets">
              <div
                :key="index"
                :class="['preset-line', {'preset-line__select': currentIndex === index, 'preset-line__no-set': !preset.setFlag}]"
                @click="currentIndex = index"
              >
                <span class="index">{{ index + 1 }}</span>
                <div :title="preset.name" class="name">
                  <span v-if="!preset.editNameFlag" @dblclick="enterEdit(preset, index)">{{ preset.name }}</span>
                  <el-input v-else :ref="'nameinput' + index" v-model="preset.name" size="mini" @blur="closeEdit(preset, index)" />
                </div>
                <span v-if="currentIndex === index" class="handle">
                  <i v-if="preset.setFlag" title="删除" class="handle-delete" @click="deletePreset(index + 1)" />
                  <i title="设置" class="handle-edit" @click="setPreset(index + 1, preset.name)" />
                  <i v-if="preset.setFlag" title="调用" class="handle-goto" @click="gotoPreset(index + 1)" />
                </span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div v-show="isClosed" class="container__ptz--shrink">
      <div title="打开" class="toggle-icon__closed" @click="isClosed = false" />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { startDeviceMove, endDeviceMove, startDeviceAdjust, endDeviceAdjust, setDevicePreset, gotoDevicePreset, deleteDevicePreset, describeDevicePresets } from '@/api/ptz_control'
@Component({
  name: 'ptz-control'
})
export default class extends Vue {
  @Prop({ default: '' })
  private deviceId!: string
  private speed = 5
  private isClosed = true
  private loading = false
  private currentIndex = null
  private presets: Array<any> = []
  @Watch('deviceId')
  private async onDeviceIdChange(newValue: string) {
    if (newValue) {
      try {
        this.loading = true
        const res = await describeDevicePresets({ deviceId: newValue })
        this.presets = Array.from({ length: 255 }, (value, index) => {
          const found = res.presets.find((preset: any) => Number(preset.presetId) === index + 1)
          return {
            setFlag: !!found,
            name: found?.presetName || `预置位 ${index + 1}`,
            editNameFlag: false
          }
        })
        this.loading = false
      } catch (e) {
        this.loading = false
        this.$message.error(`查询预置位失败，原因：${e && e.message}`)
      }
    }
  }
  private async deletePreset(presetId: number) {
    await deleteDevicePreset({ 'deviceId': this.deviceId, presetId: String(presetId) })
    this.$set(this.presets, presetId - 1, {
      'setFlag': false,
      'name': `预置位 ${presetId}`,
      'editNameFlag': false
    })
  }
  private async setPreset(presetId: number, presetName: string) {
    await setDevicePreset({ 'deviceId': this.deviceId, presetId: String(presetId), presetName })
    this.$set(this.presets, presetId - 1, {
      'setFlag': true,
      'name': presetName,
      'editNameFlag': false
    })
  }
  private enterEdit(preset: any, index: number) {
    preset.editNameFlag = true
    this.$nextTick(() => {
      const $nameinput: any = this.$refs['nameinput' + index]
      $nameinput[0].focus()
    })
  }
  private closeEdit(preset: any, index: number) {
    if (!preset.name) {
      preset.name = `预置位 ${index + 1}`
    }
    preset.editNameFlag = false
  }
  private async gotoPreset(presetId: number) {
    await gotoDevicePreset({ 'deviceId': this.deviceId, presetId: String(presetId) })
  }
  private formatStartParam(direction: number, speed: number) {
    const param: any = {
      deviceId: this.deviceId
    }
    switch (direction) {
      case 5:
        param.pan = -speed * 17
        param.tilt = speed * 17
        break
      case 1:
        param.tilt = speed * 17
        break
      case 7:
        param.pan = speed * 17
        param.tilt = speed * 17
        break
      case 3:
        param.pan = -speed * 17
        break
      case 4:
        param.pan = speed * 17
        break
      case 6:
        param.pan = -speed * 17
        param.tilt = -speed * 17
        break
      case 2:
        param.tilt = -speed * 17
        break
      case 8:
        param.pan = speed * 17
        param.tilt = -speed * 17
        break
      case 9:
        param.zoom = -speed
        break
      case 10:
        param.zoom = speed
        break
      case 11:
        param.focus = -speed * 17
        break
      case 12:
        param.focus = speed * 17
        break
      case 13:
        param.iris = -speed * 17
        break
      case 14:
        param.iris = speed * 17
        break
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
        break
      case 1:
        param.tiltStopped = 1
        break
      case 7:
        param.panStopped = 1
        param.tiltStopped = 1
        break
      case 3:
        param.panStopped = -1
        break
      case 4:
        param.panStopped = 1
        break
      case 6:
        param.panStopped = -1
        param.tiltStopped = -1
        break
      case 2:
        param.tiltStopped = -1
        break
      case 8:
        param.panStopped = 1
        param.tiltStopped = -1
        break
      case 9:
        param.zoomStopped = -1
        break
      case 10:
        param.zoomStopped = 1
        break
      case 11:
        param.focusStopped = -1
        break
      case 12:
        param.focusStopped = 1
        break
      case 13:
        param.irisStopped = -1
        break
      case 14:
        param.irisStopped = 1
        break
    }
    return param
  }
  private async startPtzMove(direction: number, speed: number) {
    const data = this.formatStartParam(direction, speed)
    await startDeviceMove(data)
  }
  private async endPtzMove(direction: number) {
    const data = this.formatEndParam(direction)
    await endDeviceMove(data)
  }
  private async startPtzAdjust(direction: number, speed: number) {
    const data = this.formatStartParam(direction, speed)
    await startDeviceAdjust(data)
  }
  private async endPtzAdjust(direction: number) {
    const data = this.formatEndParam(direction)
    await endDeviceAdjust(data)
  }
  private formatToolTip() {
    return '云台速度 ' + this.speed
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
        margin-left: 5px;
        position: relative;
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
              i:hover {
                background-image: url("~@/assets/ptz/ptz-icons-on.png")
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
              i:hover {
                background: url("~@/assets/ptz/ptz-icons-on.png") no-repeat;
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
        .ptz-preset {
          position: absolute;
          font-size: 12px;
          top: 160px;
          left: 0;
          right: 0;
          bottom: 0;
          overflow-y: scroll;
          border: 1px solid #aaaaaa;
          .preset-line {
            height: 30px;
            line-height: 30px;
            cursor: pointer;
            padding-left: 10px;
            padding-right: 5px;
            background-color: #ffffff;
            white-space: nowrap;
            .index {
              display: inline-block;
              width: 23px;
              vertical-align: super;
              color: #000000;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .name {
              display: inline-block;
              width: 68px;
              vertical-align: super;
              color: #000000;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              ::v-deep {
                .el-input.el-input--mini input {
                  padding-left: 4px !important;
                  padding-right: 4px !important;
                }
              }
            }
            .handle {
              i {
                float: right;
                width: 30px;
                height: 30px;
                margin: 1px 0 1px 1px;
                cursor: pointer;
                background-image: url("~@/assets/ptz/ptz-icons.png");
              }
              i:hover {
                background-image: url("~@/assets/ptz/ptz-icons-on.png");
              }
              .handle-delete {
                width: 20px;
                background-position: -35px -182px;
              }
              .handle-edit {
                width: 20px;
                background-position: -35px -152px;
              }
              .handle-goto {
                width: 20px;
                background-position: -10px -152px;
              }
            }
          }
          .preset-line__select {
            background-color: #eeeeee;
          }
          .preset-line__no-set {
            .name {
              color: gray!important;
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
