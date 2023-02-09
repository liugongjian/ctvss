<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-card>
      <create-form ref="createForm">
        <el-button type="primary" :disabled="editDisable" @click="submit">确定</el-button>
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
  private editDisable = false

  private mounted() {
    this.breadCrumbContent = this.$route.meta.title
  }

  private back() {
    const form: any = this.$refs.createForm
    form.reader && form.reader.abort()
    this.$router.push('/certificate/gb35114')
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
.alert {
  margin-bottom: 10px;
}
</style>
