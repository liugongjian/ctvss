<template>
  <el-dialog
    title="语音对讲"
    :visible="ifIntercom"
    :close-on-click-modal="false"
    class="intercomBox"
    width="80%"
    @close="closeThis"
  >
    <div class="intercomContent">
      <template v-if="screen.isLive">
        <div class="intercomPlayer live-view">
          <player
            v-if="screen.url"
            type="flv"
            :codec="screen.codec"
            :url="screen.url"
            :is-live="true"
            :is-ws="true"
            :is-fullscreen="false"
            :auto-play="true"
            :has-control="false"
            :has-playback="true"
            :device-name="screen.deviceName"
            :stream-num="screen.streamNum"
          />
          <div v-if="!screen.url && !screen.loading" class="tip-text">{{ screen.errorMsg || '无信号' }}</div>
        </div>
      </template>
      <div class="intercomMicro">话筒</div>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
// import { dateFormat } from '@/utils/date'
import ScreenMixin from '../../mixin/screenMixin'
import Player from '../Player.vue'

@Component({
  name: 'IntercomDialog',
  components: {
    Player
  }
})

export default class extends Mixins(ScreenMixin) {
 @Prop() private intercomInfo?: any
 @Prop() private ifIntercom?:false

  private screen = {}

  private closeThis() {
    this.$emit('onIntercom')
  }

  // intercomInfo
  private mounted() {
    // await this.init()
    this.screen = this.intercomInfo
    console.log('demo===>>', this.screen)
  }
}
</script>
<style lang="scss">
.intercomBox{
  .intercomPlayer{
    video{
      width: 100%;
    }
    .controls{
      display: none;
    }
  }
}

</style>
<style lang="scss" scoped>
.intercomBox{
  .el-dialog__body{
    height: 70%;
  }
}
.intercomPlayer{
  width: 70%;
  height: 70%;
  /* display: flex; */
  background-color: #000;

}
.intercomContent{
  display: flex;
  .intercomMicro{
    flex: 1;
  }
}

</style>
