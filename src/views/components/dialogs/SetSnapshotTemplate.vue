<template>
  <el-dialog
    title="设置截图模板"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    @close="closeDialog"
  >
    <el-table :data="list" highlight-current-row>
      <!-- <el-table-column type="selection" width="55" /> -->
      <el-table-column prop="templateName" label="模板名称" width="100" />
      <el-table-column prop="storeType" label="存储格式">
        <template slot-scope="{row}">
          {{ row.storeType.join(',') }}
        </template>
      </el-table-column>
      <el-table-column prop="interval" label="录制周期" />
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

@Component({
  name: 'SetSnapshotTemplate'
})
export default class extends Vue {
  @Prop() private groupId?: string
  @Prop() private region?: string
  private dialogVisible = true
  private list = [
    {
      templateName: '截图策略1',
      format: '覆盖式截图',
      duration: '30秒'
    },
    {
      templateName: '截图策略2',
      format: '覆盖式截图',
      duration: '30秒'
    }
  ]
  private closeDialog() {
    this.dialogVisible = false
    this.$emit('on-close')
  }
  private choose() {}
  private async mounted() {
    const res = await getSnapshotTemplates({
      groupId: this.groupId,
      region: this.region
    })
    this.list = res.templates
  }
}
</script>
<style lang="scss" scoped>
</style>
