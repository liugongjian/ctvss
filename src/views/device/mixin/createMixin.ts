import { Component, Watch, Vue, Inject } from 'vue-property-decorator'
import { GroupModule } from '@/store/modules/group'
import { DeviceModule } from '@/store/modules/device'

@Component
export default class CreateMixin extends Vue {
  @Inject('deviceRouter') public deviceRouter!: Function
  @Inject('initDirs') public initDirs!: Function
  public form: any = {}
  public resourcesMapping: any = {}

  public loading = {
    account: false,
    device: false
  }

  public submitting = false

  public deviceVendorList = ['海康', '大华', '宇视', '其他']

  public tips = {
    createSubDevice: '当开启自动创建NVR子设备时，系统将自动为子设备分配通道号和通道名称。',
    pullType: '当启用自动拉流，设备注册成功后自动启动拉流。关闭该选项后需要通过触发的方式启动拉流。',
    pushType: '自动激活推流地址，设备创建完成后，平台立刻自动生成推流地址。关闭该选项后需要通过触发的方式生成推流地址。',
    transPriority: '开启优先TCP传输时，设备进行视频邀约时优先使用TCP协议接入到视频监控服务中。关闭时则优先使用UDP协议接入。'
  }

  public get currentGroup() {
    return GroupModule.group
  }

  public get inProtocol() {
    return this.$route.query.inProtocol
  }

  public get inProtocolUpper() {
    return this.$route.query.inProtocol ? this.$route.query.inProtocol.toString().toLocaleUpperCase() : ''
  }

  public get deviceId() {
    return this.$route.query.deviceId ? this.$route.query.deviceId.toString() : ''
  }

  public get dirId() {
    return this.$route.query.dirId ? this.$route.query.dirId.toString() : '0'
  }

  public get isUpdate() {
    return this.$route.name === 'device-update'
  }

  public get isChannel() {
    return this.$route.query.isChannel === 'true' || (this.form.parentDeviceId && this.form.parentDeviceId !== '-1')
  }

  public get breadcrumb() {
    return DeviceModule.breadcrumb
  }

  private get breadCrumbContent() {
    let title = this.$route.meta.title
    if (this.isChannel) {
      title = title.replace('设备', '子设备')
    }
    return title
  }

  @Watch('currentGroup', { immediate: true, deep: true })
  public onGroupChange() {
    if (this.currentGroup && !this.isUpdate) {
      this.form.pullType = this.currentGroup.pullType
      this.form.pushType = this.currentGroup.pushType
      this.form.groupId = this.currentGroup.groupId
    }
  }

  /**
   * 当资源包改变时获取资源包详情（包含接入剩余设备数）
   */
  public onResourceChange(payload: any) {
    this.resourcesMapping = payload.mapping
    const form: any = this.$refs.dataForm
    !payload.isInit && form.validateField('resources')
  }

  /**
   * 清空验证信息
   */
  public clearValidate() {
    const form: any = this.$refs.dataForm
    form.clearValidate()
  }

  /**
   * 返回
   */
  public back() {
    if (this.isUpdate) {
      this.deviceRouter({
        type: 'detail',
        id: this.$route.query.deviceId
      })
    } else if (this.isChannel) {
      this.deviceRouter({
        type: 'nvr',
        id: this.$route.query.deviceId
      })
    } else {
      this.deviceRouter({
        type: 'dir',
        id: this.$route.query.dirId
      })
    }
  }

  /**
   * 校验设备/通道名称
   */
  public validateDeviceName(rule: any, value: string, callback: Function) {
    if (!/^[\u4e00-\u9fa50-9a-zA-Z-]{2,16}$/.test(value)) {
      callback(new Error('设备或通道名称格式错误。2-16位，可包含大小写字母、数字、中文、中划线。'))
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
   * 校验资源包
   */
  public validateResources(rule: any, value: string, callback: Function) {
    let hasVideo = false
    let hasUpload = false
    const remainError: any = []
    this.form.resources.forEach((resource: any) => {
      // 剩余可接入设备数
      const remainDeviceCount = parseInt(this.resourcesMapping[resource.resourceId] && this.resourcesMapping[resource.resourceId].remainDeviceCount)
      const devicesCount = this.form.deviceType === 'ipc' ? 1 : this.form.channelSize
      switch (resource.resourceType) {
        case 'VSS_VIDEO':
          hasVideo = true
          if (devicesCount > remainDeviceCount) {
            remainError.push('视频包')
          }
          break
        case 'VSS_AI':
          if (devicesCount > remainDeviceCount) {
            remainError.push('AI包')
          }
          break
        case 'VSS_UPLOAD_BW':
          hasUpload = true
          break
      }
    })
    if (remainError.length) {
      callback(new Error(`${remainError.join(',')}接入设备余量不足，请增加包资源！`))
    } else if (!this.isUpdate && !hasVideo && !hasUpload) {
      callback(new Error('资源包必须配置视频包与上行带宽包'))
    } else if (!this.isUpdate && !hasVideo) {
      callback(new Error('必须配置视频包'))
    } else if (!this.isUpdate && !hasUpload) {
      callback(new Error('必须配置上行带宽包'))
    } else {
      callback()
    }
  }
}
