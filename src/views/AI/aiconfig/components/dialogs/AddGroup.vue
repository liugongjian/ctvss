<template>
  <el-dialog
    title="添加群组"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    center
    width="500px"
    @close="closeDialog"
  >
    <el-form
      ref="form"
      :rules="rules"
      :model="form"
      label-position="right"
      label-width="100px"
    >
      <el-form-item label="组名:" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="模板备注" prop="description">
        <el-input v-model="form.description" type="textarea" />
      </el-form-item>
    </el-form>
    <div slot="footer" align="center">
      <el-button type="primary" :loading="loading" @click="addGroup">{{ '确定' }}</el-button>
      <el-button @click="closeDialog">取消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { addGroup } from '@/api/aiConfig'
@Component({
  name: 'AddGroup'
})
export default class extends Vue {
  private dialogVisible = true
  private loading = false
  private form = {
    name: '',
    desc: ''
  }
  private rules = {
    name: [
      { required: true, message: '请输入姓名', trigger: 'blur' }
    ]
  }

  private closeDialog() {
    this.$emit('on-close', false)
  }

  private async doAddGroup() {
    try {
      this.loading = true
      await addGroup({})
      this.loading = false
    } catch (e) {
      this.loading = false
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
