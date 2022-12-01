<template>
  <div v-loading="deviceLoading" class="device-container">
    <div v-if="device" class="detail-wrap">
      <div class="detail__section detail__basic-info">
        <div class="detail__title">
          设备信息
          <div class="detail__buttons">
            <el-button v-if="!isEdit.basicInfo && checkToolsVisible(toolsEnum.EditDevice, [policyEnum.AdminDevice])" type="text" @click="isEdit.basicInfo = true">编辑</el-button>
            <el-button v-if="!isEdit.basicInfo && checkToolsVisible(toolsEnum.DeleteDevice, [policyEnum.AdminDevice])" type="text" @click="deleteDevice">删除</el-button>
          </div>
        </div>
        <basic-info v-if="!isEdit.basicInfo" :device="device" :is-ibox="isIbox" @updateDevice="updateDevice()" />
        <basic-info-edit v-else :device="device" :update-device-api="updateDeviceApi" @cancel="isEdit.basicInfo = false" @updateDevice="updateDevice()" />
      </div>
      <div class="detail__section">
        <el-tabs v-model="activeTab" type="card" class="detail__tabs">
          <el-tab-pane v-if="hasVideo" label="视频接入" :name="deviceInTypeEnum.Video">
            <video-info
              v-if="!isEdit.videoInfo"
              :is-ibox="isIbox"
              :device="device"
              @edit="isEdit.videoInfo = true"
            />
            <video-info-edit
              v-else
              :device="device"
              :is-ibox="isIbox"
              :device-form="device.Device"
              :update-device-api="updateDeviceApi"
              @cancel="isEdit.videoInfo = false"
              @updateDevice="refreshInfo"
            />
          </el-tab-pane>
          <el-tab-pane v-if="hasViid" label="视图接入" :name="deviceInTypeEnum.Viid">
            <viid-info v-if="!isEdit.viidInfo" :device="device" :update-device-api="updateDeviceApi" @edit="isEdit.viidInfo = true" />
            <viid-info-edit v-else :device="device" :device-form="device.Device" @cancel="isEdit.viidInfo = false" @updateDevice="refreshInfo" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Provide, Inject, Watch } from 'vue-property-decorator'
import BasicInfo from './BasicInfo.vue'
import BasicInfoEdit from './BasicInfoEdit.vue'
import VideoInfo from './VideoInfo.vue'
import VideoInfoEdit from './VideoInfoEdit.vue'
import ViidInfo from './ViidInfo.vue'
import ViidInfoEdit from './ViidInfoEdit.vue'
import { DeviceInTypeEnum, ToolsEnum } from '@vss/device/enums'
import detailMixin from '@vss/device/mixin/deviceMixin'
import { PolicyEnum } from '@vss/base/enums/iam'

@Component({
  name: 'DeviceInfo',
  components: {
    BasicInfo,
    BasicInfoEdit,
    VideoInfo,
    VideoInfoEdit,
    ViidInfo,
    ViidInfoEdit
  }
})
export default class extends Mixins(detailMixin) {
  @Inject('handleTools')
  private handleTools!: Function
  @Inject('checkToolsVisible')
  private checkToolsVisible!: Function

  @Prop() private updateDeviceApi: (params: any) => Promise<any>

  private deviceInTypeEnum = DeviceInTypeEnum
  private policyEnum = PolicyEnum
  private toolsEnum = ToolsEnum
  private activeTab = DeviceInTypeEnum.Video
  private isEdit = {
    basicInfo: false,
    videoInfo: false,
    viidInfo: false
  }
  // 定时刷新
  private refreshCount = {
    target: 0, // 目标总的刷新次数
    index: 0 // 当前刷新的次数
  }
  private refreshTimeout = null

  @Watch('$route.query.refreshFlag', { deep: true, immediate: true })
  private async refreshFlagChange(val) {
    if (val > 0) {
      this.refreshCount.target = val
      this.refreshCount.index = 0
      this.updateDevice()
      this.handleTools(ToolsEnum.RefreshRouterView, 0)
    }
  }

  @Watch('$route.query.deviceId')
  public async deviceIdChange() {
    await this.getDevice()
    this.setTab()
  }

  public async mounted() {
    await this.getDevice()

    // 如果设备不存在直接跳出当前目录
    if (!(this.device.device && this.device.device.deviceId)) {
      this.handleTools(ToolsEnum.GoBack, 1)
    }

    this.setTab()

    // 编辑模式打开所有编辑状态
    if (this.$route.params.isEdit) {
      this.isEdit.basicInfo = true
      this.isEdit.videoInfo = true
      this.isEdit.viidInfo = true
    }
  }

  private destroyed() {
    clearTimeout(this.refreshTimeout)
  }

  /**
   * 刷新设备
   */
  public async updateDevice() {   
    await this.getDevice(this.deviceId, true, false, this.isEdit)
    this.setTab()
    // 如果设备不存在直接跳出当前目录
    if (!(this.device.device && this.device.device.deviceId)) {
      this.handleTools(ToolsEnum.GoBack, 1)
    }
    // 进行多次刷新，保证设备相关状态的更新
    if (this.refreshCount.index < this.refreshCount.target) {
      this.refreshTimeout = setTimeout(this.updateDevice, 5000)
      this.refreshCount.index++
    }
  }

  private refreshInfo() {
    this.handleTools(ToolsEnum.RefreshRouterView, 5)
  }

  /**
   * 删除设备
   */
  private deleteDevice() {
    this.handleTools(ToolsEnum.DeleteDevice, this.device.device)
  }

  /**
   * 设置Tab
   */
  private setTab() {
    // 只有viid设备时tab默认选中viid
    if (this.hasViid && !this.hasVideo) {
      this.activeTab = DeviceInTypeEnum.Viid
    } else if (!this.hasViid && this.hasVideo) {
      this.activeTab = DeviceInTypeEnum.Video
    }
  }
}
</script>
