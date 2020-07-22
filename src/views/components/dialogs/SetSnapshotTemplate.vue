<template>
  <el-dialog
    title="设置截图模板"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    @close="closeDialog"
  >
    <el-table
      ref="multipleTable"
      v-loading="tableLoading"
      :data="list"
      highlight-current-row
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="templateName" label="模板名称" width="100" />
      <el-table-column prop="storeType" label="存储格式">
        <template slot-scope="{row}">
          {{ row.storeType && row.storeType.join(',') }}
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
import { getSnapshotTemplates, setSnapshotTemplates } from '@/api/group'
import { formatSeconds } from '@/utils/interval'

@Component({
  name: 'SetSnapshotTemplate'
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
      templateName: '截图策略1',
      format: '覆盖式截图',
      duration: '30秒'
    },
    {
      templateId: '0002',
      templateName: '截图策略2',
      format: '覆盖式截图',
      duration: '30秒'
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
    await setSnapshotTemplates(params)
    this.buttonLoading = false
  }

  private async mounted() {
    this.tableLoading = true
    const res = await getSnapshotTemplates({
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
