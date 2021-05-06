<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-card>
      <el-form
        ref="dataForm"
        v-loading="loading"
        :rules="rules"
        :model="form"
        label-position="right"
        label-width="180px"
      >
        <el-form-item label="名称:" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="设备编号:" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="视图库用户名:" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="视图库密码:" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="IP:" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="端口:" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="心跳周期（秒）:" prop="">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="最大心跳超时次数:" prop="">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="">
          <el-button type="primary" @click="submit">确定</el-button>
          <el-button @click="back">取 消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'CreateUpPlatform'
})
export default class extends Vue {
  private breadCrumbContent = ''
  private form: any = {
    switch1: false,
    switch2: true,
    inProtocol: 'UDP'
  }

  private rules = {
    name: [
      { required: true, message: '请输入设备名称', trigger: 'blur' }
    ]
  }

  private mounted() {
    this.breadCrumbContent = this.$route.meta.title
  }

  private back() {
    this.$router.push('/up-platform')
  }

  private submit() {
    const form: any = this.$refs.createForm
    form.submit(() => {
      this.back()
    })
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  ::v-deep .el-input, ::v-deep .el-textarea {
    width: 400px;
  }
}
</style>
