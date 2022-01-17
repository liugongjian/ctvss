<template>
  <div class="app-container">
    <el-card>
      <el-form ref="form" :model="form" :rules="rules" label-width="200px">
        <el-form-item>
          <template slot="label">
            是否启用短信告警:
            <el-popover
              placement="top-start"
              title="是否启用短信告警"
              width="400"
              trigger="hover"
              :open-delay="300"
              content="设备/流绑定AI应用后，出现AI告警信息会向客户手机发送短信提醒，默认开启"
            >
              <svg-icon slot="reference" class="form-question" name="help" />
            </el-popover>
          </template>
          <el-switch v-model="form.active" />
        </el-form-item>
        <el-form-item v-if="form.active" label="手机号:" prop="phoneNumber">
          <el-input v-model="form.phoneNumber" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">提交</el-button>
          <el-button @click="back">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getPhoneNumberForAISMS, activatePhone } from '@/api/ai-app'

function isvalidPhone(str) {
  const reg = /^1[3|4|5|7|8][0-9]\d{8}$/
  return reg.test(str)
}
const validPhone = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入电话号码'))
  } else if (!isvalidPhone(value)) {
    callback(new Error('请输入正确的11位手机号码'))
  } else {
    callback()
  }
}
@Component({
  name: 'Sysconfig'
})
export default class extends Vue {
  public form:any = {
    active: false,
    phoneNumber: ''
  }
  public rules = {
    phoneNumber: [{ required: true, trigger: 'blur', validator: validPhone }]
  }
  private async mounted() {
    this.form = await getPhoneNumberForAISMS({})
  }
  private back() {
    this.$router.back()
  }
  private async submit() {
    const form: any = this.$refs.form
    form.validate(async(valid: any) => {
      if (!valid) return
      try {
        await activatePhone({
          phoneNumber: this.form.phoneNumber,
          active: this.form.active
        })
        this.$message.success('操作成功')
      } catch (e) {
        this.$message.error('操作失败')
      } finally {
        this.form = await getPhoneNumberForAISMS({})
      }
    })
  }
}

</script>

<style lang='scss' scoped>
.el-form{
  .el-input{
    width: 250px;
  }
  ::v-deep .el-form-item__content{
    line-height: 33px !important;
  }
}
</style>
