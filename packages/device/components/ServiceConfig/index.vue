<template>
  <div v-loading="loading" class="service-config">
    <div v-if="configMode === configModeEnum.View">
      <div v-if="hasVideoTab && configManager.initInfo.video && configManager.initInfo.video.length">
        <span class="service-config__view-title">视频</span>
        <component
          :is="VideoConfigService"
          v-if="videoServiceUsable"
          ref="videoConfig"
          @config-change="configChange('video', $event)"
        />
        <div v-else class="config-info">
          <i class="el-icon-warning-outline" />
          你的账户下无可用视频资源包且未开通按需计费，无法启用服务。
        </div>
      </div>
      <div v-show="hasAiTab && configManager.initInfo.aI && configManager.initInfo.aI.length">
        <span class="service-config__view-title">AI</span>
        <div v-if="aiServiceUsable">
          <component
            :is="AiConfigService"
            v-if="hasGetAppPermission" 
            ref="config"
            @force-update="forceUpdate"
            @config-change="configChange('aI', $event)"
          />
          <span v-else class="config-info">
            <i class="el-icon-warning-outline" />
            当前子账号无 查看AI应用 的权限，请联系主账号进行配置!
          </span>
        </div>
        <span v-else class="config-info">
          <i class="el-icon-warning-outline" />
          你的账户下无可用AI资源包且未开通按需计费，无法启用服务。
        </span>
      </div>
      <div v-if="hasViidTab && configManager.initInfo.viid && configManager.initInfo.viid.length">
        <span class="service-config__view-title">视图</span>
        <component
          :is="ViidConfigService"
          v-if="viidServiceUsable"
          ref="viidConfig"
          @config-change="configChange('viid', $event)"
        />
        <div v-else class="config-info">
          <i class="el-icon-warning-outline" />
          <span v-if="isGA1400Trial">您当前正在试用视图服务，视图信息将存储30天。</span>
          <span v-else>你的账户下未开通按需计费，无法启用服务。</span>
        </div>
      </div>
    </div>
    <div v-else>
      <el-tabs v-model="configManager.activeTab" type="card">
        <el-tab-pane v-if="hasVideoTab" label="视频" :name="resourceTypeEnum.Video">
          <component
            :is="VideoConfigService"
            v-if="videoServiceUsable"
            ref="videoConfig"
            @config-change="configChange('video', $event)"
          />
          <span v-else class="config-info">
            <i class="el-icon-warning-outline" />
            你的账户下无可用视频资源包且未开通按需计费，无法启用服务。
          </span>
        </el-tab-pane>
        <el-tab-pane v-if="hasAiTab" label="AI" :name="resourceTypeEnum.AI">
          <component
            :is="AiConfigService"
            v-if="aiServiceUsable"
            ref="config"
            @config-change="configChange('aI', $event)"
          />
          <div v-else class="config-info">
            <i class="el-icon-warning-outline" />
            你的账户下无可用AI资源包且未开通按需计费，无法启用服务。
          </div>
        </el-tab-pane>
        <el-tab-pane v-if="hasViidTab" label="视图" :name="resourceTypeEnum.Viid">
          <component
            :is="ViidConfigService"
            v-if="viidServiceUsable" 
            ref="viidConfig"
            @config-change="configChange('viid', $event)"
          />
          <span v-else class="config-info">
            <i class="el-icon-warning-outline" />
            <span v-if="isGA1400Trial">您当前正在试用视图服务，视图信息将存储30天。</span>
            <span v-else>你的账户下未开通按需计费，无法启用服务。</span>
          </span>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, VModel, Prop, Watch, Provide, Inject } from 'vue-property-decorator'
import { DeviceTypeEnum, DeviceInTypeEnum } from '@vss/device/enums/index'
import { ResourceTypeEnum, ConfigModeEnum, BillingModeEnum } from '@vss/device/enums/billing'
import IpcVideoServiceConfig from './ipc/VideoServiceConfig.vue'
import NvrVideoServiceConfig from './nvr/VideoServiceConfig.vue'
import PlatformVideoServiceConfig from './platform/VideoServiceConfig.vue'
import IpcAiServiceConfig from './ipc/AiServiceConfig.vue'
import IpcViidServiceConfig from './ipc/ViidServiceConfig.vue'
import { getResources, getDeviceResource, ondemandSubscribe } from '@vss/device/api/billing'
import { UserModule } from '@/store/modules/user'
import { getStorageTemplate } from '@vss/device/api/template'
import { checkPermission } from '@vss/base/utils/permission'

@Component({
  name: 'ServiceConfig',
  components: {
    IpcVideoServiceConfig,
    NvrVideoServiceConfig,
    PlatformVideoServiceConfig,
    IpcAiServiceConfig,
    IpcViidServiceConfig
  }
})
export default class extends Vue {
  @Inject({ default: () => ({}) })
  public getActions!: Function
  private get deviceActions() {
    console.log('serviceConfig', this.getActions())
    return this.getActions && typeof this.getActions === 'function' && this.getActions()
  }

