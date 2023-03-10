<template>
  <el-dialog
    class="binding-dialog"
    title="配置通道"
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
          :device-stream-size="deviceStreamSize"
        />
      </el-form-item>
      <el-form-item prop="channels">
        <el-table
          ref="channelTable"
          :data="channelList"
          tooltip-effect="dark"
          style="width: 100%;"
          cell-class-name="tableCell"
          @row-click="rowClick"
          @selection-change="handleSelectionChange"
          @select-all="handleSelectionChange"
        >
          <el-table-column type="selection" prop="selection" class-name="col-selection" width="55" fixed="left" />
          <el-table-column label="待配置通道" min-width="120">
            <template slot-scope="scope">
              <span class="app-name">{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="通道号" min-width="120">
            <template slot-scope="scope">{{ `D${scope.row.deviceChannelNum}` }}</template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if="pager.totalNum > pager.pageSize"
          :current-page="pager.pageNum"
          :page-size="pager.pageSize"
          :total="pager.totalNum"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" style="overflow: hidden;">
      <el-button type="primary" @click="submit">确 定</el-button>
      <el-button @click="closeDialog(false)">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { BillingEnum, BillingModeEnum, ResourceTypeEnum } from '@vss/device/enums/billing'
import BillingModeSelector from '../components/BillingModeSelector.vue'
@Component({
  name: 'PlatformVideoServiceBindingDialog',
  components: {
    BillingModeSelector
  }
})
export default class extends Vue {
  @Prop({ default: 0 })
  private deviceStreamSize: number

  @Prop({ default: () => [] })
  private selectedList: Array<any>

  @Prop({ default: 0 })
  private channelSize: number

  private resourceTypeEnum = ResourceTypeEnum
  private billingEnum = BillingEnum
  private billingModeForm = {
    [BillingEnum.BillingMode]: BillingModeEnum.Packages,
    [BillingEnum.RecordStream]: 1,
    [BillingEnum.RecordTemplateId]: '',
    [BillingEnum.RecordTemplateName]: '',
    [BillingEnum.ResourceId]: '',
    [BillingEnum.Resource]: {}
  }
  
  public selectedChannels: Array<any> = []
  private configForm = {
    resource: {},
    channels: []
  }
  private rules = {
    channels: [
      { validator: this.validateChannels }
    ]
  }
  private pager = {
    pageNum: 1,
    pageSize: 5,
    totalNum: 0
  }

  private get channelList() {
    return this.getChannelList().filter(channel => {
      return this.selectedList.findIndex(item => item.deviceChannelNum === channel.deviceChannelNum) === -1
    })
  }

  private async mounted() {
    this.getChannelList()
  }

  /**
   * 点击表行勾选当前行
   */
  private rowClick(row) {
    (this.$refs['channelTable'] as any).toggleRowSelection(row)
  }

  /**
   * 查询待配置通道列表
   */
  private getChannelList(): any[] {
    const tempList = []
    let count = 1
    while (count <= this.channelSize) {
      tempList.push({
        deviceChannelNum: count,
        name: `通道${count}`
      })
      count++
    }
    return tempList
  }

  /**
   * 表格多选框变化
   */
  private handleSelectionChange(channels) {
    this.selectedChannels = channels
  }

  /**
   * 提交
   */
  private async submit() {
    const configForm: any = this.$refs.configForm
    const configFormValid = await configForm.validateConfigForm()
    const bindingForm: any = this.$refs.bindingForm
    bindingForm.validate((valid) => {
      if (valid && configFormValid) {
        this.closeDialog(this.selectedChannels.map(channel => {
          return {
            ...channel,
            ...this.billingModeForm
          }
        }))
      }
    })
    
  }

  private closeDialog(data) {
    this.$emit('on-close', data)
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    this.getChannelList()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    this.getChannelList()
  }

  /**
   * 校验经纬度
   */
  private validateChannels(rule: any, value: string, callback: Function) {
    if (!this.selectedChannels.length) {
      callback(new Error('请选择通道'))
    } else {
      callback()
    }
  }
}
</script>
<style lang="scss" scoped>
.binding-dialog {
  .el-form {
    margin: 0;
  }

  ::v-deep .el-dialog__body {
    max-height: 65vh;
    overflow: auto;
    padding-top: 0;
    padding-bottom: 0;
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