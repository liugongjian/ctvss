import { Component, Mixins, Inject, Watch, Provide } from 'vue-property-decorator'
import DeviceMixin from './deviceMixin'
import { Device } from '@/type/device'
import { Group } from '@/type/group'
import { RecordTemplate } from '@/type/template'
import { queryGroup } from '@/api/group'
import { GroupModule } from '@/store/modules/group'
import { DeviceModule } from '@/store/modules/device'
// import { DeviceStatus, DeviceGb28181Type, RecordStatus, RecordStatusType, AuthStatus, InType, PullType, PushType, CreateSubDevice, TransPriority, SipTransType, StreamTransType, ResourceType } from '@/dics'
import { getDevice, getChildAddress } from '@/api/device'
import { DeviceStatus, DeviceGb28181Type, RecordStatus, AuthStatus, InType, PullType, PushType, CreateSubDevice, TransPriority, SipTransType, StreamTransType, ResourceType, RecordStatusType } from '@/dics'
import { getDeviceResources } from '@/api/billing'
import TemplateBind from '../../components/templateBind.vue'
import SetAuthConfig from '../components/dialogs/SetAuthConfig.vue'
import DetailConfig from '../components/DetailConfig.vue'
import DetailEvents from '../components/DetailEvents.vue'
import DetailPreview from '../components/DetailPreview.vue'
import DetailReplay from '../components/DetailReplay.vue'
import StatusBadge from '@/components/StatusBadge/index.vue'
import AntiTheftChain from '../components/AntiTheftChain.vue'
import { checkPermission } from '@/utils/permission'
import { regionList } from '@/assets/region/lianzhouRegion'
import copy from 'copy-to-clipboard'
import { DeviceTips } from '@/dics/tips'
import Resource from '@/views/device/components/dialogs/Resource.vue'
import { VGroupModule } from '@/store/modules/vgroup'
import { industryMap } from '@/assets/region/industry'
import { networkMap } from '@/assets/region/network'
import { allRegionList } from '@/assets/region/region'
import MoveDir from '../components/dialogs/MoveDir.vue'
import DetailOperation from '../components/DetailOperation.vue'

@Component({
  components: {
    TemplateBind,
    DetailEvents,
    DetailConfig,
    DetailPreview,
    DetailReplay,
    SetAuthConfig,
    StatusBadge,
    AntiTheftChain,
    Resource,
    MoveDir,
    DetailOperation
  }
})
export default class DetailMixin extends Mixins(DeviceMixin) {
  @Inject('gotoRoot')
  public gotoRoot!: Function

  public checkPermission = checkPermission
  public activeName: any = 'info'
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
  public groupInfo: Group | null = null
  public industryMap = industryMap
  public networkMap = networkMap
  public resources: any = []
  public algoTabTypeDefault = ''
  public showResourceDialog = false

