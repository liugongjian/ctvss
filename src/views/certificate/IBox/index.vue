<template>
  <div class="app-container">
    <el-card>
      <div class="certificate-ibox__info">
        <span class="certificate-ibox__info-text">自动拉流</span>
        <el-popover
          placement="top-start"
          width="400"
          trigger="hover"
          :open-delay="300"
          content="请在iBox的接入配置里填写接入凭证码，盒子将自动接入当前登录账号下"
        >
          <svg-icon slot="reference" class="form-question" name="help" />
        </el-popover>
      </div>
      <div class="certificate-ibox__number">
        <div class="certificate-ibox__number-box">
          <p>接入凭证码</p>
          <h2>{{ code }}</h2>
          <el-button>点击更换凭证</el-button>
        </div>
      </div>
      <div class="certificate-ibox__step">
        <div class="certificate-ibox__step-content">
          <h3>第一步：告知安装员</h3>
          <p>管理员将显示的接入凭证码告知安装员</p>
        </div>
        <div class="certificate-ibox__step-content">
          <h3>第一步：告知安装员</h3>
          <p>管理员将显示的接入凭证码告知安装员</p>
        </div>
        <div class="certificate-ibox__step-content">
          <h3>第一步：告知安装员</h3>
          <p>管理员将显示的接入凭证码告知安装员</p>
        </div>
        <div class="certificate-ibox__step-content">
          <h3>第一步：告知安装员</h3>
          <p>管理员将显示的接入凭证码告知安装员</p>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
export default class extends Vue {
  public code = '828 368 287'
}
</script>
<style lang="scss" scoped>
.certificate-ibox {
  &__info-text {
    font-size: 20px;
  }

  &__number {
    position: relative;
    width: 100%;
    height: calc(100vh - 316px);

    &-box {
      width: 300px;
      height: 200px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;

      p,
      h2 {
        text-align: center;
      }
    }
  }

  &__step {
    height: 160px;
    min-width: 1120px;
    display: flex;
    // flex-direction: row;
    justify-content: space-around;

    &-content {
      width: 260px;
      padding: 20px 10px;
      border: 1px solid #d3d3d3;
      flex-shrink: 0;

      &:not(:last-child) {
        position: relative;

        &:after {
          content: '';
          width: 0;
          height: 0;
          border-top: 16px solid transparent;
          border-bottom: 16px solid transparent;
          border-left: 16px solid #777;
          position: absolute;
          top: 66px;
          right: min(-19px, calc(-1*(100vw - 1040px)/8 + 26px));
        }
      }
    }
  }
}
</style>
