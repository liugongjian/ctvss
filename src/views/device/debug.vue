<!-- 分屏预览 -->
<template>
  <div class="player">
    <div class="player__controls">
      <el-form label-position="top">
        <el-form-item label="视频格式">
          <el-select v-model="form.type">
            <el-option value="flv" label="FLV" />
            <el-option value="hls" label="HLS" />
            <el-option value="rtc" label="Webrtc" />
          </el-select>
        </el-form-item>
        <el-form-item label="编码格式">
          <el-select v-model="form.codec">
            <el-option value="h264" label="H264" />
            <el-option value="h265" label="H265" />
          </el-select>
        </el-form-item>
        <el-form-item label="流类型">
          <el-select v-model="form.isLive">
            <el-option :value="true" label="直播流" />
            <el-option :value="false" label="点播流" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否使用ws">
          <el-select v-model="form.isWs">
            <el-option :value="true" label="使用ws" />
            <el-option :value="false" label="使用http" />
          </el-select>
        </el-form-item>
        <el-form-item label="视频地址">
          <el-input v-model="form.url" />
        </el-form-item>
        <el-button type="primary" @click="generate">生成</el-button>
      </el-form>
    </div>
    <div class="player__body">
      <player
        v-if="url"
        ref="player"
        :url="url"
        :type="type"
        :codec="codec"
        :auto-play="true"
        :has-control="false"
        :is-live="isLive"
        :is-ws="isWs"
        :all-address="allAddress"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Player from './components/Player.vue'

@Component({
  name: 'Debug',
  components: {
    Player
  }
})
export default class extends Vue {
  private form: any = {}
  private codec = ''
  private type = ''
  private url = ''
  private isLive = false
  private isWs = false
  private allAddress = {}

  private generate() {
    this.url = ''

    this.$nextTick(() => {
      this.codec = this.form.codec
      this.type = this.form.type
      this.url = this.form.url
      this.isLive = this.form.isLive
      this.isWs = this.form.isWs
      this.allAddress['comefrom'] = 'bugger'
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

    ::v-deep .player-box {
      height: 300px !important;
      div{
        display: none !important;
      }
    }
  }
}
</style>
