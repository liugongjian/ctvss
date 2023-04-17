<template>
  <el-dialog
    title="人脸识别配置"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    @close="closeDialog(false)"
  >
    <el-form
      ref="dataForm"
      :rules="rules"
      :model="form"
      label-position="right"
      label-width="0"
    >
      <el-form-item label="" prop="faceDbName" class="form-with-tip">
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
              <el-radio v-model="form.faceDbName" :label="scope.row.id">{{ '' }}</el-radio>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="组名称" width="200" align="center" />
          <el-table-column prop="description" label="描述" align="center" />
          <el-table-column prop="num" label="人数" width="80" align="center" />
          <el-table-column prop="createdTime" label="创建时间" width="200" align="center" />
          <el-table-column prop="updatedTime" label="更新时间" width="200" align="center" />
        </el-table>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="setFaceRecognition">确定</el-button>
      <el-button @click="closeDialog(false)">取消</el-button>
    </span>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getAIConfigGroupData } from '@/api/aiConfig'

@Component({
  name: 'SetFaceRecognition'
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
  private form = {
    faceDbName: ''
  }
  private dataList: any = []
  private rules = {
    faceDbName: [
      { required: true, message: '请选择人脸库', trigger: 'blur' }
    ]
  }

  mounted() {
    if (this.currentAlgorithm && this.currentAlgorithm.algorithmMetadata) {
      this.form = JSON.parse(this.currentAlgorithm.algorithmMetadata)
    }
    this.getData()
  }
  private closeDialog(refresh: boolean) {
    this.dialogVisible = false
    this.$emit('on-close', { val: '', refresh: refresh })
  }

  private rowClick(row: any) {
    this.form.faceDbName = row.id
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
  private setFaceRecognition() {
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        this.dialogVisible = false
        this.$emit('on-close', { val: JSON.stringify(this.form), refresh: true })
      }
    })
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
.fixed-width.el-input, .fixed-width.el-select, .fixed-width.el-textarea {
  width: 400px;
}
</style>
