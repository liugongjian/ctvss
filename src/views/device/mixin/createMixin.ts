import { Component, Watch, Vue, Inject } from 'vue-property-decorator'
import { GroupModule } from '@/store/modules/group'
import { UserModule } from '@/store/modules/user'
import { DeviceModule } from '@/store/modules/device'
import { getDeviceResources } from '@/api/billing'

@Component
export default class CreateMixin extends Vue {
  @Inject({ from: 'deviceRouter', default: null }) public deviceRouter!: Function
  @Inject({ from: 'initDirs', default: null }) public initDirs!: Function
  public form: any = {}
  public resourcesMapping: any = {}
  public orginalResourceIdList: Array<string> = []
  public orginalChannelSize = 0

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

  public get isPrivateUser() {
    return UserModule.tags && UserModule.tags.networkType === 'private'
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

  @Watch('currentGroup', { immediate: true, deep: true })
  public onGroupChange() {
    if (this.currentGroup && !this.isUpdate) {
      this.form.pullType = this.currentGroup.pullType
      this.form.pushType = this.currentGroup.pushType
      this.form.groupId = this.currentGroup.groupId
    }
  }

  /**
   * 获取绑定资源包列表
   */
  public async getDeviceResources(deviceId: number, deviceType: string, inProtocol: string) {
    try {
      const resourcesRes = await getDeviceResources({
        deviceId: deviceId,
        deviceType: deviceType,
        inProtocol: inProtocol
      })
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
          if (key === 'VSS_UPLOAD_BW' && this.isPrivateUser) continue
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
          }).catch((e: any) => {
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
   * 校验设备Domain格式
   */
  public validateDeviceDomain(rule: any, value: string, callback: Function) {
    if (value && !/^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?$/.test(value)) {
      callback(new Error('设备域名格式不正确。正确域名格式例如: www.domain.com'))
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
    } else if (!this.isUpdate && !hasVideo && !hasUpload && !this.isPrivateUser && !this.isFreeUser) {
      callback(new Error('资源包必须配置视频包与上行带宽包'))
    } else if (!this.isUpdate && !hasVideo && !this.isFreeUser) {
      callback(new Error('必须配置视频包'))
    } else if (!this.isUpdate && !hasUpload && !this.isPrivateUser && !this.isFreeUser) {
      callback(new Error('必须配置上行带宽包'))
    } else {
      callback()
    }
  }
}
