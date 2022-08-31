<template>
  <el-dialog
    title="添加视图"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="900px"
    center
    @close="closeDialog"
  >
    <div class="create-wrap">
      <div class="create-wrap__body">
        <viid-create-form ref="form" :device-form="basicInfo" :device="device" />
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
import ViidCreateForm from '../../Form/ViidCreateForm.vue'

@Component({
  name: 'ViidInfoDialog',
  components: {
    ViidCreateForm
  }
})
export default class extends Vue {
  @Prop() private device: Device
  private dialogVisible = true
  private submitting = false

  // 设备基本信息
  private get basicInfo(): DeviceBasic {
    return this.device.device
  }

  private submit() {
    const form = this.$refs.form as ViidCreateForm
    if (form.validateViidForm()) {
      console.log(form.viidForm)
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
