<template>
  <el-dialog
    title="设置截图模板"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    @close="closeDialog"
  >
    <el-table
      ref="multipleTable"
      v-loading="loading"
      :data="list"
      highlight-current-row
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="templateName" label="模板名称" width="100" />
      <el-table-column prop="storeType" label="存储格式">
        <template slot-scope="{row}">{{ row.storeType && row.storeType.join(',') }}</template>
      </el-table-column>
      <el-table-column prop="interval" label="录制周期" :formatter="formatSeconds" />
    </el-table>
    <span slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取 消</el-button>
      <el-button type="primary" @click="closeDialog">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getSnapshotTemplates } from '@/api/group'
import { formatSeconds } from '@/utils/interval'

@Component({
  name: 'SetSnapshotTemplate'
})
export default class extends Vue {
  @Prop() private groupId?: string
  @Prop() private region?: string
  @Prop() private selectedList?: Array<any>
  private dialogVisible = true
  private loading = false
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
  private choose() {}
  private async mounted() {
    this.loading = true
    const res = await getSnapshotTemplates({
      groupId: this.groupId,
      region: this.region
    })
    this.list = res.templates
    this.loading = false
    this.$nextTick(() => {
      this.list.forEach(item => {
        if (this.selectedList!.indexOf(item.templateId) !== -1) {
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
