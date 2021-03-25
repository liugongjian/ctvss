import { Component, Vue, Inject } from 'vue-property-decorator'
import { Device } from '@/type/device'
import { RecordTemplate } from '@/type/template'
import { DeviceStatus, DeviceGb28181Type, RecordStatus, AuthStatus, PullType, CreateSubDevice, TransPriority, SipTransType, StreamTransType } from '@/dics'
import { getDevice } from '@/api/device'
import TemplateBind from '../../components/templateBind.vue'
import SetAuthConfig from '../components/dialogs/SetAuthConfig.vue'
import StatusBadge from '@/components/StatusBadge/index.vue'
import AntiTheftChain from '../components/AntiTheftChain.vue'

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
  public activeName = 'info'
  public deviceStatus = DeviceStatus
  public deviceType = DeviceGb28181Type
  public recordStatus = RecordStatus
  public authStatus = AuthStatus
  public pullType = PullType
  public transPriority = TransPriority
  public sipTransType = SipTransType
  public streamTransType = StreamTransType
  public createSubDevice = CreateSubDevice
  public info: Device | null = null
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

  public mounted() {
    this.getDevice()
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
}
