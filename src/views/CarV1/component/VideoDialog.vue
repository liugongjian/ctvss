<template>
  <el-dialog
    :visible="true"
    :width="info && type === 'record' ? '1200px' : '800px'"
    center
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @close="closeDialog"
  >
    <div v-if="info && type === 'record'">
      <div style="margin-bottom: 20px;margin-left: 8px;">任务历史</div>
      <div class="history">
        <div v-for="op in Operations" :key="op.Id">{{ `${getOpType(op.operate)} ` }}<span style="color: #9e9e9e;">{{ `${op.operateTime}` }}</span></div>
      </div>
    </div>
    <div class="dialog-player-wrapper">
      <detail-preview
        v-if="info && type === 'preview'"
        :device-id="record.deviceId"
        :in-protocol="record.inProtocol"
        :device-name="info.deviceName"
        :streams="info.deviceStreams"
        :stream-size="info.multiStreamSize"
      />
      <detail-replay
        v-if="info && type === 'record'"
        :device-id="record.deviceId"
        :in-protocol="record.inProtocol"
        :device-name="info.deviceName"
        :datetime-range="dateTimeRange"
        :is-car-task="true"
      />
    </div>
    <div slot="title" class="dialog-title">
      <div class="plate">{{ record.plateNumber }}</div>
      <div v-if="type === 'record'" class="time">{{ record.startTime + (record.endTime.length > 0 ? ' - ' + record.endTime : '至今') }}</div>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import DetailPreview from '@/views/device/components/DetailPreview.vue'
import DetailReplay from '@/views/device/components/DetailReplay.vue'
import { getDevice } from '@/api/device'
import { getCarTask } from '@/api/car'
import { getUnixTime, parse } from 'date-fns'

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

  private hasClose = true

  private isSingle = false

  private info = null

  private dateTimeRange = {}
  private Operations = []

  public async mounted() {
    try {
      this.info = await getDevice({
        deviceId: this.record?.deviceId,
        inProtocol: this.record?.inProtocol
      })
      if (this.type === 'record') {
        this.dateTimeRange = { startTime: this.getTimeStampFromString(this.record.startTime), endTime: this.getTimeStampFromString(this.record.endTime) || new Date(new Date()).getTime() / 1000 }
      }
      let params = {
        taskId: this.record?.id,
        deviceId: this.record?.deviceId
      }
      const res = await getCarTask(params)
      this.Operations = res?.operations
    } catch (e) {
      this.$message.error(`查询设备信息失败，原因：${e && e.message}`)
    }
  }

  private closeDialog() {
    this.$emit('on-close')
  }

  private getOpType(type) {
    switch (type) {
      case 0:
        return '开始'
      case 1:
        return '暂停'
      case 2:
        return '结束'
      case 3:
        return '继续'
    }
  }

  private getTimeStampFromString(str) {
    return getUnixTime(parse(str, 'yyyy-MM-dd HH:mm:ss', new Date()))
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
  }

  .time {
    color: #9e9e9e;
  }
}
</style>
