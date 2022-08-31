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
        <basic-info v-if="!isEdit.basicInfo" :device="device" />
        <basic-info-edit v-else :device="device" @cancel="isEdit.basicInfo = false" />
      </div>
      <div class="detail__section">
        <el-tabs v-model="activeTab" type="card" class="detail__tabs">
          <el-tab-pane v-if="hasVideo" label="视频接入" :name="deviceInTypeEnum.Video">
            <video-info v-if="!isEdit.videoInfo" :device="device" @edit="isEdit.videoInfo = true" />
            <video-info-edit v-else :device="device" :device-form="device.device" @cancel="isEdit.videoInfo = false" />
          </el-tab-pane>
          <el-tab-pane v-if="hasViid" label="视图接入" :name="deviceInTypeEnum.Viid">
            <viid-info v-if="!isEdit.viidInfo" :device="device" @edit="isEdit.viidInfo = true" />
            <viid-info-edit v-else :device="device" :device-form="device.device" @cancel="isEdit.viidInfo = false" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BasicInfo from './BasicInfo.vue'
import BasicInfoEdit from './BasicInfoEdit.vue'
import VideoInfo from './VideoInfo.vue'
import VideoInfoEdit from './VideoInfoEdit.vue'
import ViidInfo from './ViidInfo.vue'
import ViidInfoEdit from './ViidInfoEdit.vue'
import { DeviceInTypeEnum } from '@vss/device/enums'
import detailMixin from '@vss/device/mixin/detailMixin'

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
  private deviceInTypeEnum = DeviceInTypeEnum
  private activeTab = DeviceInTypeEnum.Video
  private isEdit = {
    basicInfo: false,
    videoInfo: false,
    viidInfo: false
  }

  public async mounted() {
    await this.getDevice()
  }
}
</script>
