<template>
  <div>
    <info-list-item :label="`${type}黑白名单:`">
      <div class="info-list__edit">
        <div class="info-list__edit--value">
          <el-switch v-model="chainConfig.enable" />
          {{ authStatus[chainConfig.enable] }}
        </div>
        <div class="info-list__edit--action">
          <el-button v-if="chainConfig.enable" type="text" @click="dialogVisible = true">编辑</el-button>
        </div>
      </div>
    </info-list-item>
    <el-dialog
      :visible="dialogVisible"
      :title="`${type}防盗链`"
      :close-on-click-modal="false"
      center
      @close="closeDialog"
    >
      <el-form ref="form" :model="form" label-width="140px" class="dialog-form" :rules="rules">
        <el-form-item label="防盗链类型" prop="bizType">
          <el-radio-group v-model="form.bizType">
            <el-radio label="blackList">黑名单</el-radio>
            <el-radio label="whiteList">白名单</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="名单列表" prop="data">
          <el-input v-model="form.data" type="textarea" auto-complete="off" :rows="6" />
          <div class="tips">{{ typeDic[type].tips }}</div>
        </el-form-item>
        <el-form-item v-if="type === 'Referer'" label="允许空Referer" prop="allowEmptyReferer">
          <el-radio-group v-model="form.allowEmptyReferer">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button type="primary" :loading="submitting" @click="submit">确定</el-button>
        <el-button @click="closeDialog(false)">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { AuthStatus } from '@/dics'
@Component({
  name: 'AntiTheftChain'
})
export default class extends Vue {
  @Prop()
  private type!: string
  @Prop()
  private config?: any
  private chainConfig: any = {}
  private authStatus = AuthStatus
  private dialogVisible = false
  private submitting = false
  private form = {
    bizType: '',
    data: '',
    allowEmptyReferer: ''
  }
  private typeDic = {
    Referer: {
      tips: '最多20个，使用回车符分隔，不可重复，支持通配符*，如：*.test.com',
      reg: /^(?=^.{3,255}$)(http(s)?:\/\/)?(www\.)?[a-zA-Z0-9*][-a-zA-Z0-9*]{0,62}(\.[a-zA-Z0-9*][-a-zA-Z0-9*]{0,62})+(:\d+)*(\/\w+\.\w+)*$/,
      error: '域名格式不正确'
    },
    UA: {
      tips: '最多20个，使用回车符分隔，不可重复，支持通配符*，如：Lavf*',
      reg: ''
    },
    IP: {
      tips: '最多20个，使用回车符分隔，不可重复，支持IP段添加(限/8 /16 /24)，如：127.0.0.0/24',
      reg: /^(?:(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(8|16|24))*$/,
      error: 'IP格式不正确'
    }
  }

  private rules = {
    bizType: [
      { required: true, message: '请选择防盗链类型', trigger: 'change' }
    ],
    data: [
      { required: true, validator: this.validateListFormat, trigger: 'blur' }
    ],
    allowEmptyReferer: [
      { required: true, message: '请选择是否允许空Referer', trigger: 'change' }
    ]
  }

  @Watch('config')
  private onConfigChange() {
    this.chainConfig = this.config
  }

  private mounted() {
    this.chainConfig = this.config
  }

  private isRepeat(arr: any) {
    let hash: any = {}
    for (let i in arr) {
      if (hash[arr[i]]) {
        return true
      }
      hash[arr[i]] = true
    }
    return false
  }

  private validateListFormat(rule: any, value: string, callback: any) {
    // @ts-ignore
    const type = this.typeDic[this.type]
    const reg = type.reg
    const refArray: Array<string> = value ? value.split('\n').filter((item, index, arr) => {
      return item.trim() !== ''
    }).map((item, index, arr) => {
      return item.trim()
    }) : []
    if (!value) {
      callback(new Error(`${this.type}不能为空`))
    } else if (refArray.length > 20) {
      callback(new Error('名单列表不超过20个'))
    } else if (this.isRepeat(refArray)) {
      callback(new Error('名单列表包含重复内容'))
    } else if (reg && !refArray.every((item, index, array) => reg.test(item))) {
      callback(new Error(type.error))
    } else {
      callback()
    }
  }

  private submit() {}

  private closeDialog() {
    this.dialogVisible = false
    this.$emit('on-close')
  }

  private choose() {}
}
</script>
<style lang="scss" scoped>
</style>
