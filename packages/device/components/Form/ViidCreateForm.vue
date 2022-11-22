<template>
  <el-form
    ref="viidForm"
    :rules="rules"
    :model="viidForm"
    label-position="right"
    label-width="165px"
  >
    <div class="two-column-wrap">
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
      <el-form-item v-if="checkVisible(deviceEnum.OutId)" label="视图编码:" :prop="deviceEnum.OutId">
        <el-input v-model="viidForm.OutId" />
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.DeviceType)" label="接入类型:" :prop="deviceEnum.DeviceType">
        <el-select
          v-model="viidForm.deviceType"
          placeholder="请选择"
        >
          <el-option
            v-for="(value, key) in viidDeviceTypeByDeviceType[deviceForm.deviceType]"
            :key="key"
            :label="value"
            :value="key"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.InUserId)" label="GA1400凭证:" :prop="deviceEnum.InUserId">
        <certificate-select v-model="viidForm.inUserId" :type="inViidProtocolEnum.Ga1400" />
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.Ip)" label="平台IP:" :prop="deviceEnum.Ip">
        <el-input v-model="viidForm.ip" placeholder="请输入平台IP" />
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.Port)" label="端口:" :prop="deviceEnum.Port">
        <el-input v-model.number="viidForm.port" placeholder="请输入端口" />
      </el-form-item>
    </div>
  </el-form>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { InViidProtocol, ViidDeviceTypeByDeviceType, InViidProtocolModelMapping } from '@vss/device/dicts/index'
import { DeviceEnum, InViidProtocolEnum } from '@vss/device/enums/index'
import { Device, ViidDevice, DeviceBasicForm, ViidDeviceForm } from '@vss/device/type/Device'
import { checkViidVisible } from '@vss/device/utils/param'
import CertificateSelect from '@vss/device/components/CertificateSelect.vue'

@Component({
  name: 'ViidCreateForm',
  components: {
    CertificateSelect
  }
})
export default class extends Vue {
  @Prop() private device: Device
  @Prop({ default: {} })
  private deviceForm: DeviceBasicForm

  private deviceEnum = DeviceEnum
  private inViidProtocolEnum = InViidProtocolEnum
  private inViidProtocol = InViidProtocol
  private viidDeviceTypeByDeviceType = ViidDeviceTypeByDeviceType
  private ga1400AccountList = []
  public viidForm: ViidDeviceForm = {}
  private rules = {
    [DeviceEnum.InViidProtocol]: [
      { required: true, message: '请选择接入协议', trigger: 'change' }
    ],
    [DeviceEnum.OutId]: [
      { required: true, message: '请输入视图编码', trigger: 'blur' },
      { validator: this.validateApsId, trigger: 'blur' }
    ],
    [DeviceEnum.DeviceType]: [
      { required: true, message: '请选择设备类型', trigger: 'change' }
    ],
    [DeviceEnum.InUserId]: [
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

  // 视图库接入协议
  private get inProtocol() {
    return (this.device && this.device.viids && this.device.viids.length && this.device.viids[0].inViidProtocol) || null
  }

  // 视图库接入信息
  private get viidInfo(): ViidDevice {
    if (this.device && this.device.viids) {
      return (this.inProtocol && this.device.viids[0][InViidProtocolModelMapping[this.inProtocol]]) || {} as ViidDevice
    } else {
      return {}
    }
  }

  @Watch('device', {
    immediate: true
  })
  private onDeviceChange() {
    this.viidForm = {
      [DeviceEnum.InViidProtocol]: this.inProtocol || InViidProtocolEnum.Ga1400,
      [DeviceEnum.OutId]: this.viidInfo.outId,
      [DeviceEnum.DeviceType]: this.viidInfo.deviceType,
      [DeviceEnum.InUserId]: this.viidInfo.inUserId,
      [DeviceEnum.Ip]: this.viidInfo.ip,
      [DeviceEnum.Port]: +this.viidInfo.port === 0 ? null : this.viidInfo.port
    }
  }

  @Watch('videoForm.deviceType')
  private deviceTypeChange() {
    this.viidForm.deviceType = ''
  }

  private checkVisible(prop) {
    return checkViidVisible.call(this.viidForm, this.deviceForm.deviceType, this.viidForm.inViidProtocol, prop)
  }

  /**
   * 校验viid表单
   */
  public validateViidForm() {
    const viidForm: any = this.$refs.viidForm
    return new Promise((resolve) => {
      viidForm.validate((valid) => {
        resolve(valid)
      })
    })
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


  /**
   * 校验设备IP格式
   */
  private validateDeviceIp(rule: any, value: string, callback: Function) {
    if (value && !/^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/.test(value)) {
      callback(new Error('设备IP格式不正确'))
    } else {
      callback()
    }
  }

  /**
   * 校验端口号
   */
  private validateDevicePort(rule: any, value: number, callback: Function) {
    if (value && !/^[0-9]+$/.test(value.toString())) {
      callback(new Error('设备端口仅支持数字'))
    } else if (value === 0) {
      callback(new Error('设备端口号不能为0'))
    } else {
      callback()
    }
  }
}
</script>
