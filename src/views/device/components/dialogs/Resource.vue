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
        <ResourceTabs
          v-model="form.resources"
          :is-update="isUpdate"
          :in-protocol="device.inProtocol"
          :is-private-in-network="isPrivateInNetwork"
          :actions="actions"
          :vss-ai-apps="form.vssAIApps"
          :device-id="device.deviceId"
          :form-info="form"
          :algo-tab-type-default="algoTabTypeDefault"
          @on-change="onResourceChange"
          @changevssaiapps="changeVSSAIApps"
          @changeAiDisabledStatus="changeAiDisabledStatus"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="submitting" @click="submit">确 定</el-button>
      <el-button @click="closeDialog(false)">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import ResourceTabs from '../../components/ResourceTabs.vue'
import createMixin from '../../mixin/createMixin'
import { updateDeviceResources } from '@/api/billing'
import { Device } from '@/type/Device'

@Component({
  name: 'Resource',
  components: {
    ResourceTabs
  }
})
export default class extends Mixins(createMixin) {
  @Prop()
  private device!: Device
  @Prop() private algoTabTypeDefault?: String
  @Prop()
  private actions: object
  private dialogVisible = true
  public form: any = {
    resources: [],
    ...this.device,
    aIApps: []
  }

  private rules = {
    resources: [
      { required: true, validator: this.validateResources, trigger: 'blur' }
    ]
  }

  public get isUpdate() {
    return true
  }

  public async mounted() {
    try {
      this.orginalChannelSize = this.device.channelSize || 0
      this.getDeviceResources(this.device.deviceId, this.device.deviceType!, this.device.inProtocol!)
    } catch (e) {
      this.$message.error(e && e.message)
    }
  }

  private submit() {
    this.beforeSubmit(this.doSubmit)
  }

  private async doSubmit() {
    try {
      this.submitting = true
      const params = {
        deviceId: this.device.deviceId,
        deviceType: this.device.deviceType,
        inProtocol: this.device.inProtocol,
        resources: this.form.resources,
        aIApps: this.form.aIApps
      }
      await updateDeviceResources(params)
      this.closeDialog(true)
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.submitting = false
    }
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
