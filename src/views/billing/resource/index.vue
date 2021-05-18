<template>
  <div class="app-container">
    <el-tabs v-model="activeName" type="border-card" @tab-click="onTabClick">
      <el-tab-pane name="video">
        <span slot="label">视频包<span v-if="resourceCount.video">({{ resourceCount.video }})</span></span>
        <Video />
      </el-tab-pane>
      <el-tab-pane name="bandwidth">
        <span slot="label">带宽包<span v-if="resourceCount.downloadBandwidth && resourceCount.uploadBandwidth">({{ resourceCount.downloadBandwidth + resourceCount.uploadBandwidth }})</span></span>
        <Bandwidth />
      </el-tab-pane>
      <el-tab-pane name="ai">
        <span slot="label">AI包<span v-if="resourceCount.ai">({{ resourceCount.ai }})</span></span>
        <Ai />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Video from './components/Video.vue'
import Bandwidth from './components/Bandwidth.vue'
import Ai from './components/Ai.vue'
import { getResourceCount } from '@/api/dashboard'

@Component({
  name: 'BillingResource',
  components: {
    Video,
    Bandwidth,
    Ai
  }
})
export default class extends Vue {
  private activeName = 'video'
  private resourceCount = {}

  private mounted() {
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