  @Prop({ default: '' })
  private deviceId: string

  @Prop({ default: DeviceTypeEnum.Ipc })
  private deviceType: DeviceTypeEnum

  @Prop({ default: '' })
  private inVideoProtocol: string

  @Prop({ default: () => [] })
  private tabs: ResourceTypeEnum[]

  @Prop({ default: () => [] })
  private deviceInType: DeviceInTypeEnum[]

  @Prop({ default: 0 })
  private channelSize: number

  @Prop({ default: 0 })
  private deviceStreamSize: number

  @Prop({ default: ConfigModeEnum.Create })
  private configMode: ConfigModeEnum

  @Prop({ default: false })
  private isView: boolean

  @Provide()
  public configManager = Vue.observable({
    configMode: ConfigModeEnum.Create,
    activeTab: ResourceTypeEnum.Video,
    deviceType: DeviceTypeEnum.Ipc,
    deviceId: '',
    inVideoProtocol: '',
    channelSize: 0,
    deviceStreamSize: 0,
    initInfo: {},
    hasOndemand: false,
    [ResourceTypeEnum.Video]: [], //用户拥有的视频包
    [ResourceTypeEnum.AI]: [], //用户拥有的AI包
  })

  @VModel({ 
    default: () => {
      return {
        video: [],
        aI: [],
        viid: []
      }
    }
  })
  private resource

  private deviceTypeEnum = DeviceTypeEnum
  private deviceInTypeEnum = DeviceInTypeEnum
  private resourceTypeEnum = ResourceTypeEnum
  private configModeEnum = ConfigModeEnum

  private VideoConfigServiceDics = {
    [DeviceTypeEnum.Ipc]: 'IpcVideoServiceConfig',
    [DeviceTypeEnum.Nvr]: 'NvrVideoServiceConfig',
    [DeviceTypeEnum.Platform]: 'PlatformVideoServiceConfig',
  }

  private AiConfigServiceDics = {
    [DeviceTypeEnum.Ipc]: 'IpcAiServiceConfig'
  }

  private ViidConfigServiceDics = {
    [DeviceTypeEnum.Ipc]: 'IpcViidServiceConfig'
  }

  private loading = true
  private initFlag = true

  private get hasGetAppPermission() {
    return checkPermission(['ivs:GetApp'], this.deviceActions)
  }

  private get hasVideoTab() {
    // 仅视频服务配置拥有视频Tab
    return this.tabs.includes(ResourceTypeEnum.Video)
  }

  private get hasAiTab() {
    // 该flag确保创建和编辑时，根据GetApp权限控制AiTab显隐
    const editFlag = this.configMode === ConfigModeEnum.View || this.hasGetAppPermission
    // 仅ipc设备类型的视频服务配置拥有AITab
    return editFlag && this.tabs.includes(ResourceTypeEnum.AI) && [DeviceTypeEnum.Ipc].includes(this.deviceType)
  }

  private get hasViidTab() {
    // 仅视图服务配置拥有视图Tab
    return this.tabs.includes(ResourceTypeEnum.Viid)
  }

  private get VideoConfigService() {
    return this.VideoConfigServiceDics[this.deviceType]
  }

  private get AiConfigService() {
    return this.AiConfigServiceDics[this.deviceType]
  }

  private get ViidConfigService() {
    return this.ViidConfigServiceDics[this.deviceType]
  }

  private get videoServiceUsable() {
    const hasVideoInit = this.configManager.initInfo['video'] && this.configManager.initInfo['video'].length
    return (hasVideoInit || (!!this.configManager[ResourceTypeEnum.Video].length || this.configManager.hasOndemand)) && this.initFlag
  }

  private get aiServiceUsable() {
    const hasAiInit = this.configManager.initInfo['aI'] && this.configManager.initInfo['aI'].length
    return (hasAiInit || (this.configManager[ResourceTypeEnum.AI].length || this.configManager.hasOndemand)) && this.initFlag
  }

  private get viidServiceUsable() {
    const hasViidInit = this.configManager.initInfo['viid'] && this.configManager.initInfo['viid'].length
    if (UserModule.tags && UserModule.tags.isGA1400Trial === 'Y') {
      return this.configManager.hasOndemand
    }
    return (hasViidInit || this.configManager.hasOndemand) && this.initFlag
  }

  // 判断是否支持视图试用
  private get isGA1400Trial() {
    const userFlag = UserModule.tags && UserModule.tags.isGA1400Trial  === 'Y'
    const tabsFlag = this.tabs.includes(ResourceTypeEnum.Video) &&  this.tabs.includes(ResourceTypeEnum.Viid)
    const deviceInTypeFlag = this.deviceInType.includes(DeviceInTypeEnum.Video) &&  this.deviceInType.includes(DeviceInTypeEnum.Viid)
    !this.viidServiceUsable && (tabsFlag || deviceInTypeFlag) && userFlag && this.initTrail()
    
    return !this.viidServiceUsable && (tabsFlag || deviceInTypeFlag) && userFlag
  }

