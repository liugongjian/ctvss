<!--云台局部缩放-->
<template>
  <fragment>
    <el-tooltip :content="isLocked ? '解锁云台' : '锁定云台'" placement="top">
      <div class="control__btn control__snapshot" :class="{'disabled': submitting}" @click.stop.prevent="lockOrUnlock">
        <svg-icon :name="isLocked ? 'unlock' : 'lock'" />
      </div>
    </el-tooltip>
    <el-dialog :title="isLocked ? '解锁云台' : '锁定云台'" :visible.sync="dialogVisible" append-to-body :custom-class="isLocked ? 'inner-wider' : 'inner'">
      <el-form ref="pwdForm" :rules="rules" :model="form">
        <el-form-item v-if="isLocked" label="请输入解锁密码" label-width="100" prop="lockPwd" :rules="rules.pwd">
          <el-input v-model="form.lockPwd" autocomplete="off" show-password />
        </el-form-item>
        <span v-if="!isLocked" class="block-title">设置锁定时长</span>
        <div v-if="!isLocked" class="block top" />
        <el-form-item v-if="!isLocked" label="开始时间" label-width="300" class="first-item" required>
          <el-input :value="form.startTime" autocomplete="new-password" disabled prefix-icon="el-icon-time" />
        </el-form-item>
        <el-form-item v-if="!isLocked" label="结束时间" label-width="300" prop="endTime" :rules="rules.time">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择日期时间"
            align="right"
            value-format="timestamp"
          />
        </el-form-item>
        <span v-if="!isLocked" class="block-title">设置解锁密码</span>
        <div v-if="!isLocked" class="block bottom" />
        <el-form-item v-if="!isLocked" label="解锁密码" label-width="300" class="second-item" prop="unlockPwd" :rules="rules.pwd">
          <el-input v-model="form.unlockPwd" autocomplete="new-password" show-password />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-loading="submitting" @click="clear">取 消</el-button>
        <el-button v-loading="submitting" type="primary" @click="confirm">确 定</el-button>
      </div>
    </el-dialog>
  </fragment>
</template>
<script lang="ts">
import { Vue, Prop, Component } from 'vue-property-decorator'
import { Fragment } from 'vue-fragment'
import { StreamInfo, DeviceInfo } from '@/components/VssPlayer/types/VssPlayer'
import { format, parse } from 'date-fns'
import { throttle } from 'lodash'

@Component({
  name: 'PtzLock',
  components: {
    Fragment
  }
})
export default class extends Vue {
  @Prop({
    default: {}
  }) private deviceInfo: DeviceInfo

  @Prop({
    default: {}
  }) private streamInfo: StreamInfo

  private isLocked = false

  private form = {
    unlockPwd: '',
    lockPwd: '',
    endTime: 0,
    startTime: this.transformStampToString(new Date().getTime())
  }

  private dialogVisible = false

  private nowTicker

  private validateEndTime = (rule, value, callback) => {
    const valid = value > new Date().getTime()
    if (!valid) {
      callback(new Error('不能晚于当前时间'))
    } else {
      callback()
    }
  }

  private rules = {
    time: [{ required: true, message: '不能为空', trigger: 'blur' }, { validator: this.validateEndTime, trigger: 'blur' }],
    pwd: [{ required: true, message: '不能为空', trigger: 'blur' }, { min: 6, max: 6, message: '长度为6个字符', trigger: 'blur' }]
  }

  private submitting = false

  private mounted() {
    this.initTime()
    console.log('this.deviceInfo:', this.deviceInfo)
    console.log('this.streamInfo:', this.streamInfo)
  }

  private initTime() {
    this.form.endTime = new Date().getTime() + 86400000 // + 1 day
    this.nowTicker = setInterval(() => {
      this.form.startTime = this.transformStampToString(new Date().getTime())
    }, 1000)
  }

  private async lockOrUnlock() {
    this.isLocked ? await this.unlock() : await this.lock()
  }

  private async unlock() {
    // 1. await unlock请求第一次
    // 2. if(res.) 判断是否直接解锁成功
    // 3.1 如果成功
    // this.isLocked = false
    // 3.2 如果未成功，则显示输入密码
    this.dialogVisible = true
  }

  private async lock() {
    this.dialogVisible = true
  }

  private resetForm() {
    this.form = {
      unlockPwd: '',
      lockPwd: '',
      endTime: 0,
      startTime: this.transformStampToString(new Date().getTime())
    }
  }

  private async confirm() {
    const pwdForm: any = this.$refs.pwdForm
    pwdForm.validate(valid => {
      if (valid) {
        console.log('this.form:', this.form)
        // try {
        // this.submitting = true
        //   this.isLocked ? await unlock() : await lock()
        //   this.$nextTick(() => {
        //     this.isLocked = !this.isLocked
        //   })
        // } catch (e) {
        //   this.$message.error(e)
        // } finally {
        // this.submitting = false
        // this.clear()
        // }
      }
    })
  }

  private clear() {
    this.dialogVisible = false
    this.resetForm()
    clearInterval(this.nowTicker)
  }

  private transformStampToString(stamp) {
    if (stamp) {
      return format(new Date(stamp), 'yyyy-MM-dd HH:mm:ss')
    }
  }

  // private transformStringToStamp(str) {
  //   const date = parse(str, 'yyyy-MM-dd HH:mm:ss', new Date())
  //   return date.getTime()
  // }
}
</script>
<style lang="scss" scoped>
::v-deep .inner{
  width:380px;
}

::v-deep .inner, ::v-deep .inner-wider{
  .el-input{
    width: 220px;
  }
  .el-divider__text{
    font-size: 12px;
  }
  .el-form {
    position: relative;
    overflow: hidden;
    .first-item{
      margin-top: 27px;
    }
    .second-item{
      margin-top: 48px;
    }
    .el-form-item{
      margin-left: 12px;
    }
    .block{
      position:absolute;
      width: 100%;

      border: 1px solid #888888;
      border-radius: 4px;
    }
    .top{
      top: 10px;
      height: 132px;
    }
    .bottom{
      top: 160px;
      height: 65px;
    }
    .block-title{
      color: #888888;
      position: absolute;
      background: #fff;
      z-index: 1000;
      margin-left: 8px;
    }
    .el-form-item__error{
      padding: 3px;
      left:88px;
    }
  }
}
.disabled {
  cursor: wait;
  pointer-events:none;
}
::v-deep .inner-wider{
  width:440px;
  .el-form-item__error{
    left:130px !important;
  }
}
</style>
