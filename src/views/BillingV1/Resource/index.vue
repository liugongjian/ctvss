<template>
  <div class="app-container">
    <el-tabs v-model="activeName" type="border-card" @tab-click="onTabClick">
      <el-tab-pane name="video">
        <span slot="label">视频包<span v-if="countVideo !== undefined">({{ countVideo }})</span></span>
        <Video v-if="activeName === 'video'" />
      </el-tab-pane>
      <el-tab-pane name="ai">
        <span slot="label">AI包<span v-if="countAi !== undefined">({{ countAi }})</span></span>
        <Ai v-if="activeName === 'ai'" />
      </el-tab-pane>
      <el-tab-pane name="uploadBandwidth">
        <span slot="label">上行带宽包<span v-if="countUploadBandwidth !== undefined">({{ countUploadBandwidth }})</span></span>
        <UploadBandwidth v-if="activeName === 'uploadBandwidth'" />
      </el-tab-pane>
      <el-tab-pane name="downloadBandwidth">
        <span slot="label">下行带宽包<span v-if="countDownloadBandwidth !== undefined">({{ countDownloadBandwidth }})</span></span>
        <DownloadBandwidth v-if="activeName === 'downloadBandwidth'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Video from './components/Video.vue'
import UploadBandwidth from './components/UploadBandwidth.vue'
import DownloadBandwidth from './components/DownloadBandwidth.vue'
import Ai from './components/Ai.vue'
import { getResourceCount } from '@/api/dashboard'

@Component({
  name: 'BillingResource',
  components: {
    Video,
    UploadBandwidth,
    DownloadBandwidth,
    Ai
  }
})
export default class extends Vue {
  private activeName = ''
  private resourceCount: any = {}

  private get countVideo() {
    return this.resourceCount.video
  }

  private get countAi() {
    return this.resourceCount.ai
  }

  private get countUploadBandwidth() {
    return this.resourceCount.uploadBandwidth
  }

  private get countDownloadBandwidth() {
    return this.resourceCount.downloadBandwidth
  }

  private created() {
    this.activeName = this.$route.query.type ? this.$route.query.type.toString() : 'video'
    this.getResourceCount()
  }

  private async getResourceCount() {
    try {
      this.resourceCount = await getResourceCount(null)
    } catch (e) {
      console.log(e)
    }
  }

  private onTabClick(tab: any) {
    this.$router.push({ query: { type: tab.name } })
  }
}
</script>
<style lang="scss" scoped>
::v-deep .resource-table {
  .device-id {
    color: $primary;
  }
  .el-table__row {
    cursor: pointer;
  }
}
</style>
