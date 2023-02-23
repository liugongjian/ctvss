<template>
  <el-dialog
    :visible="true"
    :width="info && type === 'record' ? '1200px' : '800px'"
    center
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @close="closeDialog"
  >
    <div class="dialog-player-wrapper">
      <detail-replay
        v-if="info && type === 'record'"
        :device-id="record.deviceId"
        :in-protocol="record.inProtocol"
        :device-name="deviceName"
        :datetime-range="dateTimeRange"
        :is-car-task="true"
      />
    </div>
    <div slot="title" class="dialog-title">
      <div class="plate">{{ deviceName }}</div>
      <div class="time">{{ startTime + ' 至 ' + endTime }}</div>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import DetailPreview from '@/views/device/components/DetailPreview.vue'
import DetailReplay from '@/views/device/components/DetailReplay.vue'
import { getDevice } from '@/api/device'
import { time24Format } from '@/utils/date'

@Component({
  name: 'VideoDialog',
  components: {
    DetailPreview,
    DetailReplay
  }
})
export default class extends Vue {
  @Prop({ default: () => {} })
  private record!: any
  @Prop({ default: '' })
  private type!: String

  private info: any = null
  private dateTimeRange = {}
  private deviceName = ''

  private startTime = ''
  private endTime = ''

  public async created() {
    try {
      const res: any = await getDevice({
        deviceId: this.record?.deviceId,
        inProtocol: this.record?.inProtocol
      })
      this.deviceName = res.deviceName
      this.info = res
      if (this.type === 'record') {
        this.dateTimeRange = { startTime: this.record.startTime / 1000, endTime: this.record.endTime / 1000 }
      }
      this.startTime = time24Format(this.record.startTime)
      this.endTime = time24Format(this.record.endTime)
      // console.log('⭐⭐⭐   录像锁定的回放  🛵🦂  ', this.record, this.dateTimeRange, this.startTime, this.endTime)
    } catch (e) {
      this.$message.error(`查询设备信息失败，原因：${e && e.message}`)
    }
  }

  private closeDialog() {
    this.$emit('on-close')
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-dialog__body {
  max-height: 620px;
  display: flex;
  justify-content: space-evenly;

  .history {
    overflow-y: auto;
    overflow-x: hidden;
    width: 240px;
    height: 500px;

    & > div {
      margin-bottom: 8px;
      margin-left: 8px;
    }
  }
}

::v-deep .el-dialog__footer {
  margin-top: 0 !important;
}

.el-descriptions {
  padding-left: 15%;
}

.dialog-player-wrapper {
  height: 583px;
  width: 800px;
}

.dialog-title {
  .plate {
    line-height: 24px;
    font-size: 18px;
    color: #303133;
    margin-bottom: 10px;
  }

  .time {
    color: #9e9e9e;
  }
}
</style>
