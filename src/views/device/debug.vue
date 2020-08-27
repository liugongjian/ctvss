<!-- 分屏预览 -->
<template>
  <div class="player">
    <div class="player__controls">
      <el-form label-position="top">
        <el-form-item label="视频格式">
          <el-select v-model="form.videoCoding">
            <el-option value="flv" label="FLV - 264" />
            <el-option value="hls" label="HLS - 264" />
            <el-option value="h265-flv" label="FLV - 265" />
            <el-option value="h265-hls" label="HLS - 265" />
          </el-select>
        </el-form-item>
        <el-form-item label="视频地址">
          <el-input v-model="form.url" />
        </el-form-item>
        <el-button type="primary" @click="generate">生成</el-button>
      </el-form>
    </div>
    <div class="player__body">
      <player v-if="url" ref="video" :type="videoCoding" :url="url" :auto-play="true" />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Mixins } from 'vue-property-decorator'
import Player from './components/Player.vue'

@Component({
  name: 'Debug',
  components: {
    Player
  }
})
export default class extends Vue {
  private form: any = {}
  private videoCoding = ''
  private url = ''

  private generate() {
    this.url = ''
    this.$nextTick(() => {
      this.videoCoding = this.form.videoCoding
      this.url = this.form.url
    })
  }
}
</script>
<style lang="scss" scoped>
.player {
  display: flex;

  &__controls {
    width: 400px;
    padding: 20px;
  }
  &__body {
    flex: 1;

    ::v-deep video {
      width: 100%;
    }
  }
}
</style>
