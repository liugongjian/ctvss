<template>
  <el-dialog
    :visible="true"
    title="查看绑定关系"
    width="650px"
    center
    @close="closeDialog"
  >
    <el-table
      v-loading="loading"
      :data="bindData"
      class="bind-table"
    >
      <el-table-column
        prop="name"
        label="业务组/设备名称"
      >
        <template slot-scope="{ row }">
          {{ row.name || row.id }}
        </template>
      </el-table-column>
      <el-table-column
        prop="type"
        label="类别"
      >
        <template slot="header">
          <span>类别</span>
        </template>
        <template slot-scope="{ row }">
          {{ row.type === 'device' || row.type === 'stream' ? "设备" : "业务组" }}
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page="pager.pageNum"
      :page-size="pager.pageSize"
      :total="pager.total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { getRecordBind } from '@vss/device/api/template'

@Component({
  name: 'ViewBind'
})
export default class extends Vue {
  @Prop({ default: '' })
  private templateId!: string
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  private loading = false
  private bindData = []

  @Watch('bindData.length')
  private onBindDataChange(data: any) {
    data === 0 && this.pager.pageNum > 1 && this.handleCurrentChange(this.pager.pageNum - 1)
  }

  private async mounted() {
    this.getRecordBindMethod()
  }
  private async getRecordBindMethod() {
    try {
      this.loading = true
      const params = {
        templateId: this.templateId,
        pageNum: this.pager.pageNum,
        pageSize: this.pager.pageSize
      }
      const res = await getRecordBind(params)
      this.loading = false
      this.bindData = res.bind
      this.pager.total = res.totalNum
      this.pager.pageNum = res.pageNum
      this.pager.pageSize = res.pageSize
    } catch (e) {
      this.$message.error(`获取绑定关系失败，原因：${e && e.message}`)
      this.loading = false
    }
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getRecordBindMethod()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getRecordBindMethod()
  }

  private closeDialog() {
    this.$emit('on-close')
  }
}
</script>
<style lang="scss" scoped>
.bind-table {
  position: relative;

  ::v-deep {
    span.el-table__column-filter-trigger {
      visibility: hidden;
    }
  }
}
</style>
