<template>
  <div class="app-container">
    <el-card>
      <el-tabs v-model="activeName" type="border-card">
        <el-tab-pane label="通用" name="currency">
          <el-form ref="form" :model="form" :rules="rules" label-width="200px">
            <el-form-item label="是否启用短信告警">
              <el-switch v-model="form.active" />
            </el-form-item>
            <el-form-item v-if="form.active" label="手机号" prop="phoneNumber">
              <el-input v-model="form.phoneNumber" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submit">提交</el-button>
              <el-button @click="back">取消</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="画面" name="frame">
          <el-form ref="formFrame" :model="formFrame" label-width="120px">
            <el-form-item label="默认画面比例">
              <el-select v-model="formFrame.scaleVal" placeholder="请选择默认画面比例" @change="selectChange">
                <el-option v-for="item in scaleKind" :key="item.kind" :label="item.label" :value="item.num" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="save">保存</el-button>
              <el-button @click="back">取消</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <!-- <el-form ref="form" :model="form" :rules="rules" label-width="200px">
        <el-form-item label="是否启用短信告警">
          <el-switch v-model="form.active" />
        </el-form-item>
        <el-form-item v-if="form.active" label="手机号" prop="phoneNumber">
          <el-input v-model="form.phoneNumber" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">提交</el-button>
          <el-button @click="back">取消</el-button>
        </el-form-item>
      </el-form> -->
    </el-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getPhoneNumberForAISMS, activatePhone } from '@/api/ai-app'
import { setUserConfig } from '@/api/users'
import { scaleKind } from '@/dics/index'

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
  private scaleKind = scaleKind
  private activeName = 'currency'
  private formFrame:any={
    scaleVal: ''
  }
  public form:any = {
    active: false,
    phoneNumber: ''
  }
  public rules = {
    phoneNumber: [{ required: true, trigger: 'blur', validator: validPhone }]
  }

  private async mounted() {
    this.getUserConfigInfo()
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
        this.$message.success('操作失败')
      } finally {
        this.form = await getPhoneNumberForAISMS({})
      }
    })
  }

  private getUserConfigInfo() {
    console.log('this.userConfigInfo', this.$store.state.app.userConfigInfo)
    const userScaleConfig = this.$store.state.app.userConfigInfo
    if (userScaleConfig.length > 0) {
      this.formFrame.scaleVal = userScaleConfig.find((item:any) => item.key === 'videoScale').value
    } else {
      this.formFrame.scaleVal = '1'
    }
  }

  private async save() {
    const param = [{ key: 'videoScale', value: this.formFrame.scaleVal }]
    setUserConfig(param).then(res => {
      console.log(res)
    })
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
