<template>
  <div class="app-container">
    <el-tabs v-model="activeName">
      <el-tab-pane label="收到的订阅" name="receive">
        <receive-subscribe />
      </el-tab-pane>
      <!-- <el-tab-pane label="发出的订阅" name="send" lazy>
        <send-subscribe />
      </el-tab-pane> -->
    </el-tabs>
  </div>
</template>

<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import ReceiveSubscribe from './ReceiveSubscribe.vue'
import SendSubscribe from './SendSubscribe.vue'

@Component({
  name: 'ga1400-subscribe',
  components: {
    ReceiveSubscribe,
    SendSubscribe
  }
})
export default class extends Vue {
  private activeName = 'receive'
}
</script>

<style lang="scss" scoped>
::v-deep .el-tabs__content {
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  height: calc(100vh - $header-height - $padding-medium * 2 - 60px);

  .el-tab-pane {
    height: 100%;
  }
}
</style>
