<template>
  <el-dialog
    title="IP访问限制"
    :visible="true"
    width="30%"
    :before-close="handleClose"
    center
  >
    <el-form ref="form" :model="form" label-width="130px" :rules="rules">
      <el-form-item label="访问名单类型" prop="kind">
        <el-radio-group v-model="form.kind" @input="changeRadioValue">
          <el-radio label="black">黑名单</el-radio>
          <el-radio label="white">白名单</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="`${showName}列表`" prop="list">
        <el-input v-model="form.list" type="textarea" />
        <template slot="label">
          {{ `${showName}列表` }}:
          <el-popover
            placement="top-start"
            width="400"
            trigger="hover"
            :open-delay="300"
            content="支持添加IP网段，例如192.168.0.1/24（多个IP使用回行分隔）"
          >
            <svg-icon slot="reference" class="form-question" name="help" />
          </el-popover>
        </template>
      </el-form-item>
      <el-form-item label="是否启用" prop="enabled">
        <el-switch v-model="form.enabled" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="saveThis">保 存</el-button>
    </span>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { setIpRules } from '@/api/accessManage'
@Component({
  name: 'IpRestriction'
})
export default class extends Vue {
  @Prop() private ipAccessRules?: any

  private form = {
    kind: 'black',
    list: '',
    enabled: true
  }

  private showList = {
    'white': '白名单',
    'black': '黑名单'
  }

  private rules = {
    list: [
      { validator: this.validateIp, trigger: 'blur' }
    ]
  }

  private showName: string = ''

  mounted() {
    this.initState()
  }

  private initState() {
    if (this.ipAccessRules) {
      if (this.ipAccessRules.whiteIpList.length) {
        this.form = {
          kind: 'white',
          list: this.ipAccessRules.whiteIpList,
          enabled: this.ipAccessRules.enabled
        }
      } else if (this.ipAccessRules.blackIpList.length) {
        this.form = {
          kind: 'white',
          list: this.ipAccessRules.whiteIpList,
          enabled: this.ipAccessRules.enabled
        }
      }
    }
    this.showName = this.showList[this.form.kind]
  }

  private validateIp(rule: any, value: string, callback: Function) {
    const ipReg = /^((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])(?::(?:[0-9]|[1-9][0-9]{1,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))?$/
    const result = value.split('\n').every(item => ipReg.test(item))
    if (result) {
      callback()
    } else {
      callback(new Error('请输入正确格式的IP地址'))
    }
  }

  private handleClose() {
    this.form = {
      kind: 'black',
      list: '',
      enabled: true
    }
    this.$emit('on-close')
  }

  private changeRadioValue(val: string) {
    console.log('val----->', val)
    this.showName = this.showList[this.form.kind]
  }

  private saveThis() {
    // 过滤空数据
    const list = this.form.list.length > 0 ? this.form.list.split('\n').filter(item => item) : []
    const param = {
      [`${this.form.kind}IpList`]: list,
      type: 1,
      enabled: this.form.enabled ? 1 : 0
    }
    setIpRules(param)
    console.log('save', param)
    this.handleClose()
    this.$emit('refresh')
  }
}
</script>
