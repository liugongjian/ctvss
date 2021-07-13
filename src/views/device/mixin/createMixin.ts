import { Component, Watch, Vue, Inject } from 'vue-property-decorator'
import { GroupModule } from '@/store/modules/group'
import { DeviceModule } from '@/store/modules/device'
import { regionList } from '@/assets/region/lianzhouRegion'
import { getLianzhouArea } from '@/api/device'

@Component
export default class CreateMixin extends Vue {
  @Inject('deviceRouter') public deviceRouter!: Function
  @Inject('initDirs') public initDirs!: Function
  public form: any = {}

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
   * 针对连州设备管理
   */
  public lianzhouFlag: boolean = false
  public regionList = regionList
  public lianzhouRegionProps: any = {
    value: 'code',
    label: 'name',
    children: 'children'
  }
  // 动态变化
  public lianzhouAddressChange() {
    const addressCascader: any = this.$refs['addressCascader']
    if (addressCascader) {
      const currentAddress = addressCascader.getCheckedNodes()[0].data
      this.form.gbRegion = currentAddress.code
      this.form.gbRegionLevel = currentAddress.level
    }
  }
  public async regionChange(val: any) {
    if (val.length !== 3 || !val[0] || !val[1] || !val[2]) {
      return
    }
    let index1 = this.regionList.findIndex((item: any) => {
      return item.code === val[0]
    })
    if (index1 !== -1) {
      let index2 = this.regionList[index1].children.findIndex((item: any) => {
        return item.code === val[1]
      })
      if (index2 !== -1) {
        let index3 = this.regionList[index1].children[index2].children.findIndex((item: any) => {
          return item.code === val[2]
        })
        if (index2 !== -1) {
          this.regionList[index1].children[index2].children[index3].children = await this.getExpandList()
        }
      }
    }
  }
  /**
   * 加载公安局列表（连州）
   */
  public async getExpandList() {
    let res = await getLianzhouArea({
      pid: 441882,
      level: 5
    })
    return res.areas.map((item: any) => {
      return {
        name: item.name,
        code: item.id,
        level: item.level
      }
    })
  }
  public async lianzhouCascaderInit() {
    let list = [
      parseInt(this.form.gbRegion.substring(0, 2)),
      parseInt(this.form.gbRegion.substring(0, 4)),
      parseInt(this.form.gbRegion.substring(0, 6))
    ]
    await this.regionChange(list)
    this.form.address = [...list, this.form.gbRegion]
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
   * 校验经纬度
   */
  public validateLonglat(rule: any, value: string, callback: Function) {
    if (!this.form.deviceLongitude || !this.form.deviceLatitude) {
      callback(new Error('请填写经度及纬度坐标'))
    } else if (!/^[-+]?(0(\.\d{1,10})?|([1-9](\d)?)(\.\d{1,10})?|1[0-7]\d{1}(\.\d{1,10})?|180\.0{1,10})$/.test(this.form.deviceLongitude)) {
      callback(new Error('经度坐标格式错误'))
    } else if (!/^[-+]?((0|([1-8]\d?))(\.\d{1,10})?|90(\.0{1,10})?)$/.test(this.form.deviceLatitude)) {
      callback(new Error('纬度坐标格式错误'))
    } else {
      callback()
    }
  }
}
