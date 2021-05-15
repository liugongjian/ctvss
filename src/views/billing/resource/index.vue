<template>
  <div class="app-container">
    <el-tabs v-model="activeName" type="border-card">
      <el-tab-pane name="video">
        <span slot="label">视频包(1)</span>
        <Video />
      </el-tab-pane>
      <el-tab-pane name="bandwidth">
        <span slot="label">带宽包(1)</span>
        <Bandwidth />
      </el-tab-pane>
      <el-tab-pane name="ai">
        <span slot="label">AI包(1)</span>
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

@Component({
  name: 'FaceRecognation',
  components: {
    Video,
    Bandwidth,
    Ai
  }
})
export default class extends Vue {
  private activeName = 'video'
}
</script>
<style lang="scss" scoped>

</style>
