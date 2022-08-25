<template>
  <div v-loading="deviceLoading" class="device-container">
    <div v-if="device" class="detail-wrap">
      <div class="detail__section detail__basic-info">
        <div class="detail__title">
          设备信息
          <div class="detail__buttons">
            <el-button type="text">编辑</el-button>
          </div>
        </div>
        <basic-info :device="device" />
      </div>
      <div class="detail__section">
        <el-tabs v-model="activeTab" type="card" class="detail__tabs">
          <el-tab-pane v-if="hasVideo" label="视频接入" :name="deviceInTypeEnum.Video">
            <video-info :device="device" />
          </el-tab-pane>
          <el-tab-pane v-if="hasViid" label="视图接入" :name="deviceInTypeEnum.Viid">
            <viid-info :device="device" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BasicInfo from './BasicInfo.vue'
import VideoInfo from './VideoInfo.vue'
import ViidInfo from './ViidInfo.vue'
import { DeviceInTypeEnum } from '@vss/device/enums'
import detailMixin from '@vss/device/mixin/detailMixin'

@Component({
  name: 'DeviceInfo',
  components: {
    BasicInfo,
    VideoInfo,
    ViidInfo
  }
})
export default class extends Mixins(detailMixin) {
  private deviceInTypeEnum = DeviceInTypeEnum
  private activeTab = DeviceInTypeEnum.Video

  public async mounted() {
    await this.getDevice()
  }
}
</script>
