<template>
  <el-dialog
    title="通知统计"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="700px"
    center
    class="dialog"
    @close="closeDialog"
  >
    <div v-loading="loading" class="device-list">
      <div class="device-list__wrap">
        <div class="device-list__wrap__title">级联设备列表</div>
        <div class="device-list__wrap__list">
          <div
            v-for="(item, index) in deviceList"
            :key="index"
            class="device-list__wrap__item"
          >
            <status-badge
              :status="parseInt(item.status) ? 'on' : 'off'"
            />
            {{ item.deviceName || `设备${index}1111111111111111111111111111111111111111111111111111111111111` }}
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  name: 'DeviceListDialog'
})
export default class extends Vue {
  @Prop() private subscribeId: string

  private dialogVisible = true
  private loading = false
  private deviceList = []

  private mounted() {
    this.getDeviceList()
  }

  private getDeviceList() {
    try {
      this.loading = true
      this.showDeviceList = true
      for (let i = 0; i < 1000; i++) 
      {
        this.deviceList.push({})
      }
    } catch (e) {
      console.log(e && e.message)
    } finally {
      this.loading = false
    }
  }

  private closeDialog() {
    this.$emit('on-close')
  }
}
</script>

<style lang="scss" scoped>
.device-list {
  position: absolute;
  height: 90%;
  width: 250px;
  top: 40px;
  bottom: 40px;
  left: 680px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 2px;

  &__wrap {
    width: 100%;
    position: relative;

    &__title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 10px;
    }

    &__list {
      width: 100%;
      height: calc(100% - 30px);
      overflow: auto;
    }

    &__item {
      line-height: 25px;
      white-space: nowrap;
    }
  }
}
</style>
