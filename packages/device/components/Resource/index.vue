<template>
  <el-tabs v-model="resourceTabType" v-loading="loading.bindList" type="card" class="resource-tabs">
    <el-tab-pane :label="ResourceType[ResourceTypeEnum.Video]" :name="ResourceTypeEnum.Video">
      <!--视频包-->
      <div v-loading="loading[ResourceTypeEnum.Video]" class="resource-tabs__content">
        <el-table :data="resourceList[ResourceTypeEnum.Video]" fit @row-click="onResourceRowClick(ResourceTypeEnum.Video, ...arguments)">
          <el-table-column show-overflow-tooltip prop="resourceId" label="订单号" min-width="120">
            <template slot-scope="scope">
              <span class="resource-id">
                <el-radio v-model="form.resource[ResourceTypeEnum.Video]" :label="scope.row.resourceId" />
                {{ scope.row.workOrderNo }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="totalDeviceCount" label="可接入设备数量">
            <template slot-scope="scope">
              {{ scope.row.totalDeviceCount }}路
            </template>
          </el-table-column>
          <el-table-column prop="remainDeviceCount" label="接入设备余量">
            <template slot-scope="scope">
              {{ scope.row.remainDeviceCount }}路
            </template>
          </el-table-column>
          <el-table-column prop="bitRate" label="码率">
            <template slot-scope="scope">
              {{ scope.row.bitRate }}Mbps
            </template>
          </el-table-column>
          <el-table-column prop="storageTime" label="存储周期" min-width="90">
            <template slot-scope="scope">
              {{ scope.row.storageTime }}天
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="开通时间" min-width="170" />
          <el-table-column prop="expireTime" label="到期时间" min-width="170" />
        </el-table>
        <!--修改时或者免费用户时才允许选择空-->
        <div v-if="isEdit || isFreeUser" class="resource-tabs__none">
          <el-radio v-model="form.resource[ResourceTypeEnum.Video]" :label="null">不绑定任何视频包</el-radio>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane :label="ResourceType[ResourceTypeEnum.AI]" :name="ResourceTypeEnum.AI">
      <!--AI包-->
      <div v-loading="loading[ResourceTypeEnum.AI]" class="resource-tabs__content">
        <el-table :data="resourceList[ResourceTypeEnum.AI]" fit @row-click="onResourceRowClick(ResourceTypeEnum.AI, ...arguments)">
          <el-table-column show-overflow-tooltip prop="resourceId" label="订单号" min-width="120">
            <template slot-scope="scope">
              <span class="resource-id">
                <el-radio v-model="form.resource[ResourceTypeEnum.AI]" :label="scope.row.resourceId" />
                {{ scope.row.workOrderNo }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="totalDeviceCount" label="可接入设备数量">
            <template slot-scope="scope">
              {{ scope.row.totalDeviceCount }}路
            </template>
          </el-table-column>
          <el-table-column prop="remainDeviceCount" label="接入设备余量">
            <template slot-scope="scope">
              {{ scope.row.remainDeviceCount }}路
            </template>
          </el-table-column>
          <el-table-column prop="aIType" label="分析类型">
            <template slot-scope="scope">
              {{ ResourceAiType[scope.row.aIType] }}
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="开通时间" min-width="170" />
          <el-table-column prop="expireTime" label="到期时间" min-width="170" />
        </el-table>
        <div class="resource-tabs__none">
          <el-radio v-model="form.resource[ResourceTypeEnum.AI]" :label="null">不绑定任何AI包</el-radio>
        </div>
        <ai-apps
          class="resource-apps"
          v-if="form.resource[ResourceTypeEnum.AI]"
          v-model="form.aIAppsCollection"
          :resource-id="form.resource[ResourceTypeEnum.AI]"
          :resource-ai-type="currentResourceAIType"
        />
        <el-alert class="resource-apps__stat" :title="appStat" type="info" show-icon :closable="false"></el-alert>
      </div>
    </el-tab-pane>
    <el-tab-pane v-if="!isPrivateInNetwork" :label="ResourceType[ResourceTypeEnum.Upload]" :name="ResourceTypeEnum.Upload">
      <!--上行带宽包-->
      <div v-loading="loading[ResourceTypeEnum.Video]" class="resource-tabs__content">
        <el-table :data="resourceList[ResourceTypeEnum.Upload]" fit @row-click="onResourceRowClick(ResourceTypeEnum.Upload, ...arguments)">
          <el-table-column show-overflow-tooltip prop="resourceId" label="订单号" min-width="120">
            <template slot-scope="scope">
              <span class="resource-id">
                <el-radio v-model="form.resource[ResourceTypeEnum.Upload]" :label="scope.row.resourceId" />
                {{ scope.row.workOrderNo }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="bandWidth" label="上行带宽总量">
            <template slot-scope="scope">
              {{ scope.row.bandWidth }}Mbps
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="开通时间" min-width="170" />
          <el-table-column prop="expireTime" label="到期时间" min-width="170" />
        </el-table>
        <!--修改时或者免费用户时才允许选择空-->
        <div v-if="isEdit || isFreeUser" class="resource-tabs__none">
          <el-radio v-model="form.resource[ResourceTypeEnum.Upload]" :label="-1">不绑定任何上行带宽包</el-radio>
        </div>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>
<script lang='ts'>
import { Component, Prop, Watch, VModel, Vue } from 'vue-property-decorator'
import { Resource } from '@vss/device/type/Resource'
import { ResourceType, ResourceAiType } from '@vss/device/dicts/resource'
import { getResources, getDeviceResource } from '@vss/device/api/billing'
import { UserModule } from '@/store/modules/user'
import { ResourceTypeEnum } from '@vss/device/enums/resource'
import AiApps from './Apps.vue'

@Component({
  name: 'Resource',
  components: {
    AiApps
  }
})
export default class extends Vue {
  @VModel() private resource?: Resource
  // 设备ID
  @Prop() private deviceId?: boolean
  // 是否为私有接入网络
  @Prop({default: false}) private isPrivateInNetwork?: string

  private ResourceTypeEnum = ResourceTypeEnum
  private ResourceType = ResourceType
  private ResourceAiType = ResourceAiType

  // 当前选中的资源类型Tab名称
  private resourceTabType = ResourceTypeEnum.Video
  // 加载状态
  private loading = {
    [ResourceTypeEnum.Video]: false,
    [ResourceTypeEnum.AI]: false,
    [ResourceTypeEnum.Upload]: false,
    bindList: false
  }
  // 资源包列表
  private resourceList = {
    [ResourceTypeEnum.Video]: [],
    [ResourceTypeEnum.AI]: [],
    [ResourceTypeEnum.Upload]: []
  }
  // 表单数据
  private form = {
    resource: {
      [ResourceTypeEnum.Video]: null,
      [ResourceTypeEnum.AI]: null,
      [ResourceTypeEnum.Upload]: null
    },
    aIAppsCollection: {}
  }
  // 初始数据统计
  private orginalResource = {
    resourceIds: [],
    appSize: 0
  }

  /**
   * 是否为更新模式
   */
  public get isEdit() {
    return !!this.deviceId
  }

  /**
   * 是否为免费用户
   */
  public get isFreeUser() {
    return UserModule.tags && UserModule.tags.resourceFree === '1'
  }

  /**
   * 计算选择的AI应用数量和原始数量的差值
   */
  public get appStat() {
    const appSize = this.resource && this.resource.aIApps ? this.resource.aIApps.length : 0
    const messages = []
    messages.push(`已选择${appSize}种AI应用`)
    if (this.isEdit) {
      const diff = appSize - this.orginalResource.appSize
      if (diff > 0) {
        messages.push(`将扣除包中${diff}路资源`)
      } else if (diff < 0) {
        messages.push(`将释放包中${-diff}路资源`)
      }
    }
    return messages.join(', ')
  }

  /**
   * 当前AI资源包的算力
   */
  public get currentResourceAIType() {
    const aIResource = this.resourceList[ResourceTypeEnum.AI].find(resource => resource.resourceId === this.form.resource[ResourceTypeEnum.AI])
    return aIResource.aIType
  }

  @Watch('form', {
    deep: true
  })
  private onFormChange() {
    const resourceIds = this.filterResourceIds(Object.values(this.form.resource))
    if (!this.form.aIAppsCollection[this.form.resource[ResourceTypeEnum.AI]]) {
      this.$set(this.form.aIAppsCollection, this.form.resource[ResourceTypeEnum.AI], [])
    }
    this.resource = {
      resourceIds,
      aIApps: this.form.aIAppsCollection[this.form.resource[ResourceTypeEnum.AI]]
    }
    // 触发表单重新验证
    this.$parent.$emit('el.form.change')
  }

  /**
   * 初始化
   */
  private mounted() {
    this.getAllResourcesAndBindList()
  }

  /**
   * 单击资源包表格行后选中该数据
   * @param resourceType 资源包类型
   * @param row 资源包
   */
  private onResourceRowClick(resourceType: ResourceTypeEnum, row: any) {
    this.form.resource[resourceType] = row.resourceId
  }

  /**
   * 加载资源包
   * @param resourceType 资源包类型
   */
  private async getResouces(resourceType: ResourceTypeEnum) {
    try {
      this.loading[resourceType] = true
      const res = await getResources({
        type: resourceType
      })
      // 过滤已过期的资源包
      const list = res.resPkgList.filter((resource: any) => {
        if (new Date().getTime() < new Date(resource.expireTime).getTime()) {
          return resource
        }
      })
      this.resourceList[resourceType] = list
    } catch (e) {
      this.$message.error(e.message)
    } finally {
      this.loading[resourceType] = false
    }
  }

  /**
   * 加载设备绑定的资源包和应用列表
   */
  private async getDeviceResource() {
    try {
      this.loading.bindList = true
      const res = await getDeviceResource({
        deviceId: this.deviceId
      })
      res.resources && res.resources.forEach(resource => {
        this.form.resource[resource.resourceType] = resource.resourceId
      })
      const aIApps = res.aIApps.map(app => {
        return {
          aIAppId: app.aIAppId,
          aIType: app.aIType
        }
      })
      this.$set(this.form.aIAppsCollection, this.form.resource[ResourceTypeEnum.AI], aIApps)
      // 保存原始数据用于校验
      this.orginalResource.resourceIds = res.resources.map(resource => resource.resourceId)
      this.orginalResource.appSize = res.aIApps.length
    } catch(e) {
      this.$message.error(e.message)
    } finally {
      this.loading.bindList = false
    }
  }

  /**
   * 加载所有资源列表和已绑定的列表
   */
  private async getAllResourcesAndBindList() {
    await Promise.all([
      this.getResouces(ResourceTypeEnum.Video),
      this.getResouces(ResourceTypeEnum.AI),
      this.getResouces(ResourceTypeEnum.Upload),
      this.isEdit && this.getDeviceResource()
    ])
    this.$emit('loaded')
  }

  /**
   * 校验资源包
   * 1）新建设备必须选择资源包
   * 2）视频资源包剩余数量需要大于通道数
   * 3）选择AI包后必须选择至少一个AI应用
   * 4）AI资源包剩余数量需要大于所选的AI应用数量
   */
  public validate(deviceChannelSize) {
    const messages = []

    const _validateRemain = (resourceType, size) => {
      // 如果当前resourceId不在orginalResource.resourceIds中，则表示该类型的资源包的值被更改。如果未更改则需要跳过数量判断。
      const resourceId = this.form.resource[resourceType]
      const isChanged = this.orginalResource.resourceIds.indexOf(resourceId) === -1
      // 获得剩余数量
      const resource = this.resourceList[resourceType].find(resource => resource.resourceId === resourceId)
      const remainCount = resource && resource.remainDeviceCount
      if (isChanged && (size > remainCount)) {
        return `${ResourceType[resourceType]}接入设备余量不足，请增加包资源！`
      }
    }
    // 判断视频包
    if (!this.isEdit && !this.isFreeUser && !this.form.resource[ResourceTypeEnum.Video]) {
      messages.push('请配置视频包')
    } else {
      const videoMessage = _validateRemain(ResourceTypeEnum.Video, deviceChannelSize)
      videoMessage && messages.push(videoMessage)
    }

    // 判断AI包
    if (this.form.resource[ResourceTypeEnum.AI]) {
      if (!this.resource.aIApps.length) {
        messages.push('请至少选择一个AI应用')
      } else {
        const aIMessage = _validateRemain(ResourceTypeEnum.AI, this.resource.aIApps.length)
        aIMessage && messages.push(aIMessage)
      }
    }

    return {
      result: !messages.length,
      message: messages.join('; ')
    }
  }

  /**
   * 过滤ResourceIds为null的值
   * @param resourceIds 资源包ID数组
   */
  private filterResourceIds(resourceIds) {
    return resourceIds.filter(id => !!id)
  }
}
</script>
<style lang="scss" scoped>
  .resource-tabs {
    &.el-tabs {
      margin: 0;
    }

    .resource-id {
      ::v-deep .el-radio__label {
        display: none;
      }

      ::v-deep .el-radio__input {
        margin-right: 3px;
      }
    }

    ::v-deep .el-tabs__header {
      margin-bottom: 0;
    }

    &__content {
      border: 1px solid $border-color-light-1;
      border-top: none;
      padding: 10px;

      .el-radio__label {
        font-weight: normal;
      }
    }

    &__none {
      line-height: 23px;
      transition: 'background' 0.2s;

      label {
        padding: 10px;
        display: block;
      }

      &:hover {
        background: #f5f7fa;
      }
    }

    ::v-deep .el-table .el-table__row {
      cursor: pointer;
    }
  }

  .resource-apps {
    margin-top: $margin-small;

    &__stat {
      margin-top: $margin-small;
      padding: $padding-small;
      line-height: 100%;
    }
  }
</style>
