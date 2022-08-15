<template>
  <div class="device-container">
    <div class="detail-wrap">
      <div class="detail__section detail__basic-info">
        <div class="detail__title">
          设备信息
          <div class="detail__buttons">
            <el-button type="text">编辑</el-button>
            <el-button type="text">删除</el-button>
          </div>
        </div>
        <basic-info :device="device" />
      </div>
      <div class="detail__section">
        <el-tabs v-model="activeTab" type="card" class="detail__tabs">
          <el-tab-pane label="视频接入" :name="enums.DeviceInType.Video">
            <video-info :device="device" />
          </el-tab-pane>
          <el-tab-pane label="视图接入" :name="enums.DeviceInType.Viid">
            <viid-info :device="device" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import BasicInfo from './BasicInfo.vue'
import VideoInfo from './VideoInfo.vue'
import ViidInfo from './ViidInfo.vue'
import { deviceMock } from '../../../mock/device'
import enums from '../../../enums'

@Component({
  name: 'DeviceInfo',
  components: {
    BasicInfo,
    VideoInfo,
    ViidInfo
  }
})
export default class extends Vue {
  private enums = enums
  private device = deviceMock
  private activeTab = enums.DeviceInType.Video
}
</script>
