<template>
  <el-dialog
    :v-loading="loading.dialog"
    title="角色管理"
    :visible="true"
    :close-on-click-modal="false"
    center
    width="500px"
    @close="closeDialog(false)"
  >
    <el-form
      ref="form"
      :rules="rules"
      :model="form"
      label-position="right"
      label-width="120px"
    >
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="form.roleName" placeholder="请输入角色名称" />
      </el-form-item>
      <el-form-item label="角色描述" prop="describe">
        <el-input v-model="form.roleName" type="textarea" :rows="4" placeholder="请输入角色名称" />
      </el-form-item>
    </el-form>
    <div slot="footer" align="center">
      <el-button type="primary" :disabled="loading.submit" @click="submit">确定</el-button>
      <el-button :disabled="loading.submit" @click="closeDialog(false)">取消</el-button>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
@Component({
  name: 'ManageRole'
})
export default class extends Vue {
  private loading = {
    dialog: false,
    submit: false
  }
  private rules = {
    roleName: [
      { required: true, message: '请输入角色名称', trigger: 'blur' }
    ]
  }
  private form = {
    roleName: '',
    describe: ''
  }

  private submit() {
    this.closeDialog(true)
  }
  private closeDialog(refresh: boolean) {
    this.$emit('on-close', refresh)
  }
}
</script>

<style>

</style>
