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
        :device-id="deviceId"
        :in-protocol="inProtocol"
        :device-name="info.deviceName"
        :streams="info.deviceStreams"
        :stream-size="info.multiStreamSize"
      />
      <detail-replay
        v-if="info && type === 'record'"
        :device-id="deviceId"
        :in-protocol="inProtocol"
        :device-name="info.deviceName"
        :date-time-range="{startTime: record.startTime, endTime: record.endTime}"
      />
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import DetailPreview from '@/views/device/components/DetailPreview.vue'
import DetailReplay from '@/views/device/components/DetailReplay.vue'
import { getDevice } from '@/api/device'

@Component({
  name: 'VideoDialog',
  components: {
    DetailPreview,
    DetailReplay
  }
})
export default class extends Vue {
  @Prop({ default: () => {} })
  private record!: Object
  @Prop({ default: '' })
  private type!: String

  private hasClose = true

  private isSingle = false

  private loading = false
  private bindData = []
  private filtersArray = [{ text: '组', value: 'group' }, { text: '设备', value: 'device' }]

  private deviceId = '29941976883272184'

  private inProtocol = 'rtsp'

  private info = null

  public async mounted() {
    this.info = await getDevice({
      deviceId: this.deviceId,
      inProtocol: this.inProtocol
    })
  }

  private closeDialog() {
    this.$emit('on-close')
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
