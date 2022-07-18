<template>
  <el-dialog
    title="添加人脸库"
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
      <el-form-item label="人脸库名称:" prop="name" class="face-name-item">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="人脸库描述:" prop="description">
        <el-input v-model="form.description" />
      </el-form-item>
    </el-form>
    <div slot="footer" align="center">
      <el-button type="primary" :loading="loading" @click="doAddGroup">确定</el-button>
      <el-button @click="closeDialog">取消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { addGroup } from '@/api/face'

const validate = (rule, value, callback) => {
  const regu = /^[\u4e00-\u9fa50-9a-zA-Z-()（）_]{4,64}$/
  const re = new RegExp(regu)
  if (!re.test(value)) {
    callback(new Error('4-64位，只能包含大小写字母、数字、中文、中划线、下划线、小括号。人脸库名称不能重复。'))
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
      { required: true, message: '请输入人脸库名称', trigger: 'blur' },
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
          await addGroup({ ...this.form })
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
.face-name-item {
 ::v-deep &.is-error {
   margin-bottom: 40px;
 }
}
</style>
