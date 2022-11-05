<template>
  <el-dialog
    title="复制到"
    :visible="dialogVisible"
    :close-on-click-modal="true"
    width="700px"
    center
    @close="closeDialog"
  >
    <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="人脸库名称" align="center" />
      <el-table-column prop="description" label="人脸库描述" align="center" />
      <template slot="empty">
        <div>暂无数据，<el-button type="text" @click="toCreateGroup">马上创建></el-button></div>
      </template>
    </el-table>
    <el-pagination
      :current-page="pager.pageNum"
      :page-size="pager.pageSize"
      :total="pager.total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="submitting" :disabled="multipleSelection.length <= 0" @click="submit">确 定</el-button>
      <el-button @click="closeDialog">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { listGroup, copyToGroup } from '@/api/face'

@Component({
  name: 'CopyPersonal'
})
export default class extends Vue {
  @Prop()
  private groupId: string
  @Prop()
  private persons: any

  private dialogVisible = true
  private submitting = false

  private loading = false
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  private dataList: any = []
  private multipleSelection = []

  private mounted() {
    this.$nextTick(() => {
      this.getList()
    })
  }

  private async getList() {
    this.loading = true
    const params = {
      pageNum: this.pager.pageNum,
      pageSize: this.pager.pageSize
    }
    try {
      const res = await listGroup(params)
      this.dataList = res.data.filter(item => item.id !== this.groupId)
      this.pager.total = res.totalNum - 1
      this.pager.pageNum = res.pageNum
      this.pager.pageSize = res.pageSize
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  private handleSelectionChange(val) {
    this.multipleSelection = val
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getList()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getList()
  }

  private async submit() {
    if (this.submitting) return
    try {
      this.submitting = true
      const params = {
        groupId: this.groupId,
        personIds: this.persons.map(item => item.id),
        toGroupIds: this.multipleSelection.map(item => item.id)
      }
      await copyToGroup(params)
      this.$message.success('人员复制成功！')
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.submitting = false
    }
    this.closeDialog()
  }

  private closeDialog() {
    this.dialogVisible = false
    this.$emit('on-close')
  }

  private toCreateGroup() {
    this.$router.push({
      path: '/ai/facelib',
      params: {
        showAdd: 'Y'
      }
    })
  }
}
</script>
<style lang="scss" scoped>
</style>
