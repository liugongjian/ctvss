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
        <el-form-item label="SIP服务国标编码:" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="SIP服务IP:" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="SIP服务端口:" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="设备国标编号:" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="级联映射:" prop="switch1">
          <el-switch v-model="form.switch1" />
        </el-form-item>
        <el-form-item label="开启鉴权:" prop="switch2">
          <el-switch v-model="form.switch2" />
        </el-form-item>
        <el-form-item label="SIP认证用户名:" prop="name">
          <el-input v-model="form.name" placeholder="默认使用设备国标编号" />
        </el-form-item>
        <el-form-item label="SIP认证密码:" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="注册周期（秒）:" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="心跳周期（秒）:" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="信令传输:" prop="name">
          <el-radio-group v-model="form.inProtocol">
            <el-radio label="UDP">UDP</el-radio>
            <el-radio label="TCP">TCP</el-radio>
          </el-radio-group>
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
  private loading = false

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
