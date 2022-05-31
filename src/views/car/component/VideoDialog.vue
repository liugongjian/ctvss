<template>
  <el-dialog
    :visible="true"
    :title="record.templateId"
    width="800px"
    center
    :destroy-on-close="true"
    @close="closeDialog"
  >
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
        :date-time-range="dateTimeRange"
      />
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import DetailPreview from '@/views/device/components/DetailPreview.vue'
import DetailReplay from '@/views/device/components/DetailReplay.vue'
import { getDevice } from '@/api/device'
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

  public async mounted() {
    try{
      this.info = await getDevice({
        deviceId: this.record?.DeviceId,
        inProtocol: this.record?.inProtocol
      })
      if(this.type === 'record'){
        this.dateTimeRange = {startTime: this.getTimeStampFromString(this.record.startTime), endTime: this.getTimeStampFromString(this.record.endTime)}
      }
    } catch (e) {
      this.$message.error(`设备信息失败，原因：${e && e.message}`)
    }
  }

  private closeDialog() {
    this.$emit('on-close')
  }

  private getTimeStampFromString(str){
    return getUnixTime(parse(str, 'yyyy-MM-dd HH:mm:ss', new Date()))
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-dialog__body {
  max-height: 540px;
}

::v-deep .el-dialog__footer {
  margin-top: 0 !important;
}

.el-descriptions {
  padding-left: 15%;
}

.dialog-player-wrapper {
  height: 500px;
}
</style>
