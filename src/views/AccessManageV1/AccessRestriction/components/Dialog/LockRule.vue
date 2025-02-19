<template>
  <el-dialog
    title="锁定规则"
    :visible="true"
    width="500px"
    :before-close="handleClose"
    :close-on-click-modal="false"
    center
  >
    <el-form ref="form" :model="form" label-width="130px" :rules="rules">
      <el-form-item v-if="activeName === 'accountManage'" label="限制方式">
        <el-radio-group v-model="form.limitKind" @input="changeRadioValue">
          <el-radio label="account">限制账号</el-radio>
          <el-radio label="ip">限制部分IP</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="activeName === 'ipManage' || form.limitKind === 'ip'" label="IP" prop="list">
        <template slot="label">
          IP:
          <el-popover
            placement="top-start"
            trigger="hover"
            :open-delay="300"
            :content="contentText"
          >
            <svg-icon slot="reference" class="form-question" name="help" />
          </el-popover>
        </template>
        <el-input v-model="form.list" type="textarea" :rows="5" />
      </el-form-item>
      <el-form-item label="锁定时长">
        <el-select v-model="form.time" placeholder="请选择锁定时长">
          <el-option v-for="item in timeList" :key="item.key" :label="item.label" :value="item.key" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="form.time === 'custom'" label="自定义解锁时间">
        <el-date-picker
          v-model="form.expireTime"
          type="datetime"
          placeholder="选择日期时间"
          default-time="['00:00:00']"
        />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="sureThis">确 定</el-button>
      <el-button @click="handleClose">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

// import { setIpRules } from '@/api/accessManage'

@Component({
  name: 'LockRule'
})
export default class extends Vue {
  @Prop()private activeName?: string

  private todayStartTimeStamp = new Date().setHours(0, 0, 0, 0)
  private oneHourTimestamp = 60 * 60 * 1000

  private form = {
    list: '',
    time: '0.5',
    expireTime: this.todayStartTimeStamp + 24 * this.oneHourTimestamp,
    limitKind: 'account'
  }

  private timeList = [
    {
      key: '0.5',
      label: '30分钟'
    },
    {
      key: '1',
      label: '1小时'
    },
    // {
    //   key: '2',
    //   label: '2小时'
    // },
    // {
    //   key: '6',
    //   label: '6小时'
    // },
    // {
    //   key: '12',
    //   label: '12小时'
    // },
    {
      key: '24',
      label: '24小时'
    },
    {
      key: '48',
      label: '48小时'
    },
    {
      key: '72',
      label: '72小时'
    },
    {
      key: 'forever',
      label: '永久'
    },
    {
      key: 'custom',
      label: '自定义'
    }
  ]

  private rules = {
    list: [
      { validator: this.validateIp, trigger: 'blur' }
    ]
  }

  private get contentText() {
    if (this.activeName === 'ipManage') {
      return '支持添加IP网段，例如192.168.0.1/24（多个IP使用回行分隔）'
    }
    return '限制该用户来自部分IP的访问。支持添加IP网段，例如192.168.0.1/24（多个IP使用回行分隔）'
  }

  private validateIp(rule: any, value: string, callback: Function) {
    const ipReg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){2}(\.(.)+)$/
    const result = value.split('\n').every(item => ipReg.test(item))

    if (value) {
      if (result) {
        callback()
      } else {
        callback(new Error('请输入正确格式的IP地址'))
      }
    }
  }

  private handleClose() {
    this.form = {
      list: '',
      time: '0.5',
      expireTime: this.todayStartTimeStamp + 24 * this.oneHourTimestamp,
      limitKind: 'account'
    }
    this.$emit('on-close')
  }

  private sureThis() {
    let param: any = {
      type: 2
    }
    switch (this.form.time) {
      case 'custom':
        param.expireTime = new Date(this.form.expireTime).getTime()
        break
      case 'forever':
        break
      case '0.5':
      case '1':
      case '24':
      case '48':
      case '72':
        {
          const timestamp = Number(this.form.time) * this.oneHourTimestamp
          param.expireTime = Date.now() + timestamp
        }
        break
      default:
        param = {}
    }

    try {
      const list = this.form.list.length > 0 ? this.form.list.split('\n').filter(item => item) : []
      param.blackIpList = list
      // console.log('param------>', param)
      // setIpRules(param)
      this.$emit('set-lock', param)
      // this.handleClose()
    } catch (error) {
      this.$message.error(error && error.message)
    }
  }
}
</script>
