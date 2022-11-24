<template>
  <div class="app-container">
    <el-card>
      <div class="certificate-ibox__info">
        <span class="certificate-ibox__info-text">接入凭证</span>
        <el-popover
          placement="top-start"
          width="400"
          trigger="hover"
          :open-delay="300"
          content="请在iBox的接入配置里填写接入凭证码，盒子将自动接入当前登录账号下"
        >
          <!-- <svg-icon
            slot="reference" class="form-question" name="warning"
          /> -->
          <i slot="reference" class="el-icon-warning form-question" />
        </el-popover>
      </div>
      <div class="certificate-ibox__number">
        <div class="certificate-ibox__number-box">
          <p>接入凭证码</p>
          <h2>{{ captcha }}</h2>
          <el-button type="text" icon="el-icon-refresh" @click="changeDialog">点击更换凭证</el-button>
        </div>
        <div v-if="showWarnning" class="certificate-ibox__number-waring">
          已过期
        </div>
      </div>
      <div class="certificate-ibox__step">
        <div class="certificate-ibox__step-content">
          <h3>
            <svg-icon name="step1" />
            第一步：告知安装员
          </h3>
          <p>管理员将显示的接入凭证码告知安装员</p>
        </div>
        <div class="certificate-ibox__step-content">
          <h3>
            <svg-icon name="step2" />
            第二步：填写平台地址
          </h3>
          <p>公有云地址：无需填写</p>
          <p>私有云地址：服务器[IP]:端口号[Port]</p>
        </div>
        <div class="certificate-ibox__step-content">
          <h3>
            <svg-icon name="step3" />
            第三步：填写接入凭证码
          </h3>
          <p>安装员在设备端填写接入凭证码（一码可填多台设备）</p>
        </div>
        <div class="certificate-ibox__step-content">
          <h3>
            <svg-icon name="step4" />
            第四步：绑定设备
          </h3>
          <p>设备连接平台，并完成用户绑定</p>
        </div>
      </div>
    </el-card>
    <el-dialog
      title="更换凭证"
      :visible.sync="ifShowDialog"
      width="30%"
      center
    >
      <span>确定更换iBox接入凭证吗？确定更换后，已接入平台的iBox不受影响；新的iBox配置接入时，需使用新的凭证，旧的凭证将失效。</span>
      <span slot="footer" class="dialog-footer">

        <el-button type="primary" @click="changeCaptcha">确 定</el-button>
        <el-button @click="changeDialog">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getIBoxCertificates, freshIBoxCertificates } from '@/api/ibox'

@Component({
  name: 'IBoxCertificate',
  components: {
  }
})

export default class IBoxCertificate extends Vue {
  public captcha = '828 368 287'
  public ifShowDialog = false
  public expireTime: string = ''
  public showWarnning = false

  public async mounted() {
    await this.getCaptcha()
  }

  public async getCaptcha() {
    try {
      const res: any = await getIBoxCertificates()
      this.captcha = (res.captcha || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1 ')
      this.expireTime = res.expireTime
      // console.log('this.expireTime---->', Number(this.expireTime), Date.now(), Date.now() >= Number(this.expireTime))
      if (Date.now() >= Number(this.expireTime)) {
        this.showWarnning = true
      }
    } catch (error) {
      console.log(error)
    }
  }

  public async freshCaptcha() {
    try {
      const res: any = await freshIBoxCertificates()
      this.captcha = (res.captcha || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1 ')
    } catch (error) {
      console.log(error)
    }
  }

  public changeDialog() {
    this.ifShowDialog = !this.ifShowDialog
  }

  public async changeCaptcha() {
    await this.freshCaptcha()
    this.ifShowDialog = false
    this.showWarnning = false
  }
}
</script>
<style lang="scss" scoped>
.app-container {
  ::v-deep .el-card {
    overflow: auto;
  }
}

.certificate-ibox {
  &__info-text {
    font-size: 20px;
  }

  &__number {
    position: relative;
    width: 100%;
    height: calc(100vh - 316px);

    &-box {
      width: 500px;
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

      p {
        font-size: 16px;
      }

      h2 {
        font-size: 80px;
        margin-top: 0;
        margin-bottom: 10px;
      }
    }

    &-waring {
      width: 80px;
      height: 36px;
      line-height: 36px;
      text-align: center;
      color: #e67979;
      border: 1px solid #e67979;
      border-radius: 5px;
      position: absolute;
      top: 50%;
      left: calc(50% + 300px);
      transform: translate(-50%, -55%);
    }
  }

  &__step {
    height: 160px;
    min-width: 1000px;
    display: flex;
    // flex-direction: row;
    justify-content: space-around;

    &-content {
      width: 240px;
      padding: 20px 10px;
      // border: 1px solid #d3d3d3;
      flex-shrink: 0;

      p {
        font-size: 12px;
        color: #777;
      }

      &:not(:last-child) {
        position: relative;

        &:after {
          content: '';
          width: 0;
          height: 0;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          border-left: 6px solid #000;
          position: absolute;
          top: 76px;
          right: min(-13px, calc(-1*(100vw - 1040px)/8 + 34px));
        }
      }
    }
  }
}
</style>
