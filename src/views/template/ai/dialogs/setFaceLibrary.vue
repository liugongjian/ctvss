<template>
  <el-dialog
    title="人脸库配置"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    @close="closeDialog(false)"
  >
    <el-table
      ref="faceTable"
      v-loading="loading"
      class="face-library-table"
      :data="dataList"
      fit
      highlight-current-row
      max-height="500"
      @row-click="rowClick"
    >
      <el-table-column label="操作" width="55" align="center">
        <template slot-scope="scope">
          <el-radio v-model="radioId" :label="scope.row.id">{{ '' }}</el-radio>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="组名称" width="200" align="center" />
      <el-table-column prop="description" label="描述" align="center" />
      <el-table-column prop="num" label="人数" width="80" align="center" />
      <el-table-column prop="createTime" label="创建时间" width="200" align="center" />
      <el-table-column prop="updateTime" label="更新时间" width="200" align="center" />
    </el-table>
    <span slot="footer" class="dialog-footer">
      <el-button @click="setFaceLibray">确定</el-button>
      <el-button @click="closeDialog(false)">取消</el-button>
    </span>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getAIConfigGroupData } from '@/api/aiConfig'

@Component({
  name: 'SetFaceLibrary'
})
export default class extends Vue {
  @Prop() private currentAlgorithm?: any
  private pager = {
    pageNum: 1,
    pageSize: 999,
    total: 0
  }
  private loading = false
  private dialogVisible = true
  private radioId = ''
  private dataList: any = []

  mounted() {
    this.radioId = (this.currentAlgorithm && this.currentAlgorithm.algorithmMetadata) || ''
    this.getData()
  }
  private closeDialog(refresh: boolean, val: any) {
    this.dialogVisible = false
    this.$emit('on-close', { val: val, refresh: refresh })
  }

  private rowClick(row: any) {
    this.radioId = row.id
  }

  private async getData() {
    try {
      this.loading = true
      const res = await getAIConfigGroupData({
        pageSize: this.pager.pageSize,
        pageNum: this.pager.pageNum
      })
      this.loading = false
      this.dataList = res.groups
      this.pager.total = res.totalNum
    } catch (e) {
      this.loading = false
    }
  }
  private setFaceLibray() {
    this.dialogVisible = false
    this.$emit('on-close', { val: this.radioId, refresh: true })
  }
}
</script>
<style lang="scss" scoped>
.face-library-table {
  ::v-deep .el-table__body {
    td {
      cursor: pointer;
    }
  }
}
</style>
