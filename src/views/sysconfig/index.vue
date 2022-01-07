<template>
  <div class="app-container">
    <el-card>
      <el-form ref="form" :model="form" label-width="200px">
        <el-form-item label="是否启用短信告警">
          <el-switch v-model="form.enable" @change="enable" />
        </el-form-item>
        <el-form-item v-if="form.enable" label="手机号">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">提交</el-button>
          <el-button>取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'App'
})
export default class extends Vue {
  public form:any = {
    enable: false,
    phone: ''
  }
  private enable(value) {
    value && this.getPhoneNumber()
  }
  private getPhoneNumber() {
    this.form.phone = '15'
  }
  private submit() {
    console.log('submit')
  }
}
</script>

<style lang='scss' scoped>
.el-form{
  .el-input{
    width: 250px;
  }
}
</style>