  public tips = DeviceTips

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
    setAuthConfig: false,
    moveDir: false
  }
  public loading = {
    info: false,
    groupInfo: false,
    template: false
  }
  public recordTemplateId = ''
  public autoStreamNumObj = {
    1: '主码流',
    2: '子码流',
    3: '第三码流'
  }
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

  public get isNVR() {
    return this.info && this.info.deviceType === 'nvr'
  }

  public get isNVRChannel() {
    return this.info && this.info.parentDeviceId !== '-1'
  }

  public get isPlatform() {
    return this.info && this.info.deviceType === 'platform'
  }

  public get deviceId() {
    return this.$route.query.deviceId
  }

  public get inProtocol() {
    return this.$route.query.inProtocol
  }

  public get currentGroupId() {
    return GroupModule.group?.groupId
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

  public get groupSipDomain() {
    return this.groupInfo && this.groupInfo.sipId && this.groupInfo.sipId.toString().substr(0, 10)
  }

  @Watch('$route.query')
  public onRouterChange() {
    this.detailInit()
  }

  /**
   * 针对网络标识
   */
  private get networkFlag() {
    return this.$store.state.user.tags.isNeedDeviceNetworkCode === 'Y'
  }

  public async mounted() {
    this.detailInit()
  }

  @Provide('detailInit')
  private async detailInit() {
    if (this.$route.query.tab) {
      this.activeName = this.$route.query.tab.toString()
    } else {
      this.activeName = 'info'
    }
    await this.getDevice()
    await this.getDeviceResources()
    await this.getAddress(this.info!.gbRegion)
  }

  public delayDetailInit() {
    setTimeout(async() => {
      this.info = await getDevice({
        deviceId: this.deviceId,
        inProtocol: this.inProtocol
      })
    }, 5000)
  }

  // 详情页操作
  @Provide('detailOperate')
  public async detailOperate(type, num?) {
    let result = false
    let params: Device = this.info
    num && (params = {
      ...this.info,
      streamNum: num
    })
    try {
      switch (type) {
        case 'startDevice':
          result = await this.startDevice(params)
          break
        case 'stopDevice':
          result = await this.stopDevice(params)
          break
        case 'startRecord':
          result = await this.startRecord(params)
          break
        case 'stopRecord':
          result = await this.stopRecord(params)
          break
        default:
      }
      result && this.delayDetailInit()
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 获取设备地址
   */
  public async getAddress(gbRegion: any) {
    this.$set(this.info!, 'address', '')
    const list = []
    for (let i = 0; i < 4; i++) {
      if (gbRegion!.substring(i * 2, i * 2 + 2) !== '00') {
        list.push(parseInt(gbRegion!.substring(0, (i + 1) * 2)))
      }
    }
    const region0 = allRegionList.find((item0: any) => {
      return item0.code === list[0]
    })
    if (region0) {
      this.info!.address += region0.name
      const region1 = region0.children.find((item1: any) => {
        return item1.code === list[1]
      })
      if (region1) {
        this.info!.address += '/' + region1.name
        const region2 = region1.children.find((item2: any) => {
          return item2.code === list[2]
        })
        if (region2) {
          this.info!.address += '/' + region2.name
          // 四级数据从后端获取
          if (list.length === 4) {
            const level4List = getChildAddress(list[2], 4)
            const region3 = (await level4List).find((item3: any) => {
              return item3.code === list[3]
            })
            if (region3) {
              this.info!.address += '/' + region3.name
            }
          }
        }
      }
    }
  }

  /**
   * 判断是否为专线
   */
  public get isPrivateInNetwork() {
    return this.inNetworkType && this.inNetworkType !== 'public'
  }

  /**
   * 获取设备流信息
   */
  @Provide('getStreamStatus')
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
      /**
       * 2022-03-16修改
       * 如果设备为子通道，使用channel下的设备状态、流状态、录制状态字段
       */
      if (this.info.parentDeviceId !== '-1') {
        // @ts-ignore
        const channel = this.info.deviceChannels[0]
        this.info.deviceStatus = channel.deviceStatus
        this.info.streamStatus = channel.streamStatus
        this.info.recordStatus = channel.recordStatus
      }

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
   * 打开算法配置弹窗
   */
  @Provide('changeResourceDialog')
  private changeResourceDialog() {
    this.showResourceDialog = true
  }

  // 关闭算法配置弹窗
  private closeResourceDialog(isRefresh: boolean) {
    this.showResourceDialog = false
    isRefresh && this.detailInit()
  }

  /**
   * 获取业务组信息
   */
  public async getGroup() {
    try {
      this.loading.groupInfo = true
      this.groupInfo = await queryGroup({
        groupId: this.currentGroupId
      })
    } catch (e) {
      console.error(e)
    } finally {
      this.loading.groupInfo = false
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
  @Provide('goToChannels')
  public goToChannels() {
    this.deviceRouter({
      id: this.deviceId,
      type: 'nvr'
    })
  }

  /**
   * 查看通道
   */
  @Provide('moveDir')
  public moveDir() {
    this.openDialog('moveDir')
  }

  /**
   * 返回上一级
   */
  @Provide('goSuperior')
  public goSuperior() {
    const breadcrumb: Array<any> = DeviceModule.breadcrumb
    if (breadcrumb.length > 1) {
      const superior: any = breadcrumb.slice(-2, -1)[0]
      this.deviceRouter({
        id: superior.id,
        type: superior.type
      })
    } else {
      this.gotoRoot()
    }
  }

  /**
   * 设备删除后返回上一级
   */
  public onDeleteDevice() {
    this.goSuperior()
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
  @Provide('edit')
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
