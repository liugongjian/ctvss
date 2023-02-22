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
        <el-form-item v-if="isLocked" label="请输入解锁密码" label-width="100" prop="unlockPwd" :rules="rules.pwd" :error="unclockPwdWrongMsg">
          <el-input v-model="form.unlockPwd" autocomplete="off" show-password placeholder="请输入6位数字" @focus="clearWrongMsg" />
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
        <el-form-item v-if="!isLocked" label="解锁密码" label-width="300" class="second-item" prop="lockPwd" :rules="rules.pwd">
          <el-input v-model="form.lockPwd" autocomplete="new-password" show-password placeholder="请输入6位数字" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="clear">取 消</el-button>
        <el-button :loading="submitting" type="primary" @click="confirm">确 定</el-button>
      </div>
    </el-dialog>
  </fragment>
</template>
<script lang="ts">
import { Vue, Prop, Component, Watch } from 'vue-property-decorator'
import { Fragment } from 'vue-fragment'
import { StreamInfo, DeviceInfo } from '@/components/VssPlayer/types/VssPlayer'
import { format } from 'date-fns'
import { ptzLock, ptzUnlock, getLockStatus } from '@/api/ptz_control'
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/utils/storage'
// import { throttle } from 'lodash'
import { GroupModule } from '@/store/modules/group'

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
    endTime: new Date().getTime() + 86400000,
    startTime: this.transformStampToString(new Date().getTime())
  }

  private dialogVisible = false

  private nowTicker

  private unclockPwdWrongMsg = ''

  private validateEndTime = (rule, value, callback) => {
    const valid = value > new Date().getTime()
    const valid2 = value < new Date().getTime() + 1000 * 60 * 60 * 24 * 30
    if (!valid) {
      callback(new Error('不能早于开始时间'))
    } else if (!valid2) {
      callback(new Error('不能超过一个月'))
    } else {
      callback()
    }
  }

  private validateNum = (rule, value, callback) => {
    const reg = /^[0-9]*$/
    const valid = reg.test(value)
    if (!valid) {
      callback(new Error('必须为数字'))
    } else {
      callback()
    }
  }

  private rules = {
    time: [{ required: true, message: '不能为空', trigger: 'blur' }, { validator: this.validateEndTime, trigger: 'blur' }],
    pwd: [{ required: true, message: '不能为空', trigger: 'blur' }, { min: 6, max: 6, message: '长度为6个字符', trigger: 'blur' }, { validator: this.validateNum, trigger: 'blur' }]
  }

  private submitting = false

  @Watch('dialogVisible', { immediate: true })
  private initDialog() {
    this.dialogVisible ? this.initTime() : this.clear()
  }

  private async mounted() {
    const res = await getLockStatus({
      deviceId: this.deviceInfo.deviceId,
      inProtocol: this.deviceInfo.inProtocol,
      groupId: GroupModule.group?.groupId
    })
    this.isLocked = res.status < 2
    this.initTime()
  }

  private initTime() {
    this.form.endTime = new Date().getTime() + 86400000 // + 1 day
    this.nowTicker = setInterval(() => {
      this.form.startTime = this.transformStampToString(new Date().getTime())
    }, 1000)
  }

  private lockOrUnlock() {
    this.isLocked ? this.unlock() : this.lock()
  }

  private async unlock() {
    try {
      const { unlockResult } = await ptzUnlock({
        deviceId: this.deviceInfo.deviceId,
        password: '',
        inProtocol: this.deviceInfo.inProtocol,
        groupId: GroupModule.group?.groupId
      })
      if (unlockResult === 3) {
        this.isLocked = false
        this.$message.success('解锁成功!')
      }
    } catch (e) {
      switch (e.message) {
        case '云台解锁失败':
          this.dialogVisible = true
          break
        default:
          this.$message.error(e.message)
      }
    }
  }

  private async lock() {
    this.dialogVisible = true
  }

  private resetForm() {
    this.form = {
      unlockPwd: '',
      lockPwd: '',
      endTime: new Date().getTime() + 86400000,
      startTime: this.transformStampToString(new Date().getTime())
    }
    const pwdForm: any = this.$refs.pwdForm
    pwdForm && pwdForm.clearValidate()
  }

  private async confirm() {
    this.clearWrongMsg()
    const pwdForm: any = this.$refs.pwdForm
    pwdForm.validate(async valid => {
      if (valid) {
        if (this.isLocked) {
          const wrongPT = +getLocalStorage('ptzLockWrongPwdTime')
          const until = +getLocalStorage('ptzLockWrongPwdUntil')
          if (wrongPT > 2 && !until) {
            setLocalStorage('ptzLockWrongPwdUntil', new Date().getTime() + 5 * 60 * 1000)
            this.$nextTick(() => {
              this.unclockPwdWrongMsg = '您输入密码已连续错误3次，请5分钟之后重试'
            })
            return
          }
          if (until && until < new Date().getTime()) {
            removeLocalStorage('ptzLockWrongPwdUntil')
            setLocalStorage('ptzLockWrongPwdTime', 0)
          }
          if (until && until > new Date().getTime()) {
            this.$nextTick(() => {
              this.unclockPwdWrongMsg = '您输入密码已连续错误3次，请5分钟之后重试'
            })
            return
          }
        }
        try {
          this.submitting = true
          const param = this.isLocked
            ? {
              deviceId: this.deviceInfo.deviceId,
              password: this.form.unlockPwd,
              inProtocol: this.deviceInfo.inProtocol,
              groupId: GroupModule.group?.groupId
            }
            : {
              deviceId: this.deviceInfo.deviceId,
              startTime: Math.floor(new Date().getTime() / 1000),
              endTime: Math.floor(this.form.endTime / 1000),
              password: this.form.lockPwd,
              inProtocol: this.deviceInfo.inProtocol,
              groupId: GroupModule.group?.groupId
            }
          this.isLocked ? await ptzUnlock(param) : await ptzLock(param)

          this.$message.success(`${this.isLocked ? '解锁' : '锁定'}成功！`)
          this.clear()
          setTimeout(() => {
            this.isLocked = !this.isLocked
          }, 200)
        } catch (e) {
          if (this.isLocked) {
            this.unclockPwdWrongMsg = e.message
            if (e.code === 7) {
              const wrongPwdTime = +getLocalStorage('ptzLockWrongPwdTime')
              setLocalStorage('ptzLockWrongPwdTime', wrongPwdTime + 1)
            }
          } else {
            this.$message.error(e.message)
          }
        } finally {
          this.submitting = false
        }
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

  private clearWrongMsg() {
    this.unclockPwdWrongMsg = ''
  }
}
</script>
<style lang="scss" scoped>
::v-deep .inner {
  width: 380px;
}

::v-deep .inner,
::v-deep .inner-wider {
  .el-input {
    width: 220px;
  }

  .el-divider__text {
    font-size: 12px;
  }

  .el-form {
    position: relative;
    overflow: hidden;

    .first-item {
      margin-top: 27px;
    }

    .second-item {
      margin-top: 48px;
    }

    .el-form-item {
      margin-left: 12px;
    }

    .block {
      position: absolute;
      width: 100%;
      border: 1px solid #888;
      border-radius: 4px;
    }

    .top {
      top: 10px;
      height: 132px;
    }

    .bottom {
      top: 160px;
      height: 65px;
    }

    .block-title {
      color: #888;
      position: absolute;
      background: #fff;
      z-index: 1000;
      margin-left: 8px;
    }

    .el-form-item__error {
      padding: 3px;
      left: 88px;
    }
  }
}

.disabled {
  cursor: wait;
  pointer-events: none;
}

::v-deep .inner-wider {
  width: 440px;

  .el-form-item__error {
    left: 130px !important;
  }
}
</style>
