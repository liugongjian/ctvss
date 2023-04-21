<template>
  <el-dialog
    class="binding-dialog"
    title="平台设备配置"
    center
    :visible="true"
    @close="closeDialog"
  >
    <el-form
      ref="bindingForm"
      :model="configForm"
      :rules="rules"
      label-width="0px"
    >
      <el-form-item prop="resource">
        <billing-mode-selector
          ref="configForm"
          v-model="billingModeForm"
          :resource-type="resourceTypeEnum.Video"
        />
      </el-form-item>
      <div class="resource-title">
        <span class="config-title">待配置设备：</span>
        <span class="config-title__after">{{ `已选中 ${selectedDevices.length} 项` }}</span>
      </div>
      <el-form-item prop="devices">
        <div class="resource-container">
          <DeviceResourceTree
            class="resource-selector"
            :checked-list="selectedList"
            @check-device="onCheckDevice"
          />
        </div>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button type="primary" @click="submit">确 定</el-button>
      <el-button @click="closeDialog(false)">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { BillingEnum, BillingModeEnum, ResourceTypeEnum } from '@vss/device/enums/billing'
import BillingModeSelector from '../components/BillingModeSelector.vue'
import DeviceResourceTree from '@vss/device/components/Tree/DeviceResourceTree.vue'
@Component({
  name: 'PlatformVideoServiceBindingDialog',
  components: {
    BillingModeSelector,
    DeviceResourceTree
  }
})
export default class extends Vue {
  @Prop({ default: () => [] })
  private selectedList: Array<any>

  private resourceTypeEnum = ResourceTypeEnum
  private billingEnum = BillingEnum
  private billingModeForm = {
    [BillingEnum.BillingMode]: '',
    [BillingEnum.RecordNum]: 1,
    [BillingEnum.TemplateId]: '',
    [BillingEnum.RecordTemplateName]: '',
    [BillingEnum.ResourceId]: '',
    [BillingEnum.Resource]: {}
  }
  
  public selectedDevices: Array<any> = []
  private configForm = {
    resource: {},
    devices: []
  }
  private rules = {
    devices: [
      { validator: this.validateDevices }
    ]
  }
  private pager = {
    pageNum: 1,
    pageSize: 5,
    totalNum: 0
  }

  // private get channelList() {
  //   return this.getChannelList().filter(channel => {
  //     return this.selectedList.findIndex(item => item.deviceChannelNum === channel.deviceChannelNum) === -1
  //   })
  // }

  /**
   * 树选择器变化
   */
  private onCheckDevice(device) {
    this.selectedDevices = device
  }

  /**
   * 提交
   */
  private async submit() {
    const configForm: any = this.$refs.configForm
    const configFormValid = await configForm.validateConfigForm() === ''
    const bindingForm: any = this.$refs.bindingForm
    bindingForm.validate((valid) => {
      if (valid && configFormValid) {
        this.closeDialog(this.selectedDevices.map(device => {
          return {
            ...device,
            ...this.billingModeForm
          }
        }))
      }
    })
    
  }

  private closeDialog(data) {
    this.$emit('on-close', data)
  }

  // private async handleSizeChange(val: number) {
  //   this.pager.pageSize = val
  //   this.getChannelList()
  // }

  // private async handleCurrentChange(val: number) {
  //   this.pager.pageNum = val
  //   this.getChannelList()
  // }

  /**
   * 校验经纬度
   */
  private validateDevices(rule: any, value: string, callback: Function) {
    const remainDeviceCount = this.billingModeForm[BillingEnum.Resource]['remainDeviceCount']
    if (!this.selectedDevices.length) {
      callback(new Error('请选择设备'))
    } else if (remainDeviceCount !== undefined && this.selectedDevices.length > remainDeviceCount) {
      callback(new Error('所选的设备数量须不大于资源包剩余数量'))
    } else {
      callback()
    }
  }
}
</script>
<style lang="scss" scoped>
.binding-dialog {
  .resource-title {
    display: flex;

    .config-title {
      color: $textGrey;

      &__after {
        color: $primary;
      }
    }
  }

  .resource-container {
    border: 1px solid #ddd;
    border-radius: 2px;
    overflow: auto;

    .resource-selector {
      height: 30vh;
    }
  }

  .el-form {
    margin: 0;

    .el-form-item {
      max-width: 100%;
    }
  }

  ::v-deep .el-dialog__body {
    max-height: 65vh;
    overflow: auto;
    padding-top: 0;
    margin-bottom: 25px;
  }

  ::v-deep .el-table__row {
    cursor: pointer;
  }

  .el-pagination {
    ::v-deep .el-select {
      max-width: 100px;
    }
  }
}
</style>