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
      @submit.native.prevent
    >
      <el-form-item label="" prop="resources">
        <resource
          v-model="resource"
          :device-id="deviceId"
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
  @Prop() private algoTabTypeDefault?: String
  public resource: ResourceType = null
  private dialogVisible = true
  private submitting = false
  private loading = true

  private get deviceId() {
    return this.device && this.device.device.deviceId
  }

  public async mounted() {
  }

  private submit() {
    // this.beforeSubmit(this.doSubmit)
    this.doSubmit()
  }

  private async doSubmit() {
    try {
      this.submitting = true
      const params = {
        deviceId: this.deviceId,
        resourceIds: this.resource.resourceIds,
        aIApps: this.resource.aIApps
      }
      await updateDeviceResource(params)
      this.closeDialog(true)
    } catch (e) {
      this.$alertError(e && e.message)
    } finally {
      this.submitting = false
    }
  }

  private closeDialog(isRefresh = false) {
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
