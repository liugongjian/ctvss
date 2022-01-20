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
      <el-form-item prop="preview">
        <template slot="label">
          实时预览记录功能:
          <el-popover
            placement="top-start"
            title="实时预览记录功能"
            width="400"
            trigger="hover"
            :open-delay="300"
            :content="tips.preview"
          >
            <svg-icon slot="reference" class="form-question" name="help" />
          </el-popover>
        </template>
        <el-switch v-model="form.preview" :active-value="1" :inactive-value="2" />
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
        <el-switch v-model="form.replay" :active-value="1" :inactive-value="2" />
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

@Component({
  name: 'userConfiguration'
})
export default class extends Vue {
  private tips = {
    preview: '除首次实时预览需要打开指定摄像头外，后续切换回实时预览模块，都会直接播放上一次摄像头实时画面，默认关闭',
    replay: '除首次录像回放需要打开指定摄像头外，后续切换回录像回放模块，都会自动打开上一次摄像头录像回放界面，默认关闭'
  }
  private form = {
    preview: 1,
    replay: 1
  }
  private loading: boolean = false

  private handleChangeSettings() {
    console.log(this.form);
    
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