  @Watch('configMode', { immediate: true })
  private configModeChange(configMode: ConfigModeEnum) {
    // 切换config模式
    this.configManager.configMode = configMode
  }

  @Watch('deviceType', { immediate: true })
  private deviceTypeChange() {
    // 切换设备类型重置tab
    this.configManager.activeTab = this.tabs[0]
    this.configManager.deviceType = this.deviceType
  }

  @Watch('channelSize', { immediate: true })
  private channelSizeChange() {
    // 响应通道变化
    this.configManager.channelSize = this.channelSize
  }

  @Watch('deviceStreamSize', { immediate: true })
  private deviceStreamSizeChange() {
    // 响应码流数量变化
    this.configManager.deviceStreamSize = this.deviceStreamSize
  }

  private async mounted() {
    this.init()
  }

  public async init() {
    this.$emit('is-inited', false)
    this.initFlag = false
    this.loading = true
    this.configManager.activeTab = this.tabs[0]
    await this.initConfigManager()
    await this.initDeviceResource()
    this.initFlag = true
    this.loading = false
    this.$emit('is-inited', true)
  }

  /**
   * 针对视图试用进行初始配置
   */
  private async initTrail() {
    if (this.hasViidTab && !this.resource['viid'].length) {
      try {
        const res = await getStorageTemplate({ pageSize: 999 })
        const template = res.templates[0]
        res.templates.length && (this.resource['viid'] = [{ billingMode: 'onDemand', templateId: template.templateId }])
      } catch (e) {
        console.log(e)
      } 
    }
  }

  /**
   * 初始化设备资源信息
   */
  public async initDeviceResource() {
    if (this.configMode === ConfigModeEnum.Create) return
    try {
      const res = await getDeviceResource({
        deviceId: this.deviceId,
        deviceType: this.deviceType
      })
      this.configManager.initInfo = res.resource
    } catch (e) {
      console.log(e && e.message)
    }
  }

  /**
   * 初始化configManager（全局数据传输对象）
   */
  private async initConfigManager() {
    this.configManager.configMode = this.configMode
    this.configManager.channelSize = this.channelSize
    this.configManager.deviceStreamSize = this.deviceStreamSize
    this.configManager.deviceId = this.deviceId
    this.configManager.inVideoProtocol = this.inVideoProtocol
    const initPackagesQueue = new Set()
    if (this.hasVideoTab) {
      // 视频查询存视频包、储按需包
      initPackagesQueue.add(ResourceTypeEnum.Video)
      if (this.hasAiTab) {
        // AI须查询AI包、AI按需包
        initPackagesQueue.add(ResourceTypeEnum.AI)
      }
    }
    // 初始化按需
    await this.initOndemand()
    // 初始化资源包
    const initPackages = []
    initPackagesQueue.forEach(async(resourceType: ResourceTypeEnum) => {
      initPackages.push(this.initPackages(resourceType))
    })
    await Promise.all(initPackages)
  }

  private async initOndemand() {
    try {
      const res = await ondemandSubscribe()
      this.configManager.hasOndemand = res.isSubscribe === '1'
    } catch (e) {
      console.log(e && e.message)
    }
  }

  private async initPackages(resourceType: ResourceTypeEnum) {
    try {
      const res = await getResources({
        type: resourceType
      })
      // 过滤已过期的资源包并判断是否支持该模式
      this.configManager[resourceType] = res.resPkgList.filter((resource: any) => {
        if (new Date().getTime() < new Date(resource.expireTime).getTime()) {
          return resource
        }
      })
    } catch (e) {
      console.log(e && e.message)
    }
  }

  /**
   * 强制更新
   * @param isSubmit 是否更新表单
   */
  private forceUpdate(isSubmit: boolean) {
    window.setImmediate(() => {
      this.$emit('force-update', isSubmit)
    })
  }

  private configChange(type, data) {
    if (this.resource) {
      this.resource[type] = data
    }

    console.log(type, this.resource)
  }

  public async validateServiceConfig() {
    let config: any
    if (this.hasVideoTab) {
      config = this.$refs.videoConfig
    }
    if (this.hasViidTab) {
      config = this.$refs.viidConfig
    }
    if (config && config.validateConfigForm) {
      const valid = await config.validateConfigForm()
      return valid
    }
    return
  }
}
</script>

<style lang="scss" scoped>
.service-config {
  ::v-deep {
    .el-tabs__header {
      margin: 0;
    }

    .el-tabs__item {
      font-size: $text-size-medium;
    }

    .el-tabs__content {
      border: 1px solid #dfe4ed;
      border-top: none;
      padding: 10px 20px;
    }
  }

  &__view-title {
    line-height: 20px;
    font-size: 16px;
    font-weight: bold;
  }

  .config-info {
    line-height: 50px;
    color: $textGrey;
  }
}
</style>