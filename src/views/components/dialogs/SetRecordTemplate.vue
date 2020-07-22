<template>
  <el-dialog
    title="设置录制模板"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    @close="closeDialog"
  >
    <el-table
      ref="multipleTable"
      v-loading="tableLoading"
      :data="list"
      fit
      highlight-current-row
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="templateName" label="模板名称" />
      <el-table-column prop="storeType" label="录制格式">
        <template slot-scope="{row}">
          {{ row.storeType.join(',') }}
        </template>
      </el-table-column>
      <el-table-column prop="interval" label="录制周期" />
    </el-table>
    <span slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取 消</el-button>
      <el-button :loading="buttonLoading" type="primary" @click="choose">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getRecordTemplates, setRecordTemplates } from '@/api/group'
import { formatSeconds } from '@/utils/interval'

@Component({
  name: 'SetRecordTemplate'
})
export default class extends Vue {
  @Prop() private groupId?: string
  @Prop() private selectedList?: Array<any>
  private dialogVisible = true
  private tableLoading = false
  private buttonLoading = false
  private list = [
    {
      templateId: '0001',
      templateName: '30分钟录制',
      format: 'MP4, FLV, HLS',
      duration: '20分钟'
    },
    {
      templateId: '0002',
      templateName: '30分钟录制',
      format: 'MP4, FLV, HLS',
      duration: '20分钟'
    }
  ]
  private multipleSelection = []

  private formatSeconds = formatSeconds

  private closeDialog() {
    this.dialogVisible = false
    this.$emit('on-close')
  }

  private async choose() {
    let templateIdList: Array<string> = []
    this.list.forEach(item => {
      templateIdList.push(item.templateId)
    })
    let params = {
      groupId: this.groupId,
      templateId: templateIdList
    }
    this.buttonLoading = true
    await setRecordTemplates(params)
    this.buttonLoading = false
  }

  private async mounted() {
    this.tableLoading = true
    const res = await getRecordTemplates({
      groupId: this.groupId
    })
    this.list = res.templates
    this.tableLoading = false
    this.$nextTick(() => {
      this.list.forEach(item => {
        if (this.selectedList!.includes(item.templateId)) {
          const ref: any = this.$refs.multipleTable
          ref.toggleRowSelection(item)
        }
      })
    })
  }

  private handleSelectionChange(val: any) {
    this.multipleSelection = val
  }
}
</script>
<style lang="scss" scoped>
</style>
