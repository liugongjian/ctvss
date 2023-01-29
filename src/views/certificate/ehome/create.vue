<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-card>
      <create-form ref="createForm">
        <el-button type="primary" @click="submit">确定</el-button>
        <el-button @click="back">取 消</el-button>
      </create-form>
    </el-card>
  </div>
</template>
<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import CreateForm from './components/CreateForm.vue'

@Component({
  name: 'CreateGb28181Certificate',
  components: {
    CreateForm
  }
})
export default class extends Vue {
  private breadCrumbContent = ''

  private mounted() {
    this.breadCrumbContent = this.$route.meta.title
  }

  private back() {
    this.$router.push('/certificate/ehome')
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
  ::v-deep .el-input,
  ::v-deep .el-textarea {
    width: 400px;
  }
}

.alert {
  margin-bottom: 10px;
}
</style>
