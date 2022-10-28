<template>
  <el-tabs v-model="resourceTabType" v-loading="loading.bindList" type="card" class="resource-tabs">
    <el-tab-pane label="视频包" :name="ResourceTypeEnum.Video">
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
        <div v-if="isUpdate || isFreeUser" class="resource-tabs__none">
          <el-radio v-model="form.resource[ResourceTypeEnum.Video]" :label="null">不绑定任何视频包</el-radio>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane label="AI包" name="ai">
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
          <el-table-column prop="aiType" label="分析类型">
            <template slot-scope="scope">
              {{ ResourceAiType[scope.row.aiType] }}
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
        />
      </div>
    </el-tab-pane>
    <el-tab-pane v-if="!isPrivateInNetwork" label="上行带宽包" name="upload">
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
        <div v-if="isUpdate || isFreeUser" class="resource-tabs__none">
          <el-radio v-model="form.resource[ResourceTypeEnum.Upload]" :label="-1">不绑定任何上行带宽包</el-radio>
        </div>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>
<script lang='ts'>
import { Component, Prop, Watch, VModel, Vue } from 'vue-property-decorator'
import { Resource } from '@vss/device/type/Resource'
import { ResourceAiType } from '@vss/device/dicts'
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

  /**
   * 是否为更新模式
   */
  public get isUpdate() {
    return !!this.deviceId
  }

  /**
   * 是否为免费用户
   */
  public get isFreeUser() {
    return UserModule.tags && UserModule.tags.resourceFree === '1'
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
      this.isUpdate && this.getDeviceResource()
    ])
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
    margin-top: 10px;
  }

  .algoWarning {
    padding: 5px 10px;
    border: 1px solid;

    span {
      margin-left: 12px;
      font-size: 12px;
      display: inline-block;
    }

    ::v-deep .el-icon-warning {
      font-size: 18px;
      vertical-align: middle;
    }

    &.algoWarningError {
      border-color: #950012;
      color: #950012;
      background: #fadee0;
    }

    &.algoWarningTip {
      border-color: #4a88db;
      color: #4a88db;
      background: #edf4fe;
    }
  }

  .algoTabTableHidden {
    ::v-deep .el-table__header-wrapper .el-checkbox {
      display: none;
    }
  }
</style>
