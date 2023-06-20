<template>
  <el-dialog
    title="级联设备列表"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="500px"
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
          <status-badge :status="item.isOnline ? 'on' : 'off'" />
        </span>
        <el-tooltip :content="item.deviceName" placement="top" :open-delay="500">
          <span class="device-list__item-label"> {{ item.deviceName }}</span>
        </el-tooltip>
      </div>
    </div>
  </el-dialog>
</template>
<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator'
import { getCascadeDevicesList } from '@/api/viid'

@Component({
  name: 'DeviceListDialog'
})
export default class extends Vue {
  @Prop({ default: {} })
  private platformDetails

  private dialogVisible = true
  private loading = false
  private deviceList = []

  private mounted() {
    this.getDeviceList()
  }

  private async getDeviceList() {
    try {
      this.loading = true
      this.showDeviceList = true
      const res = await getCascadeDevicesList({
        cascadeViidId: this.platformDetails.cascadeViidId,
        regionCode: this.platformDetails.regionCode,
      })
      this.deviceList = res.data
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
::v-deep .el-dialog__body {
  padding: 25px 50px;
}

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
      margin-left: 10px;
    }
  }
}
</style>
