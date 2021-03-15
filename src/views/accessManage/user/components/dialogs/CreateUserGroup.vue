<template>
  <el-dialog
    :title="dialogTitle"
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
      label-width="120px"
    >
      <el-form-item label="子部门名称:" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
    </el-form>
    <div slot="footer" align="center">
      <el-button type="primary" :loading="loading" @click="doAddGroup">{{ '确定' }}</el-button>
      <el-button @click="closeDialog">取消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
@Component({
  name: 'AddGroup'
})
export default class extends Vue {
  @Prop() private dialogData: any
  private dialogTitle: string = ''
  private dialogVisible = true
  private loading = false
  private form: any = {
    name: ''
  }

  private rules = {
    name: [
      { required: true, message: '请输入子部门名称', trigger: 'blur' }
    ]
  }

  private mounted() {
    if (this.dialogData.type === 'add') {
      this.dialogTitle = '创建子部门'
    } else if (this.dialogData.type === 'edit') {
      this.dialogTitle = '修改子部门'
      this.form.name = this.dialogData.groupId
    }
  }

  private closeDialog() {
    this.$emit('on-close', false)
  }

  private async doAddGroup() {
    const form: any = this.$refs.form
    form.validate(async(valid: any) => {
      try {
        if (valid) {
          this.loading = true
          // await addAIConfigGroupData({ ...this.form })
          this.loading = false
          this.$emit('on-close', true)
        } else {
          return false
        }
      } catch (e) {
        this.$message.error(e && e.message)
        this.loading = false
      }
    })
  }
}
</script>
<style lang="scss" scoped>
</style>
