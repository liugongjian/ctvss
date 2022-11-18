import { Component, Vue } from 'vue-property-decorator'
import { DeviceBasicForm, DeviceAddress } from '../type/Device'
import { DeviceEnum } from '../enums'
import AddressCascader from '../components/AddressCascader.vue'
import RegionCascader from '../components/RegionCascader.vue'

@Component({
  components: {
    AddressCascader,
    RegionCascader
  }
})
export default class DeviceFormMixin extends Vue {
  public deviceForm: DeviceBasicForm

  public rules = {
    [DeviceEnum.DeviceName]: [
      { required: true, message: '请输入设备名称', trigger: 'blur' },
      { validator: this.validateDeviceName, trigger: 'blur' }
    ],
    [DeviceEnum.DeviceType]: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
    longlat: [
      { required: true, message: '请选择经纬度', trigger: 'blur' },
      { validator: this.validateLonglat, trigger: 'blur' }
    ],
    [DeviceEnum.DeviceVendor]: [{ required: true, message: '请选择厂商', trigger: 'change' }],
    [DeviceEnum.Region]: [{ required: true, message: '请选择区域', trigger: 'change' }],
    [DeviceEnum.InOrgRegion]: [{ required: true, message: '请选择设备地址', trigger: 'change' }],
    [DeviceEnum.IndustryCode]: [{ required: true, message: '请选择所属行业', trigger: 'blur' }],
    [DeviceEnum.NetworkCode]: [{ required: true, message: '请选择网络标识', trigger: 'blur' }],
    [DeviceEnum.DeviceIp]: [{ validator: this.validateDeviceIp, trigger: 'blur' }],
    [DeviceEnum.DevicePort]: [{ validator: this.validateDevicePort, trigger: 'change' }],
    [DeviceEnum.DevicePoleId]: [{ validator: this.validatePoleId, trigger: 'blur' }],
    [DeviceEnum.DeviceMac]: [{ validator: this.validateMacAddr, trigger: 'blur' }]
  }

  public loading = {
    submit: false
  }

  /**
   * 选择设备地址
   */
  public onDeviceAddressChange(region: DeviceAddress) {
    this.deviceForm.inOrgRegion = region.code
    this.deviceForm.inOrgRegionLevel = region.level
  }

  /**
   * 校验设备/通道名称
   */
  public validateDeviceName(rule: any, value: string, callback: Function) {
    if (!/^[\u4e00-\u9fa50-9a-zA-Z-()（）_\s]{2,64}$/.test(value)) {
      callback(
        new Error(
          '设备或通道名称格式错误。2-64位，可包含大小写字母、数字、中文、中划线、下划线、小括号、空格。'
        )
      )
    } else if (/^[\s]|[\s]$/.test(value)) {
      callback(new Error('不能以空格作为名称的首尾。'))
    } else {
      callback()
    }
  }

  /**
   * 校验经纬度
   */
  public validateLonglat(rule: any, value: string, callback: Function) {
    if (this.deviceForm.deviceLongitude === '' || this.deviceForm.deviceLatitude === '') {
      callback(new Error('请填写经度及纬度坐标'))
    } else if (
      !/^[-+]?(0(\.\d{1,14})?|([1-9](\d)?)(\.\d{1,14})?|1[0-7]\d{1}(\.\d{1,14})?|180\.0{1,14})$/.test(
        this.deviceForm.deviceLongitude
      )
    ) {
      callback(new Error('经度坐标格式错误'))
    } else if (!/^[-+]?((0|([1-9]\d?))(\.\d{1,14})?|90(\.0{1,14})?)$/.test(this.deviceForm.deviceLatitude)) {
      callback(new Error('纬度坐标格式错误'))
    } else {
      callback()
    }
  }

  /**
   * 校验设备IP格式
   */
  public validateDeviceIp(rule: any, value: string, callback: Function) {
    if (value && !/^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/.test(value)) {
      callback(new Error('设备IP格式不正确'))
    } else {
      callback()
    }
  }

  /**
   * 校验端口号
   */
  public validateDevicePort(rule: any, value: number, callback: Function) {
    if (value && !/^[0-9]+$/.test(value.toString())) {
      callback(new Error('设备端口仅支持数字'))
    } else if (value === 0) {
      callback(new Error('设备端口号不能为0'))
    } else {
      callback()
    }
  }

  /*
   * 校验设备Domain格式
   */
  public validateDeviceDomain(rule: any, value: string, callback: Function) {
    if (value && !/^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?$/.test(value)) {
      callback(new Error('设备域名格式不正确。正确域名格式例如: www.domain.com'))
    } else {
      callback()
    }
  }

  /**
   * 校验通道号
   */
  public validateChannelNum(rule: any, value: string, callback: Function) {
    if (!/^[0-9]+$/.test(value)) {
      callback(new Error('设备号仅支持数字'))
    } else {
      callback()
    }
  }

  /**
   * 校验杆号
   */
  public async validatePoleId(rule: any, value: string, callback: Function) {
    if (value && !/^[\w]{1,21}$/.test(value)) {
      callback(new Error('请输入规范杆号'))
    } else {
      callback()
    }
  }

  /**
   * 校验MAC地址
   */
  public async validateMacAddr(rule: any, value: string, callback: Function) {
    const reg1 = /^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/
    const reg2 = /^([0-9A-Fa-f]{2}[-]){5}([0-9A-Fa-f]{2})$/
    if (value && !reg1.test(value) && !reg2.test(value)) {
      callback(new Error('请输入规范MAC地址'))
    } else {
      callback()
    }
  }
}
