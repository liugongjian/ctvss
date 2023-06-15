<template>
  <el-dialog
    title="级联设备列表"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="400px"
    center
    class="dialog"
    @close="closeDialog"
  >
    <div class="device-list">
      <div
        v-for="(item, index) in deviceList"
        :key="index"
        class="device-list__item"
      >
        <span class="device-list__item-status">
          <status-badge :status="parseInt(item.status) ? 'on' : 'off'" />
        </span>
        <el-tooltip :content="item.deviceName || `设备${index}1111111111111111111111111111111111111111111111111111111111111`" placement="top" :open-delay="500">
          <span class="device-list__item-label"> {{ item.deviceName || `设备${index}1111111111111111111111111111111111111111111111111111111111111` }}</span>
        </el-tooltip>
        <!-- <span class="device-list__item-label">{{ item.deviceName || `设备${index}1111111111111111111111111111111111111111111111111111111111111` }}</span> -->
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
  display: flex;
  height: 60vh;
  overflow: auto;
  flex-direction: column;

  &__item {
    width: 100%;
    line-height: 35px;
    height: 35px;
    display: flex;

    &-label {
      font-size: 16px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
