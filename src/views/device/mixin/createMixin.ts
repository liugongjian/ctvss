import { Component, Watch, Vue, Inject } from 'vue-property-decorator'
import { GroupModule } from '@/store/modules/group'
import { UserModule } from '@/store/modules/user'
import { DeviceModule } from '@/store/modules/device'
import { getChildAddress } from '@/api/device'
import { getDeviceResources } from '@/api/billing'
import { DeviceTips } from '@/dics/tips'
import { industryMap } from '@/assets/region/industry'
import { networkMap } from '@/assets/region/network'
import { allRegionList } from '@/assets/region/region'
import { suffixZero } from '@/utils/number'

@Component
export default class CreateMixin extends Vue {
  @Inject({ from: 'deviceRouter', default: null }) public deviceRouter!: Function
  @Inject({ from: 'initDirs', default: null }) public initDirs!: Function
  public form: any = {}
  public resourcesMapping: any = {}
  public orginalResourceIdList: Array<string> = []
  public orginalChannelSize = 0
  public inNetworkType = ''
  public addressProps: any = {
    value: 'code',
    label: 'name',
    children: 'children',
    checkStrictly: 'true',
    lazy: true,
    lazyLoad: this.loadChildAddress
  }

  public loading = {
    account: false,
    device: false
  }

  public submitting = false

  public deviceVendorList = ['海康', '大华', '宇视', '科达', '华为', '其他']

  public tips = DeviceTips

  public regionList: any = []

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

  public get isPrivateInNetwork() {
    // 移植到这里统一判断
    return this.inNetworkType ? this.inNetworkType !== 'public' : this.currentGroup?.inNetworkType !== 'public'
  }

  public get isFreeUser() {
    return UserModule.tags && UserModule.tags.resourceFree === '1'
  }

  private get breadCrumbContent() {
    let title = this.$route.meta.title
    if (this.isChannel) {
      title = title.replace('设备', '子设备')
    }
    return title
  }

  public get industryList() {
    return Object.keys(industryMap).map((key: any) => {
      return {
        name: industryMap[key],
        value: key
      }
    })
  }

  public get networkList() {
    return Object.keys(networkMap).map((key: any) => {
      return {
        name: networkMap[key],
        value: key
      }
    })
  }

  /**
   * 针对网络标识
   */
  public get networkFlag() {
    return this.$store.state.user.tags.isNeedDeviceNetworkCode === 'Y'
  }

  @Watch('currentGroup', { immediate: true, deep: true })
  public onGroupChange() {
    if (this.currentGroup && !this.isUpdate) {
      this.form.pullType = this.currentGroup.pullType
      this.form.pushType = this.currentGroup.pushType
      this.form.groupId = this.currentGroup.groupId
    }
  }

  public mounted() {
    this.form.gbRegion = this.currentGroup!.gbRegion
    this.cascaderInit()
    this.form.industryCode = this.currentGroup!.industryCode
    this.form.networkCode = this.currentGroup!.networkCode
  }

  /**
   * 将gbRegion转成el-cascader格式的数组
   */
  public async cascaderInit() {
    this.regionList = allRegionList
    if (!this.form.gbRegion) return
    const list = []
    for (let i = 0; i < 4; i++) {
      if (parseInt(this.form.gbRegion!.substring(i * 2, i * 2 + 2)) !== 0) {
        list.push(parseInt(this.form.gbRegion!.substring(0, (i + 1) * 2)))
      }
    }
    await this.regionChange(list)
    this.$nextTick(() => {
      this.form.address = list
      this.addressChange()
    })
  }

