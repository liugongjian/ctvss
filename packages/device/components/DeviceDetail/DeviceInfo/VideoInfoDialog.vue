<template>
  <el-dialog
    title="添加视频"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="900px"
    center
    @close="closeDialog"
  >
    <div class="create-wrap">
      <div class="create-wrap__body">
        <video-create-form ref="form" :device-form="basicInfo" :device="device" />
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" :loading="submitting" @click="submit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Device, DeviceBasic } from '@vss/device/type/Device'
import { DeviceEnum } from '@vss/device/enums'
import VideoCreateForm from '../../Form/VideoCreateForm.vue'

@Component({
  name: 'VideoInfoDialog',
  components: {
    VideoCreateForm
  }
})
export default class extends Vue {
  @Prop() private device: Device
  private dialogVisible = true
  private submitting = false

  // 设备基本信息
  private get basicInfo(): DeviceBasic {
    return this.device[DeviceEnum.Device]
  }

  private submit() {
    const form = this.$refs.form as VideoCreateForm
    if (form.validateVideoForm()) {
      console.log(form.videoForm)
      this.closeDialog(true)
    }
  }

  private closeDialog(isRefresh: boolean = false) {
    this.dialogVisible = false
    this.$emit('on-close', isRefresh)
  }
}
</script>
<style lang="scss" scoped>
.create-wrap__body {
  padding: 0;
}

.dialog-footer {
  text-align: center;
}
</style>
