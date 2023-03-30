<template>
  <el-dialog
    title="配置资源包"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="900px"
    center
    append-to-body
    @close="closeDialog"
  >
    <el-form
      ref="dataForm"
      class="form"
      :model="form"
      :rules="rules"
      @submit.native.prevent
    >
      <el-form-item label="" prop="resource">
        <resource
          ref="resourceForm"
          v-model="form.resource"
          :device-id="deviceId"
          :default-resource-tab-type="defaultResourceTabType"
          @loaded="loading = false"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="loading || submitting" @click="submit">确 定</el-button>
      <el-button @click="closeDialog(false)">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Resource as ResourceType } from '@vss/device/type/Resource'
import { ResourceTypeEnum } from '@vss/device/enums/resource'
import Resource from './index.vue'
import { updateDeviceResource } from '@vss/device/api/billing'
import { Device } from '@vss/device/type/Device'

@Component({
  name: 'ResourceEdit',
  components: {
    Resource
  }
})
export default class extends Vue {
  @Prop()
  private device!: Device
  @Prop() private defaultResourceTabType?: ResourceTypeEnum
  private dialogVisible = true
  private submitting = false
  private loading = true
  private form = {
    resource: null as any
  }
  private rules = {
    resource: [
      { validator: this.validateResource, trigger: 'change' }
    ],
  }

  private get deviceId() {
    return this.device.device && this.device.device.deviceId
  }

  private submit() {
    const form: any = this.$refs.dataForm
    form.validate((valid) => {
      if (valid) {
        const resourceForm = this.$refs.resourceForm as any
        resourceForm.beforeSubmit(this.doSubmit)
      }
    })
  }

  /**
   * 更新资源包
   */
  private async doSubmit() {
    try {
      this.submitting = true
      const params = {
        deviceId: this.deviceId,
        resourceIds: this.form.resource.resourceIds,
        aIApps: this.form.resource.aIApps
      }
      await updateDeviceResource(params)
      this.closeDialog(true)
    } catch (e) {
      this.$alertError(e && e.message)
    } finally {
      this.submitting = false
    }
  }

  /**
   * 关闭弹窗
   */
  private closeDialog(isRefresh = false) {
    this.dialogVisible = false
    this.$emit('on-close', isRefresh)
  }

  /**
   * 校验资源包
   */
  public validateResource(rule: any, value: string, callback: Function) {
    const resourceForm = this.$refs.resourceForm as any
    const res = resourceForm.validate()
    if (!res.result) {
      callback(new Error(res.message))
    } else {
      callback()
    }
  }
}
</script>
<style lang="scss" scoped>
  .form {
    margin: 0;
  }
</style>
