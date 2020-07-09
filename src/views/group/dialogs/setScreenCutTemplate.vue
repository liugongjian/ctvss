<template>
  <el-dialog
    title="设置截图模板"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    @close="closeDialog"
  >
    <el-table :data="list" border fit highlight-current-row style="width: 100%;">
      <el-table-column prop="templateName" label="模板名称" />
      <el-table-column prop="screenCutFormat" label="截图格式" />
      <el-table-column prop="screenCutRevolution" label="截图周期" />
      <el-table-column prop="action" align="center" width="80px">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="choose(row)">选择</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
@Component({
  name: 'SetScreenCutTemplate'
})
export default class extends Vue {
  private dialogVisible = true
  private list = [{}]
  private closeDialog() {
    this.dialogVisible = false
    this.$emit('on-close')
  }
  private choose() {}
}
</script>
<style lang="scss" scoped>
</style>