  /**
   * 填充需要动态设置的第4级地址列表
   */
  public async regionChange(val: any) {
    if (val.length !== 4 || !val[0] || !val[1] || !val[2] || !val[3]) {
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
        if (index3 !== -1) {
          this.regionList[index1].children[index2].children[index3].children = await getChildAddress(val[2], 4)
        }
      }
    }
  }

  /**
   * 当选中设备地址变化时触发
   */
  public async addressChange() {
    if (!this.form.address) return
    const addressCascader: any = this.$refs['addressCascader']
    if (addressCascader && addressCascader.getCheckedNodes()[0]) {
      addressCascader.dropDownVisible = false // 选择后自动关闭弹框
      const currentAddress = addressCascader.getCheckedNodes()[0].data
      this.form.gbRegion = suffixZero(currentAddress.code, 8) // 不足8位的补0
      this.form.gbRegionLevel = currentAddress.level
    }
  }

  /**
   * 动态加载级联地址子集
   */
  public async loadChildAddress(node, resolve) {
    if (node.level < 3) { // level1-3是前端保存的静态省市区数据
      resolve()
      return
    }
    let list = await getChildAddress(node.data.code, node.level + 1)
    resolve(list)
  }

  /*
   * 获取绑定资源包列表
   */
  public async getDeviceResources(deviceId: number, deviceType: string, inProtocol: string) {
    try {
      const resourcesRes = await getDeviceResources({
        deviceId: deviceId,
        deviceType: deviceType,
        inProtocol: inProtocol
      })
      this.inNetworkType = resourcesRes.inNetworkType
      this.form.resources = resourcesRes.resources
      this.orginalResourceIdList = resourcesRes.resources.map((resource: any) => resource.resourceId)
    } catch (e) {
      throw new Error(e)
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
   * 提交验证
   */
  public beforeSubmit(submit: Function) {
    const form: any = this.$refs.dataForm
    form.validate((valid: any) => {
      if (valid) {
        // 判断通道数量的变化
        let alertMsg = []
        if (this.form.channelSize < this.orginalChannelSize) {
          alertMsg.push('缩减子设备的数量将会释放相应包资源。')
        } else if (this.form.channelSize > this.orginalChannelSize) {
          alertMsg.push('新增子设备将自动绑定到现有资源包。')
        }
        // 判断是否未选资源包
        const hasResource: any = {
          VSS_VIDEO: {
            isSelect: false,
            msg: '不绑定任何视频包，会导致设备无法上线。'
          },
          VSS_AI: {
            isSelect: false,
            msg: '不绑定任何AI包，会导致AI服务不可用。'
          },
          VSS_UPLOAD_BW: {
            isSelect: false,
            msg: '不绑定任何上行带宽包，会导致视频流无法上线。'
          }
        }
        this.form.resources.forEach((resource: any) => {
          hasResource[resource.resourceType].isSelect = true
        })
        for (let key in hasResource) {
          if (key === 'VSS_UPLOAD_BW' && this.isPrivateInNetwork) continue
          if (key === 'VSS_AI' && this.form.inProtocol !== 'gb28181') continue
          const resource = hasResource[key]
          if (!resource.isSelect) {
            alertMsg.push(resource.msg)
          }
        }
        if (!this.isFreeUser && this.isUpdate && alertMsg.length) {
          const h: Function = this.$createElement
          this.$msgbox({
            title: '提示',
            message: h('div', { class: 'alert-message-list' }, [
              h(
                'ul',
                undefined,
                alertMsg.map((msg: string) => {
                  return h('li', undefined, msg)
                })
              )
            ]),
            showCancelButton: true,
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            beforeClose: async(action: any, instance: any, done: Function) => {
              if (action === 'confirm') {
                instance.confirmButtonLoading = true
                instance.confirmButtonText = '提交中...'
                try {
                  await submit()
                  done()
                } finally {
                  instance.confirmButtonLoading = false
                  instance.confirmButtonText = '确定'
                }
              } else {
                done()
              }
            }
          }).catch((e) => {
            if (e === 'cancel' || e === 'close') return
            this.$message.error(e)
          })
        } else {
          submit()
        }
      } else {
        return false
      }
    })
  }

  /**
   * 校验设备/通道名称
   */
  public validateDeviceName(rule: any, value: string, callback: Function) {
    if (!/^[\u4e00-\u9fa50-9a-zA-Z-()（）_\s]{2,64}$/.test(value)) {
      callback(new Error('设备或通道名称格式错误。2-64位，可包含大小写字母、数字、中文、中划线、下划线、小括号、空格。'))
    } else if (/^[\s]|[\s]$/.test(value)) {
      callback(new Error('不能以空格作为名称的首尾。'))
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
    } else if (!/^[-+]?((0|([1-9]\d?))(\.\d{1,10})?|90(\.0{1,10})?)$/.test(this.form.deviceLatitude)) {
      callback(new Error('纬度坐标格式错误'))
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
   * 校验资源包
   */
  public validateResources(rule: any, value: string, callback: Function) {
    let hasVideo = false
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let hasUpload = false
    const remainError: any = []
    this.form.resources.forEach((resource: any) => {
      // 剩余可接入设备数
      const remainDeviceCount = parseInt(this.resourcesMapping[resource.resourceId] && this.resourcesMapping[resource.resourceId].remainDeviceCount)
      const devicesCount = this.form.deviceType === 'ipc' ? 1 : this.form.channelSize
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
          hasUpload = true
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
   * 校验通道号
   */
  public validateChannelNum(rule: any, value: string, callback: Function) {
    if (!/^[0-9]+$/.test(value)) {
      callback(new Error('设备号仅支持数字'))
    } else {
      callback()
    }
  }

  // 接受子组件传来的VSSAIApps
  private changeVSSAIApps(res:any) {
    if (this.isUpdate) {
      this.form.aIApps = res
    }
    this.form.vssAIApps = res
  }
}
