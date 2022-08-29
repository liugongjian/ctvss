<template>
  <div>
    <el-form
      ref="viidForm"
      :rules="rules"
      :model="viidForm"
      label-position="right"
      label-width="135px"
    >
      <el-form-item label="接入协议:" :prop="deviceEnum.InViidProtocol">
        <el-radio
          v-for="(value, key) in inViidProtocol"
          :key="key"
          v-model="viidForm.inViidProtocol"
          :label="key"
        >
          {{ value }}
        </el-radio>
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.LowerApsId)" label="视图编码:" :prop="deviceEnum.LowerApsId">
        <el-input v-model="viidForm.apsId" />
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.ProtocolDeviceType)" label="接入类型:" :prop="deviceEnum.ProtocolDeviceType">
        <el-select
          v-model="viidForm.protocolDeviceType"
          placeholder="请选择"
        >
          <el-option
            v-for="(value, key) in protocolDeviceTypeByDeviceType[deviceForm.deviceType]"
            :key="key"
            :label="value"
            :value="key"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.InUserName)" label="GA1400凭证:" :prop="deviceEnum.InUserName">
        <certificate-select v-model="viidForm.inUserName" :type="inViidProtocolEnum.Ga1400" />
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.Ip)" label="平台IP:" :prop="deviceEnum.Ip">
        <el-input v-model="viidForm.ip" placeholder="请输入平台IP" />
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.Port)" label="端口:" :prop="deviceEnum.Port">
        <el-input v-model.number="viidForm.port" placeholder="请输入端口" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { InViidProtocol, ProtocolDeviceTypeByDeviceType } from '../../dicts/index'
import { DeviceEnum, InViidProtocolEnum } from '../../enums/index'
import { checkViidVisible } from '../../utils/param'
import CertificateSelect from '../../components/CertificateSelect.vue'

@Component({
  name: 'ViidCreateForm',
  components: {
    CertificateSelect
  }
})
export default class extends Vue {
  @Prop({ default: () => {} })
  private deviceForm

  private deviceEnum = DeviceEnum
  private inViidProtocolEnum = InViidProtocolEnum
  private inViidProtocol = InViidProtocol
  private protocolDeviceTypeByDeviceType = ProtocolDeviceTypeByDeviceType
  private ga1400AccountList = []
  private viidForm = {
    [DeviceEnum.InViidProtocol]: InViidProtocolEnum.Ga1400,
    [DeviceEnum.LowerApsId]: '',
    [DeviceEnum.ProtocolDeviceType]: '',
    [DeviceEnum.InUserName]: '',
    [DeviceEnum.Ip]: '',
    [DeviceEnum.Port]: ''
  }
  private rules = {
    [DeviceEnum.InViidProtocol]: [
      { required: true, message: '请选择接入协议', trigger: 'change' }
    ],
    [DeviceEnum.LowerApsId]: [
      { required: true, message: '请输入视图编码', trigger: 'blur' },
      { validator: this.validateApsId, trigger: 'blur' }
    ],
    [DeviceEnum.ProtocolDeviceType]: [
      { required: true, message: '请选择设备类型', trigger: 'change' }
    ],
    [DeviceEnum.InUserName]: [
      { required: true, message: '请选择账号', trigger: 'change' }
    ],
    [DeviceEnum.Ip]: [
      { required: true, message: '请输入平台IP', trigger: 'blur' },
      { validator: this.validateDeviceIp, trigger: 'blur' }
    ],
    [DeviceEnum.Port]: [
      { required: true, message: '请输入端口', trigger: 'blur' },
      { validator: this.validateDevicePort, trigger: 'change' }
    ]
  }

  @Watch('deviceForm.deviceType')
  private deviceTypeChange() {
    this.viidForm.protocolDeviceType = ''
  }

  private checkVisible(prop) {
    return checkViidVisible.call(this.viidForm, this.deviceForm.deviceType, this.viidForm.inViidProtocol, prop)
  }

  /**
   * 校验viid表单
   */
  private validateViidForm() {
    let validFlag = true
    const viidForm: any = this.$refs.viidForm
    viidForm.validate((valid) => {
      validFlag = valid
    })
    return validFlag
  }

  /**
   * 校验视图编码
   */
  private validateApsId(rule: any, value: string, callback: Function) {
    if (!/^[0-9]{20}$/.test(value)) {
      callback(new Error('视图标编码为20位数字'))
    } else {
      callback()
    }
  }
}
</script>
