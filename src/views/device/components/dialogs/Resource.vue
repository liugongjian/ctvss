<template>
  <el-dialog
    title="配置资源包"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="900px"
    center
    @close="closeDialog"
  >
    <el-form
      ref="dataForm"
      class="form"
      :model="form"
      :rules="rules"
      @submit.native.prevent
    >
      <el-form-item label="" prop="resources">
        <ResourceTabs v-model="form.resources" :is-update="isUpdate" @on-change="onResourceChange" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="submitting" @click="submit">确 定</el-button>
      <el-button @click="closeDialog">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import ResourceTabs from '../../components/ResourceTabs.vue'
import createMixin from '../../mixin/createMixin'
import { getDeviceResources, updateDeviceResources } from '@/api/billing'
import { Device } from '@/type/device'

@Component({
  name: 'Resource',
  components: {
    ResourceTabs
  }
})
export default class extends Mixins(createMixin) {
  @Prop()
  private device!: Device
  private dialogVisible = true
  public form: any = {
    resources: [],
    ...this.device
  }

  private rules = {
    resources: [
      { required: true, validator: this.validateResources, trigger: 'blur' }
    ]
  }

  public get isUpdate() {
    return true
  }

  private async mounted() {
    try {
      const resourcesRes = await getDeviceResources({
        deviceId: this.device.deviceId,
        deviceType: this.device.deviceType,
        inProtocol: this.device.inProtocol
      })
      this.form.resources = resourcesRes.resources
    } catch (e) {
      this.$message.error(e && e.message)
    }
  }

  private async submit() {
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        try {
          this.submitting = true
          const params = {
            deviceId: this.device.deviceId,
            deviceType: this.device.deviceType,
            inProtocol: this.device.inProtocol,
            resources: this.form.resources
          }
          await updateDeviceResources(params)
        } catch (e) {
          this.$message.error(e && e.message)
        } finally {
          this.submitting = false
        }
        this.closeDialog(true)
      }
    })
  }

  private closeDialog(isRefresh: boolean = false) {
    this.dialogVisible = false
    this.$emit('on-close', isRefresh)
  }
}
</script>
<style lang="scss" scoped>
  .form {
    margin: 0;
  }
</style>
