<template>
  <el-card>
    <el-form
      ref="form"
      v-loading="loading"
      :model="form"
      label-position="right"
      label-width="170px"
      class="user-configuration-form"
    >
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
      <el-form-item label="">
        <el-button type="primary" @click="handleChangeSettings">提 交</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { UserModule } from '@/store/modules/user'
import { updatetUserConfig } from '@/api/users'

@Component({
  name: 'userConfiguration'
})
export default class extends Vue {
  private tips = {
    screen: '除首次实时预览需要打开指定摄像头外，后续切换回实时预览模块，都会直接播放上一次摄像头实时画面，默认关闭',
    replay: '除首次录像回放需要打开指定摄像头外，后续切换回录像回放模块，都会自动打开上一次摄像头录像回放界面，默认关闭'
  }
  private form = {
    screen: 'false',
    replay: 'false'
  }
  private loading: boolean = false

  private get screenCacheSettings() {
    return UserModule.settings.screenCache
  }

  private async mounted() {
    await UserModule.getUserConfigInfo()
    this.form = this.screenCacheSettings
  }

  private async handleChangeSettings() {
    try {
      this.loading = true
      let params = []
      // 前后端参数不一致，设置转换字典
      let dic = {
        screen: 'live',
        replay: 'record'
      }
      Object.keys(this.form).forEach(item => {
        params.push({
          type: dic[item],
          enable: this.form[item]
        })
      })
      await updatetUserConfig({
        userConfig: params
      })
      await UserModule.getUserConfigInfo()
      this.$message.success('修改用户配置成功！')
    } catch (err) {
      this.$message.error('修改用户配置失败，失败原因：' + err.message)
    } finally {
      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
.user-configuration-form {
  position: relative;
  width: 40%;
  margin: 60px 0 60px 20px;
  .form-question {
    font-size: 16px;
    cursor: help;
  }
  ::v-deep .el-form-item {
    margin-bottom: 30px;
  }
}
</style>
