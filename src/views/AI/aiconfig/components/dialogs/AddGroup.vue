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
    </el-form>
    <div slot="footer" align="center">
      <el-button type="primary" :loading="loading" @click="doAddGroup">{{ '确定' }}</el-button>
      <el-button @click="closeDialog">取消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { addAIConfigGroupData } from '@/api/aiConfig'

const validate = (rule, value, callback) => {
  const regu = /^[\u4e00-\u9fa50-9a-zA-Z-()（）_]{2,64}$/
  const re = new RegExp(regu)
  if (!re.test(value)) {
    callback(new Error('只能包含大小写字母、数字、中文、中划线、下划线、小括号'))
  } else {
    callback()
  }
}

@Component({
  name: 'AddGroup'
})
export default class extends Vue {
  private dialogVisible = true
  private loading = false
  private form = {
    name: '',
    description: ''
  }
  private rules = {
    name: [
      { required: true, message: '请输入组名', trigger: 'blur' },
      { min: 2, max: 64, message: '长度需在 2 到 64 个字符', trigger: 'blur' },
      { validator: validate, trigger: 'blur' }
    ]
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
          await addAIConfigGroupData({ ...this.form })
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
