<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
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
      <template v-if="!isNVR">
        <el-form-item label="设备类型:" prop="deviceType">
          <el-select v-model="form.deviceType" placeholder="请选择">
            <el-option v-for="item in deviceTypeList" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.deviceType === 'NVR'" label="自动创建子设备:" prop="createSubDevice" class="form-with-tip">
          <el-switch v-model="form.createSubDevice" />
          <div class="form-tip">当开启自动创建NVR子设备时，系统将自动为子设备分配通道号和通道名称。</div>
        </el-form-item>
        <el-form-item v-if="form.deviceType === 'NVR' && form.createSubDevice" label="子设备数量:" prop="channelSize">
          <el-input-number v-model="form.channelSize" type="number" />
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
        <el-form-item label="设备IP:" prop="gbIp">
          <el-input v-model="form.gbIp" />
        </el-form-item>
        <el-form-item label="设备端口:" prop="gbPort">
          <el-input v-model="form.gbPort" />
        </el-form-item>
        <el-form-item label="GB28181账号:" prop="gbAccount">
          <el-select v-model="form.gbAccount">
            <el-option v-for="item in gbAccountList" :key="item" :label="item" :value="item" />
          </el-select>
          <el-button type="text" class="ml10" @click="openDialog('createGb28181Certificate')">新建账号</el-button>
        </el-form-item>
      </template>
      <template v-else>
        <el-form-item label="厂商:" prop="deviceVendor">
          <el-select v-model="form.deviceVendor">
            <el-option v-for="item in deviceVendorList" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="通道号:" prop="channelNum">
          <el-input v-model="form.channelNum" />
        </el-form-item>
        <el-form-item label="通道名称:" prop="channelName" class="form-with-tip">
          <el-input v-model="form.channelName" />
          <div class="form-tip">4-16位，可包含大小写字母、数字、中划线。</div>
        </el-form-item>
      </template>
      <el-form-item label="">
        <el-button type="primary" @click="submit">确 定</el-button>
        <el-button @click="back">取 消</el-button>
      </el-form-item>
    </el-form>
    <create-gb28181-certificate v-if="dialog.createGb28181Certificate" @on-close="closeDialog('createGb28181Certificate')" />
  </div>
</template>
<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import { DeviceType } from '@/dics'
import CreateGb28181Certificate from '@/views/certificate/gb28181/components/CreateDialog.vue'

@Component({
  name: 'CreateDevice',
  components: {
    CreateGb28181Certificate
  }
})
export default class extends Vue {
  private rules = {
    deviceName: [
      { required: true, message: '请输入设备名称', trigger: 'blur' },
      { validator: this.validateDeviceName, trigger: 'blur' }
    ],
    channelName: [
      { required: true, message: '请输入通道名称', trigger: 'blur' },
      { validator: this.validateDeviceName, trigger: 'blur' }
    ],
    deviceType: [
      { required: true, message: '请选择设备类型', trigger: 'change' }
    ],
    channelSize: [
      { required: true, message: '请填写子设备数量', trigger: 'blur' }
    ],
    channelNum: [
      { required: true, message: '请填写通道号', trigger: 'blur' },
      { validator: this.validateChannelNum, trigger: 'blur' }
    ],
    gbAccount: [
      { required: true, message: '请选择账号', trigger: 'change' }
    ]
  }
  private deviceVendorList = ['海康', '大宇', '其他']
  private deviceTypeList = Object.values(DeviceType)
  private gbAccountList = ['user1', 'user2']
  private form = {
    deviceName: '',
    description: '',
    createSubDevice: true,
    region: '华东',
    inProtocol: 'gb28181',
    outProtocol: [],
    pushDomainName: '',
    pullDomainName: ''
  }
  private dialog = {
    createGb28181Certificate: false
  }

  private get isNVR() {
    return this.$route.query.type === 'nvr'
  }

  private get breadCrumbContent() {
    let title = this.$route.meta.title
    if (this.isNVR) {
      title = title.replace('设备', '子设备')
    }
    return title
  }

  /**
   * 校验设备/通道名称
   */
  private validateDeviceName(rule: any, value: string, callback: Function) {
    if (!/[0-9a-zA-Z-]{4,16}/.test(value)) {
      callback(new Error('设备名称格式错误'))
    } else {
      callback()
    }
  }

  /**
   * 校验通道号
   */
  private validateChannelNum(rule: any, value: string, callback: Function) {
    if (!/^[0-9]+$/.test(value)) {
      callback(new Error('设备号仅支持数字'))
    } else {
      callback()
    }
  }

  private openDialog(type: string) {
    // @ts-ignore
    this.dialog[type] = true
  }

  private closeDialog(type: string) {
    // @ts-ignore
    this.dialog[type] = false
  }

  private back() {
    this.$router.push({
      name: 'device-list',
      query: this.$route.query
    })
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
