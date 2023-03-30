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
      <div v-if="hasAiTab && configManager.initInfo.aI && configManager.initInfo.aI.length">
        <span class="service-config__view-title">AI</span>
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
          你的账户下未开通按需计费，无法启用服务。
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
          <span v-else class="config-info">
            <i class="el-icon-warning-outline" />
            你的账户下无可用AI资源包且未开通按需计费，无法启用服务。
          </span>
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
            你的账户下未开通按需计费，无法启用服务。
          </span>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, VModel, Prop, Watch, Provide } from 'vue-property-decorator'
import { DeviceTypeEnum, DeviceInTypeEnum } from '@vss/device/enums/index'
import { ResourceTypeEnum, ConfigModeEnum } from '@vss/device/enums/billing'
import IpcVideoServiceConfig from './ipc/VideoServiceConfig.vue'
import NvrVideoServiceConfig from './nvr/VideoServiceConfig.vue'
import PlatformVideoServiceConfig from './platform/VideoServiceConfig.vue'
import IpcAiServiceConfig from './ipc/AiServiceConfig.vue'
import IpcViidServiceConfig from './ipc/ViidServiceConfig.vue'
import { getResources, getDeviceResource } from '@vss/device/api/billing'

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
  @Prop({ default: '' })
  private deviceId: string

  @Prop({ default: DeviceTypeEnum.Ipc })
  private deviceType: DeviceTypeEnum

  @Prop({ default: '' })
  private inVideoProtocol: string

  @Prop({ default: [] })
  private tabs: ResourceTypeEnum[]

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
    inVideoProtocol: '',
    channelSize: 0,
    deviceStreamSize: 0,
    initInfo: {},
    [ResourceTypeEnum.Video]: [], //用户拥有的视频包
    [ResourceTypeEnum.StorageOD]: [], //用户拥有存储按需包
    [ResourceTypeEnum.AI]: [], //用户拥有的AI包
    [ResourceTypeEnum.AIOD]: [], //用户拥有的AI按需包
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

  private get hasVideoTab() {
    // 仅视频服务配置拥有视频Tab
    return this.tabs.includes(ResourceTypeEnum.Video)
  }

  private get hasAiTab() {
    // 仅ipc设备类型的视频服务配置拥有AITab
    return this.tabs.includes(ResourceTypeEnum.AI) && [DeviceTypeEnum.Ipc].includes(this.deviceType)
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
    return  (!!this.configManager[ResourceTypeEnum.Video].length || !!this.configManager[ResourceTypeEnum.StorageOD].length) && this.initFlag
  }

  private get aiServiceUsable() {
    return (this.configManager[ResourceTypeEnum.AI].length || this.configManager[ResourceTypeEnum.AIOD]) && this.initFlag
  }

  private get viidServiceUsable() {
    return !!this.configManager[ResourceTypeEnum.StorageOD].length && this.initFlag
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

  @Watch('tabs', { immediate: true })
  private async tabsChange(cur, pre) {
    if (cur && pre && cur.join(',') === pre.join(',')) return
    // tab数量变化重置tab选项
    this.configManager.activeTab = this.tabs[0]
    console.log(this.hasViidTab)
    // 更新ConfigManager
    await this.initConfigManager()
  }

  private async mounted() {
    console.log(this.deviceId, this.tabs)
    this.initDeviceResource()
  }

  /**
   * 初始化设备资源信息
   */
  public async initDeviceResource() {
    if (this.configMode === ConfigModeEnum.Create) return
    try {
      this.loading = true
      this.initFlag = false
      const res = await getDeviceResource({
        deviceId: this.deviceId,
        deviceType: this.deviceType
      })
      this.configManager.initInfo = res.resource
      console.log(this.configManager.initInfo)
    } catch (e) {
      console.log(e && e.message)
    } finally {
      this.loading = false
      this.initFlag = true
    }
  }

  /**
   * 初始化configManager（全局数据传输对象）
   */
  private async initConfigManager() {
    this.configManager.configMode = this.configMode
    this.configManager.channelSize = this.channelSize
    this.configManager.deviceStreamSize = this.deviceStreamSize
    this.configManager.inVideoProtocol = this.inVideoProtocol
    const initPackagesQueue = new Set()
    if (this.hasVideoTab) {
      // 视频查询存视频包、储按需包
      !this.configManager[ResourceTypeEnum.Video].length && initPackagesQueue.add(ResourceTypeEnum.Video)
      !this.configManager[ResourceTypeEnum.StorageOD].length && initPackagesQueue.add(ResourceTypeEnum.StorageOD)
      if (this.hasAiTab) {
        // AI须查询AI包、AI按需包
        !this.configManager[ResourceTypeEnum.AI].length && initPackagesQueue.add(ResourceTypeEnum.AI)
        !this.configManager[ResourceTypeEnum.AIOD].length && initPackagesQueue.add( ResourceTypeEnum.AIOD)
      }
    } 
    if (this.hasViidTab) {
      // 视图需查询存储按需包
      !this.configManager[ResourceTypeEnum.StorageOD].length && initPackagesQueue.add(ResourceTypeEnum.StorageOD)
    }
    this.loading = true
    const initPackages = []
    console.log(initPackagesQueue)
    initPackagesQueue.forEach(async(resourceType: ResourceTypeEnum) => {
      initPackages.push(this.initPackages(resourceType))
    })
    await Promise.all(initPackages)
    this.loading = false
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
      // this.$message.error(e.message)
    }
  }

  private configChange(type, data) {
    this.resource && (this.resource[type] = data)
    console.log(this.resource)
  }

  public async validateServiceConfig() {
    let config: any
    if (this.hasVideoTab) {
      config = this.$refs.videoConfig
    }
    if (this.hasViidTab) {
      config = this.$refs.viidConfig
    }
    if (config) {
      return config && config.validateConfigForm && await config.validateConfigForm()
    } else {
      return new Error('请完善服务配置')
    }
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