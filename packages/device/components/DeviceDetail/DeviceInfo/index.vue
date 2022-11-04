<template>
  <div v-loading="deviceLoading" class="device-container">
    <div v-if="device" class="detail-wrap">
      <div class="detail__section detail__basic-info">
        <div class="detail__title">
          设备信息
          <div class="detail__buttons">
            <el-button v-if="!isEdit.basicInfo" type="text" @click="isEdit.basicInfo = true">编辑</el-button>
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
              @updateDevice="updateDevice()"
            />
          </el-tab-pane>
          <el-tab-pane v-if="hasViid" label="视图接入" :name="deviceInTypeEnum.Viid">
            <viid-info v-if="!isEdit.viidInfo" :device="device" :update-device-api="updateDeviceApi" @edit="isEdit.viidInfo = true" />
            <viid-info-edit v-else :device="device" :device-form="device.Device" @cancel="isEdit.viidInfo = false" @updateDevice="updateDevice()" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Inject, Watch } from 'vue-property-decorator'
import BasicInfo from './BasicInfo.vue'
import BasicInfoEdit from './BasicInfoEdit.vue'
import VideoInfo from './VideoInfo.vue'
import VideoInfoEdit from './VideoInfoEdit.vue'
import ViidInfo from './ViidInfo.vue'
import ViidInfoEdit from './ViidInfoEdit.vue'
import { DeviceInTypeEnum } from '@vss/device/enums'
import detailMixin from '@vss/device/mixin/deviceMixin'
import { ToolsEnum } from '@vss/device/enums/index'

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

  @Prop() private updateDeviceApi: (params: any) => Promise<any>

  private deviceInTypeEnum = DeviceInTypeEnum
  private activeTab = DeviceInTypeEnum.Video
  private isEdit = {
    basicInfo: false,
    videoInfo: false,
    viidInfo: false
  }

  @Watch('$route.query.refreshFlag', { deep: true, immediate: true })
  private async statusChange(val) {
    if (val === 'true') {
      this.updateDevice()
      this.handleTools(ToolsEnum.RefreshRouterView, 'false')
    }
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
      this.isEdit = {
        basicInfo: true,
        videoInfo: true,
        viidInfo: true
      }
    }
  }

  /**
   * 刷新设备
   */
  public async updateDevice() {
    await this.getDevice(this.deviceId, true)
    this.setTab()
    // 如果设备不存在直接跳出当前目录
    if (!(this.device.device && this.device.device.deviceId)) {
      this.handleTools(ToolsEnum.GoBack, 1)
    }
  }

  /**
   * 设置Tab
   */
  private setTab() {
    // 只有viid设备时tab默认选中viid
    if (this.hasViid && !this.hasVideo) {
      this.activeTab = DeviceInTypeEnum.Viid
    } else {
      this.activeTab = DeviceInTypeEnum.Video
    }
  }
}
</script>
