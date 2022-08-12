<template>
  <div class="device-container">
    <div>
      <basic-info :device="device" />
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="视频接入" :name="enums.DeviceInType.Video">
          <video-info :device="device" />
        </el-tab-pane>
        <el-tab-pane label="视图接入" :name="enums.DeviceInType.Viid">
          <viid-info :device="device" />
        </el-tab-pane>
      </el-tabs>
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
