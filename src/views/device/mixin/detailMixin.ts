import { Component, Vue, Inject, Watch } from 'vue-property-decorator'
import { Device } from '@/type/device'
import { RecordTemplate } from '@/type/template'
import { getDevice, getAddressArea } from '@/api/device'
import { DeviceStatus, DeviceGb28181Type, RecordStatus, AuthStatus, InType, PullType, PushType, CreateSubDevice, TransPriority, SipTransType, StreamTransType, ResourceType, RecordStatusType } from '@/dics'
import { getDeviceResources } from '@/api/billing'
import TemplateBind from '../../components/templateBind.vue'
import SetAuthConfig from '../components/dialogs/SetAuthConfig.vue'
import StatusBadge from '@/components/StatusBadge/index.vue'
import AntiTheftChain from '../components/AntiTheftChain.vue'
import { checkPermission } from '@/utils/permission'
import { regionList } from '@/assets/region/lianzhouRegion'
import copy from 'copy-to-clipboard'
import { VGroupModule } from '@/store/modules/vgroup'
import { industryMap } from '@/assets/region/industry'
import { networkMap } from '@/assets/region/network'
import { allRegionList } from '@/assets/region/region'

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
  public recordStatusType = RecordStatusType
  public deviceType = DeviceGb28181Type
  public recordStatus = RecordStatus
  public authStatus = AuthStatus
  public inType = InType
  public inNetworkType = ''
  public pullType = PullType
  public pushType = PushType
  public transPriority = TransPriority
  public sipTransType = SipTransType
  public streamTransType = StreamTransType
  public resourceType = ResourceType
  public createSubDevice = CreateSubDevice
  public info: Device | null = null
  public industryMap = industryMap
  public networkMap = networkMap
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
  public lianzhouFlag: boolean = false
  public regionList = regionList
  public lianzhouAddress: string = ''

  public get isGb() {
    return this.$route.query.inProtocol === 'gb28181' || this.$route.query.realGroupInProtocol === 'gb28181'
  }

  public get isVGroup() {
    return this.$route.query.inProtocol === 'vgroup'
  }

  public get realGroupId() {
    return VGroupModule.realGroupId
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

  /**
   * 针对网络标识
   */
  private get networkFlag() {
    return this.$store.state.user.tags.isNeedDeviceNetworkCode === 'Y'
  }

  public async mounted() {
    // TODO: 连州教育局一机一档专用
    this.lianzhouFlag = this.$store.state.user.tags.isLianZhouEdu === 'Y'
    await this.getDevice()
    await this.getDeviceResources()
    await this.getAddress(this.info!.gbRegion)
  }

  /**
   * 获取连州region
   */
  public async getAddress(gbRegion: any) {
    this.$set(this.info!, 'address', '')
    if (this.lianzhouFlag) {
      let res = await getAddressArea({
        pid: 441882,
        level: 5
      })
      this.info!.address = '广州省/清远市/连州市'
      let lianzhouArea = res.areas.map((item: any) => {
        return {
          name: item.name,
          code: item.id,
          level: item.level
        }
      })
      lianzhouArea.forEach((item: any) => {
        if (item.code === gbRegion) {
          this.info!.address += `/${item.name}`
        }
      })
    } else {
      const list = [
        parseInt(gbRegion!.substring(0, 2)),
        parseInt(gbRegion!.substring(0, 4)),
        parseInt(gbRegion!.substring(0, 6))
      ]
      let region0 = allRegionList.find((item0: any) => {
        return item0.code === list[0]
      })
      if (region0) {
        this.info!.address += region0.name
        let region1 = region0.children.find((item1: any) => {
          return item1.code === list[1]
        })
        if (region1) {
          this.info!.address += '/' + region1.name
          let region2 = region1.children.find((item2: any) => {
            return item2.code === list[2]
          })
          if (region2) {
            this.info!.address += '/' + region2.name
          } else {
            this.info!.address += '/' + region1.children[0].name
          }
        } else {
          this.info!.address += '/' + region0.children[0].name + '/' + region0.children[0].children[0].name
        }
      }
    }
  }

  public get isPrivateInNetwork() {
    return this.inNetworkType && this.inNetworkType !== 'public'
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
      this.inNetworkType = resourcesRes.inNetworkType
      const resourcesMapping: any = {
        'VSS_VIDEO': false,
        'VSS_UPLOAD_BW': false,
        'VSS_AI': false
      }
      if (this.isPrivateInNetwork) {
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
  public goToPreview(previewTab: string) {
    this.deviceRouter({
      id: this.deviceId,
      type: 'preview',
      previewTab
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

  @Watch('realGroupId')
  public async onRealGroupIdChange(realGroupId: string, oldRealGroupId: string) {
    if (!realGroupId || oldRealGroupId) return
    await this.getDevice()
    await this.getDeviceResources()
    await this.getAddress(this.info!.gbRegion)
  }
}
