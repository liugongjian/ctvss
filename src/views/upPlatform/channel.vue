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
        label-width="140px"
      >
        <el-form-item label="名称:" prop="userType">
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
  private form: any = {}

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
