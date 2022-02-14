<template>
  <div class="app-container">
    <el-card>
      <el-tabs v-model="activeName" type="border-card">
        <el-tab-pane label="通用" name="currency">
          <el-form ref="form" :model="form" :rules="rules" label-width="200px">
            <el-form-item label="是否启用短信告警">
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
              <el-select v-model="formFrame.scaleVal" placeholder="请选择默认画面比例">
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
        <el-form-item v-if="form.active" label="手机号:" prop="phoneNumber">
          <el-input v-model="form.phoneNumber" />
        </el-form-item>
        <el-form-item prop="screen">
          <template slot="label">
            实时预览记录功能:
            <el-popover
              placement="top-start"
              title="实时预览记录功能"
              width="400"
              trigger="hover"
              :open-delay="300"
              :content="tips.screen"
            >
              <svg-icon slot="reference" class="form-question" name="help" />
            </el-popover>
          </template>
          <el-switch v-model="form.screen" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item prop="replay">
          <template slot="label">
            录像回看记录功能:
            <el-popover
              placement="top-start"
              title="录像回看记录功能"
              width="400"
              trigger="hover"
              :open-delay="300"
              :content="tips.replay"
            >
              <svg-icon slot="reference" class="form-question" name="help" />
            </el-popover>
          </template>
          <el-switch v-model="form.replay" active-value="true" inactive-value="false" />
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
import { UserModule } from '@/store/modules/user'
import { updatetUserConfig } from '@/api/users'
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
    phoneNumber: '',
    screen: 'false',
    replay: 'false'
  }
  public rules = {
    phoneNumber: [{ required: true, trigger: 'blur', validator: validPhone }]
  }

  private tips = {
    screen: '除首次实时预览需要打开指定摄像头外，后续切换回实时预览模块，都会直接播放上一次摄像头实时画面，默认关闭',
    replay: '除首次录像回放需要打开指定摄像头外，后续切换回录像回放模块，都会自动打开上一次摄像头录像回放界面，默认关闭'
  }
  private cacheForm = {
    screen: 'false',
    replay: 'false'
  }
  private loading: boolean = false

  private get screenCacheSettings() {
    return UserModule.settings.screenCache
  }

  private async mounted() {
    this.getUserConfigInfo()
    try {
      this.form = await getPhoneNumberForAISMS({})
    } catch (e) {
      console.log(e)
    }
    try {
      await UserModule.getUserConfigInfo()
      this.form = {
        ...this.form,
        ...this.screenCacheSettings
      }
    } catch (e) {
      console.log(e)
    }
  }
  private back() {
    this.$router.back()
  }
  private async submit() {
    const form: any = this.$refs.form
    form.validate(async(valid: any) => {
      if (!valid) return
      try {
        this.loading = true
        let params = []
        // 前后端参数不一致，设置转换字典
        let dic = {
          screen: 'live',
          replay: 'record'
        }
        let keyList = ['screen', 'replay']
        keyList.forEach(item => {
          params.push({
            key: dic[item],
            value: this.form[item]
          })
        })
        await updatetUserConfig({
          userConfig: params
        })
        await UserModule.getUserConfigInfo()
        await activatePhone({
          phoneNumber: this.form.phoneNumber,
          active: this.form.active
        })
        this.$message.success('操作成功')
      } catch (e) {
        this.$message.error('操作失败')
      } finally {
        this.form = {
          ...this.form,
          ...await getPhoneNumberForAISMS({})
        }
        this.loading = false
      }
    })
  }

  // private async handleChangeSettings() {
  //   try {
  //     this.loading = true
  //     let params = []
  //     // 前后端参数不一致，设置转换字典
  //     let dic = {
  //       screen: 'live',
  //       replay: 'record'
  //     }
  //     Object.keys(this.form).forEach(item => {
  //       params.push({
  //         type: dic[item],
  //         enable: this.form[item]
  //       })
  //     })
  //     await updatetUserConfig({
  //       userConfig: params
  //     })
  //     await UserModule.getUserConfigInfo()
  //     this.$message.success('修改用户配置成功！')
  //   } catch (err) {
  //     this.$message.error('修改用户配置失败，失败原因：' + err.message)
  //   } finally {
  //     this.loading = false
  //   }
  // }
  private getUserConfigInfo() {
    const userScaleConfig = this.$store.state.user.userConfigInfo
    if (userScaleConfig.length > 0) {
      this.formFrame.scaleVal = userScaleConfig.find((item:any) => item.key === 'videoScale').value
    } else {
      this.formFrame.scaleVal = '1'
    }
  }

  private async save() {
    const param = { 'userConfig': [{ key: 'videoScale', value: this.formFrame.scaleVal }] }
    updatetUserConfig(param).then(() => {
      const temp = this.$store.state.user.userConfigInfo
      const result = temp.find((item:any) => item.key === 'videoScale')
      result.value = this.formFrame.scaleVal
      const final = [temp.find((item:any) => item.key !== 'videoScale'), result]
      this.$store.state.user.userConfigInfo = final
    }).catch(err => console.log('err->', err))
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
