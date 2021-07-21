import { Component, Vue, Inject } from 'vue-property-decorator'
import { Device } from '@/type/device'
import { RecordTemplate } from '@/type/template'
import { DeviceStatus, DeviceGb28181Type, RecordStatus, AuthStatus, InType, PullType, PushType, CreateSubDevice, TransPriority, SipTransType, StreamTransType, ResourceType } from '@/dics'
import { getDevice } from '@/api/device'
import { getDeviceResources } from '@/api/billing'
import TemplateBind from '../../components/templateBind.vue'
import SetAuthConfig from '../components/dialogs/SetAuthConfig.vue'
import StatusBadge from '@/components/StatusBadge/index.vue'
import AntiTheftChain from '../components/AntiTheftChain.vue'
import { checkPermission } from '@/utils/permission'
import { UserModule } from '@/store/modules/user'
import copy from 'copy-to-clipboard'

@Component({
  components: {
    TemplateBind,
    SetAuthConfig,
    StatusBadge,
    AntiTheftChain
  }
})
export default class DetailMixin extends Vue {
  @Inject('deviceRouter') public deviceRouter!: Function
  public checkPermission = checkPermission
  public activeName = 'info'
  public deviceStatus = DeviceStatus
  public deviceType = DeviceGb28181Type
  public recordStatus = RecordStatus
  public authStatus = AuthStatus
  public inType = InType
  public pullType = PullType
  public pushType = PushType
  public transPriority = TransPriority
  public sipTransType = SipTransType
  public streamTransType = StreamTransType
  public resourceType = ResourceType
  public createSubDevice = CreateSubDevice
  public info: Device | null = null
  public resources: any = []
  public pushConfig = {
    auth: true,
    key: '1a66a5c2317368a282ceb2b326767651',
    key2: '2a66a5c2317368a582ceb2b326767653'
  }
  public playConfig = {
    auth: true,
    key: '1a66a5c2317368a282ceb2b326767651',
    key2: '2a66a5c2317368a582ceb2b326767653',
    anti: {
      referer: {
        enable: true
      },
      ip: {
        enable: true
      },
      ua: {
        enable: true
      }
    }
  }
  public pushExpired?: number | null = null
  public template: Record<any, Array<RecordTemplate>> = {
    snapshotTemplate: [],
    recordTemplate: []
  }
  public dialog = {
    setAuthConfig: false
  }
  public loading = {
    info: false,
    template: false
  }
  public recordTemplateId = ''
  public autoStreamNumObj = {
    1: '主码流',
    2: '子码流',
    3: '第三码流'
  }

  public get isGb() {
    return this.$route.query.inProtocol === 'gb28181'
  }

  public get isNVRChannel() {
    return this.info && this.info.parentDeviceId !== '-1'
  }

  public get deviceId() {
    return this.$route.query.deviceId
  }

  public get inProtocol() {
    return this.$route.query.inProtocol
  }

  public get isAutoCreated() {
    return this.info && this.info.parentDeviceId !== '-1' && this.info.createSubDevice === 1
  }

  public get tags() {
    if (this.info && this.info.tags) {
      return this.info.tags.split(',')
    } else {
      return null
    }
  }

  public get isPrivateUser() {
    return UserModule.tags && UserModule.tags.networkType === 'private'
  }

  public async mounted() {
    await this.getDevice()
    await this.getDeviceResources()
  }

  /**
   * 获取设备流信息
   */
  public getStreamStatus(statusArr: any, num: any) {
    if (!statusArr) {
      return false
    }
    let statusObj = statusArr.find((status: any) => status.streamNum === num)
    if (!statusObj) {
      return false
    } else {
      return statusObj.streamStatus
    }
  }

  /**
   * 获取设备信息
   */
  public async getDevice() {
    try {
      this.loading.info = true
      this.info = await getDevice({
        deviceId: this.deviceId,
        inProtocol: this.inProtocol
      })
    } catch (e) {
      console.error(e)
    } finally {
      this.loading.info = false
    }
  }

  /**
   * 获取设备资源包
   */
  public async getDeviceResources() {
    try {
      this.loading.info = true
      const resourcesRes = await getDeviceResources({
        deviceId: this.info!.deviceId,
        deviceType: this.info!.deviceType,
        inProtocol: this.info!.inProtocol
      })
      const resourcesMapping: any = {
        'VSS_VIDEO': false,
        'VSS_UPLOAD_BW': false,
        'VSS_AI': false
      }
      if (this.isPrivateUser) {
        delete resourcesMapping['VSS_UPLOAD_BW']
      }
      if (this.info?.inProtocol !== 'gb28181') {
        delete resourcesMapping['VSS_AI']
      }
      resourcesRes.resources.forEach((resource: any) => {
        resourcesMapping[resource.resourceType] = true
      })
      const resources = []
      for (let key in resourcesMapping) {
        resources.push({
          label: key,
          value: resourcesMapping[key]
        })
      }
      this.resources = resources
    } catch (e) {
      console.error(e)
    } finally {
      this.loading.info = false
    }
  }

  /**
   * 实时预览
   */
  public goToPreview() {
    this.deviceRouter({
      id: this.deviceId,
      type: 'preview'
    })
  }

  /**
   * 查看通道
   */
  public goToChannels() {
    this.deviceRouter({
      id: this.deviceId,
      type: 'nvr'
    })
  }

  /**
   * TAB切换
   */
  public async handleClick(tab: any) {
    this.activeName = tab.name
  }

  /**
   * 编辑
   */
  public edit() {
    this.deviceRouter({
      id: this.deviceId,
      type: 'update'
    })
  }

  public openDialog(type: string) {
    // @ts-ignore
    this.dialog[type] = true
  }

  public async closeDialog(type: string) {
    // @ts-ignore
    this.dialog[type] = false
  }

  /**
   * 一键复制
   */
  public copyUrl(text: string) {
    copy(text)
    this.$message.success('复制成功')
  }
}
