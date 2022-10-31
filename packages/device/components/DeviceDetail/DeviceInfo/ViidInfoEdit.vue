<template>
  <div class="detail-wrap__edit">
    <viid-create-form ref="form" :device-form="basicInfo" :device="device" />
    <div class="detail-wrap__edit__footer">
      <el-button size="medium" type="primary" @click="submit">确 定</el-button>
      <el-button size="medium" @click="cancel">取 消</el-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Device, DeviceBasic } from '@vss/device/type/Device'
import { DeviceEnum } from '@vss/device/enums'
import ViidCreateForm from '../../Form/ViidCreateForm.vue'

@Component({
  name: 'ViidInfoEdit',
  components: {
    ViidCreateForm
  }
})
export default class extends Vue {
  @Prop() private device: Device

  // 设备基本信息
  private get basicInfo(): DeviceBasic {
    return this.device[DeviceEnum.Device]
  }

  private async submit() {
    const form = this.$refs.form as ViidCreateForm
    if (await form.validateVideoForm()) {
      this.$emit('cancel')
      this.$emit('updateDevice')
    }
  }

  private cancel() {
    this.$emit('cancel')
  }
}
</script>
