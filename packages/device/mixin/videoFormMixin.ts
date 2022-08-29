import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { DeviceEnum, DeviceTypeEnum, InVideoProtocolEnum } from '../enums'
import { VersionByInVideoProtocol } from '../dicts'
import { validGbId } from '../api/device'
import { getList as getGbList } from '@/api/certificate/gb28181'
import { checkVideoVisible } from '../utils/param'

@Component
export default class VideoFormMixin extends Vue {
  @Prop({ default: () => {} })
  public deviceForm
  public videoForm
  private versionByInVideoProtocol = VersionByInVideoProtocol

  public loading = {
    account: false
  }
  public dialog = {
    createGb28181Certificate: false
  }

  public orginalResourceIdList: Array<string> = []
  public gbAccountList = []

  public rules = {
    [DeviceEnum.InVideoProtocol]: [
      { required: true, message: '请选择接入协议', trigger: 'change' }
    ],
    [DeviceEnum.VideoVendor]: [
      { required: true, message: '请选择厂商', trigger: 'change' }
    ],
    [DeviceEnum.DeviceChannelSize]: [
      { required: true, message: '请填写子设备数量', trigger: 'blur' }
    ],
    [DeviceEnum.InUserName]: [
      { required: true, message: '请选择账号', trigger: 'change' }
    ],
    [DeviceEnum.PullUrl]: [
      { required: true, message: '请输入自定义设备拉流地址', trigger: 'blur' }
    ],
    [DeviceEnum.UserName]: [
      { required: true, message: '请输入用户名', trigger: 'blur' }
    ],
    [DeviceEnum.Password]: [
      { required: true, message: '请输入密码', trigger: 'blur' }
    ],
    [DeviceEnum.DeviceDomain]: [
      { required: true, message: '请输入设备域名', trigger: 'blur' },
      { validator: this.validateDeviceDomain, trigger: 'blur' }
    ],
    [DeviceEnum.DeviceIp]: [
      { required: true, message: '请输入设备IP', trigger: 'blur' },
      { validator: this.validateDeviceIp, trigger: 'blur' }
    ],
    [DeviceEnum.DevicePort]: [
      { required: true, message: '请输入设备端口', trigger: 'blur' },
      { validator: this.validateDevicePort, trigger: 'change' }
    ],
    [DeviceEnum.Resources]: [
      { required: true, validator: this.validateResources, trigger: 'blur' }
    ],
    [DeviceEnum.OutId]: [
      { validator: this.validateGbId, trigger: 'blur' }
    ]
  }

  /**
   * 设备类型变化
   */
  @Watch('deviceForm.deviceType')
  public deviceTypeChange() {
    this.videoForm.inVideoProtocol = InVideoProtocolEnum.Gb28181
  }

  /**
   * 视频接入协议变化
   */
  public inVideoProtocolChange(val) {
    this.$emit('inVideoProtocolChange', val)
    // 重置vendor
    this.videoForm.videoVendor = ''
    // 重置version
    const versionMap = VersionByInVideoProtocol[this.videoForm.inVideoProtocol]
    versionMap && (this.videoForm.inVersion = Object.values(versionMap)[0] as string)
  }

  /**
   * 获取国标账号
   */
  public async getGbAccounts() {
    try {
      this.loading.account = true
      const res = await getGbList({
        pageSize: 1000
      })
      this.gbAccountList = res.gbCerts
    } catch (e) {
      console.error(e)
    } finally {
      this.loading.account = false
    }
  }

  /**
   * 码流数变化回调
   */
  public onDeviceStreamSizeChange() {
    if (this.videoForm.deviceStreamSize < this.videoForm.deviceStreamPullIndex) {
      this.videoForm.deviceStreamPullIndex = this.videoForm.deviceStreamSize
    }
  }

  /**
   * 当资源包改变时获取资源包详情（包含接入剩余设备数）
   */
  public onResourceChange(payload: any) {
    this.resourcesMapping = payload.mapping
    const videoForm: any = this.$refs.videoForm
    !payload.isInit && videoForm.validateField(DeviceEnum.Resources)
  }

  // 接受子组件传来的VSSAIApps
  public changeVSSAIApps(res: any) {
    if (this.isUpdate) {
      this.videoForm.aIApps = res
    }
    this.videoForm.vssAIApps = res
  }

  /**
   * 判断是否显示form-item
   */
  public checkVisible(prop) {
    return checkVideoVisible.call(this.videoForm, this.deviceForm.deviceType, this.videoForm.inVideoProtocol, prop)
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
   * 校验资源包
   */
  public validateResources(rule: any, value: string, callback: Function) {
    let hasVideo = false
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const remainError: any = []
    this.videoForm.resources.forEach((resource: any) => {
      // 剩余可接入设备数
      const remainDeviceCount = parseInt(this.resourcesMapping[resource.resourceId] && this.resourcesMapping[resource.resourceId].remainDeviceCount)
      const devicesCount = this.deviceForm.deviceType === DeviceTypeEnum.Ipc ? 1 : this.deviceForm.deviceChannelSize
      // 如果当前resourceId不在orginalResourceIdList，则表示该类型的资源包的值被更改。如果未更改则需要跳过数量判断。
      const isChanged = this.orginalResourceIdList.indexOf(resource.resourceId) === -1
      switch (resource.resourceType) {
        case 'VSS_VIDEO':
          hasVideo = true
          if (isChanged && devicesCount > remainDeviceCount) {
            remainError.push('视频包')
          }
          break
        case 'VSS_AI':
          if (isChanged && devicesCount > remainDeviceCount) {
            remainError.push('AI包')
          }
          break
        case 'VSS_UPLOAD_BW':
          break
      }
    })
    if (remainError.length) {
      callback(new Error(`${remainError.join(',')}接入设备余量不足，请增加包资源！`))
    // } else if (!this.isUpdate && !hasVideo && !hasUpload && !this.isPrivateInNetwork && !this.isFreeUser) {
    //   callback(new Error('资源包必须配置视频包与上行带宽包'))
    } else if (!this.isUpdate && !hasVideo && !this.isFreeUser) {
      callback(new Error('必须配置视频包'))
    // } else if (!this.isUpdate && !hasUpload && !this.isPrivateInNetwork && !this.isFreeUser) {
    //   callback(new Error('必须配置上行带宽包'))
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
  public validateDevicePort(rule: any, value: string, callback: Function) {
    if (value && !/^[0-9]+$/.test(value)) {
      callback(new Error('设备端口仅支持数字'))
    } else {
      callback()
    }
  }

  /**
   * 校验设备国标ID
   */
  public async validateGbId(rule: any, value: string, callback: Function) {
    let validInfo: any
    if (value && !/^[0-9]{20}$/.test(value)) {
      callback(new Error('请输入规范国标ID'))
    } else if (value) {
      try {
        validInfo = await validGbId({
          deviceId: this.deviceId,
          inProtocol: this.videoForm.inVideoProtocol,
          gbId: this.videoForm.outId
        })
        if (validInfo && !validInfo.isValidGbId) {
          callback(new Error('存在重复国标ID'))
        } else {
          callback()
        }
      } catch (e) {
        console.log(e)
      }
    } else {
      callback()
    }
  }
}
