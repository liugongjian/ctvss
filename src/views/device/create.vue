<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-card>
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="form"
        label-position="right"
        label-width="140px"
      >
        <el-form-item label="业务组名称:">
          上海电信园区
        </el-form-item>
        <el-form-item label="设备类型:" prop="deviceType">
          <el-select v-model="form.deviceType" placeholder="请选择">
            <el-option v-for="item in deviceTypeList" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="厂商:" prop="deviceVendor">
          <el-select v-model="form.deviceVendor">
            <el-option v-for="item in deviceVendorList" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备名称:" prop="deviceName" class="form-with-tip">
          <el-input v-model="form.deviceName" />
          <div class="form-tip">4-16位，可包含大小写字母、数字、中划线。</div>
        </el-form-item>
        <el-form-item label="设备国标ID:" prop="gbId">
          <el-input v-model="form.gbId" />
        </el-form-item>
        <el-form-item label="设备IP:" prop="gbIp">
          <el-input v-model="form.gbIp" />
        </el-form-item>
        <el-form-item label="端口:" prop="gbPort">
          <el-input v-model="form.gbPort" />
        </el-form-item>
        <el-form-item label="GB28181账号:" prop="gbAccount">
          <el-select v-model="form.gbAccount">
            <el-option v-for="item in gbAccountList" :key="item" :label="item" :value="item" />
          </el-select>
          <el-button type="text" class="ml10">添加账号</el-button>
        </el-form-item>
        <el-form-item label="">
          <el-button type="primary" @click="submit">确 定</el-button>
          <el-button @click="back">取 消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import { DeviceType } from '@/dics'

@Component({
  name: 'CreateDevice'
})
export default class extends Vue {
  private breadCrumbContent = ''
  private rules = {
    groupName: [
      { validator: this.validateDeviceName, trigger: 'blur' }
    ],
    deviceType: [
      { required: true, message: '请选择设备类型', trigger: 'change' }
    ],
    gbId: [
      { required: true, message: '请输入设备国标ID', trigger: 'blur' }
    ],
    gbIp: [
      { required: true, message: '请输入设备IP', trigger: 'blur' }
    ],
    gbPort: [
      { required: true, message: '请输入设备端口', trigger: 'blur' }
    ],
    gbAccount: [
      { required: true, message: '请选择账号', trigger: 'blur' }
    ]
  }
  private deviceVendorList = ['海康', '大宇', '其他']
  private deviceTypeList = Object.values(DeviceType)
  private gbAccountList = ['user1', 'user2']
  private form = {
    groupName: '',
    description: '',
    region: '华东',
    inProtocol: 'gb28181',
    outProtocol: [],
    pushDomainName: '',
    pullDomainName: ''
  }

  private validateDeviceName(rule: any, value: string, callback: Function) {
    if (!/[0-9a-zA-Z-]{4,16}/.test(value)) {
      callback(new Error('设备名称格式错误'))
    } else {
      callback()
    }
  }

  private mounted() {
    this.breadCrumbContent = this.$route.meta.title
  }

  private back() {
    this.$router.push('/device')
  }

  private submit() {
    const form: any = this.$refs.dataForm
    form.validate((valid: any) => {
      if (valid) {
        console.log('submit')
      } else {
        console.log('error submit!!')
        return false
      }
    })
  }
}
</script>

<style lang="scss" scoped>
  .el-input, .el-select, .el-textarea {
    width: 400px;
  }
</style>
