<template>
  <div class="billing-mode-selector">
    <el-form
      ref="configForm"
      :model="configForm"
      :rules="rules"
      label-position="left"
      label-width="110px"
    >
      <el-form-item label="计费模式:" :prop="billingEnum.BillingMode">
        <span v-show="isView">{{ billingModeType[configForm[billingEnum.BillingMode]] }}</span>
        <el-select
          v-show="!isView"
          v-model="configForm[billingEnum.BillingMode]"
        >
          <el-option v-if="hasPagckagesMode" :key="billingModeEnum.Packages" :label="billingModeType[billingModeEnum.Packages]" :value="billingModeEnum.Packages" />
          <el-option v-if="hasOnDemandMode" :key="billingModeEnum.OnDemand" :label="billingModeType[billingModeEnum.OnDemand]" :value="billingModeEnum.OnDemand" />
          <el-option v-if="hasUnBindingMode" :key="billingModeEnum.UnBinding" :label="billingModeType[billingModeEnum.UnBinding]" :value="billingModeEnum.UnBinding" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="hasRecordStreamConfig" label="录制配置:" :prop="billingEnum.RecordNum">
        <!-- <span v-show="isView">{{ (configManager.deviceStreamSize === 1 ? recordStreamType : recordStreamsType)[configForm[billingEnum.RecordStream]] }}</span> -->
        <span v-show="isView">{{ recordStreamType[configForm[billingEnum.RecordNum]] }}</span>
        <el-radio-group v-show="!isView" v-model="configForm[billingEnum.RecordNum]">
          <!-- <el-radio v-if="configManager.deviceStreamSize !== 1" :label="1">{{ recordStreamType['1'] }}</el-radio>
          <el-radio v-if="configManager.deviceStreamSize >= 2" :label="2">{{ recordStreamType['2'] }}</el-radio>
          <el-radio v-if="configManager.deviceStreamSize >= 3" :label="3">{{ recordStreamType['3'] }}</el-radio> -->
          <!-- <el-radio v-if="configManager.deviceStreamSize === 1" :label="1">{{ recordStreamType['1'] }}</el-radio> -->
          <el-radio label="1">{{ recordStreamType['1'] }}</el-radio>
          <el-radio label="0">{{ recordStreamType['0'] }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="hasRecordTemplateConfig" label="录制模板:" :prop="billingEnum.TemplateId">
        <span v-show="isView">{{ templateName }}</span>
        <el-select
          v-show="!isView"
          ref="templateSelector"
          v-model="configForm[billingEnum.TemplateId]"
          v-loading="loading.recordTemplate"
        >
          <el-option
            v-for="item in recordTemplateList"
            :key="item.templateId"
            :label="item.templateName"
            :value="item.templateId"
          />
        </el-select>
      </el-form-item>
      <div v-if="hasPackagesTable">
        <el-form-item class="content-wrap-item" label="资源包列表:" :prop="billingEnum.ResourceId">
          <el-table
            ref="packagesTable"
            v-loading="loading.table"
            :data="resourceInfoList"
            fit
            @row-click="tableRowClick"
          >
            <el-table-column v-if="isView" show-overflow-tooltip :prop="packagesEnum.ResourceId" label="订单号" min-width="120" fixed="left">
              <template slot-scope="scope">
                <span class="resource-id">
                  {{ scope.row.workOrderNo }}
                </span>
              </template>
            </el-table-column>
            <el-table-column v-else show-overflow-tooltip :prop="packagesEnum.ResourceId" label="订单号" min-width="120" fixed="left">
              <template slot-scope="scope">
                <span class="resource-id">
                  <el-radio v-model="configForm[billingEnum.ResourceId]" :label="scope.row.resourceId" @change="configForm[billingEnum.Resource] = scope.row" />
                  {{ scope.row.workOrderNo }}
                </span>
              </template>
            </el-table-column>
            <el-table-column :prop="packagesEnum.TotalDeviceCount" label="可接入设备数量">
              <template slot-scope="scope">
                {{ scope.row.totalDeviceCount }}路
              </template>
            </el-table-column>
            <el-table-column :prop="packagesEnum.RemainDeviceCount" label="接入设备余量">
              <template slot-scope="scope">
                {{ scope.row.remainDeviceCount }}路
              </template>
            </el-table-column>
            <el-table-column v-if="resourceType === resourceTypeEnum.Video" :prop="packagesEnum.BitRate" label="码率">
              <template slot-scope="scope">
                {{ scope.row.bitRate }}Mbps
              </template>
            </el-table-column>
            <el-table-column v-if="resourceType === resourceTypeEnum.Video" :prop="packagesEnum.StorageTime" label="存储周期" min-width="90">
              <template slot-scope="scope">
                {{ scope.row.storageTime }}天
              </template>
            </el-table-column>
            <el-table-column v-if="resourceType === resourceTypeEnum.AI" :prop="packagesEnum.BitRate" label="分析类型">
              <template slot-scope="scope">
                {{ resourceAiType[scope.row.aIType] }}
              </template>
            </el-table-column>
            <el-table-column :prop="packagesEnum.CreateTime" label="开通时间" min-width="170" />
            <el-table-column :prop="packagesEnum.ExpireTime" label="到期时间" min-width="170" />
          </el-table>
        </el-form-item>
      </div>
    </el-form>
    <span v-if="configForm[billingEnum.BillingMode] === billingModeEnum.UnBinding" class="config-info">
      <i class="el-icon-warning-outline" />
      {{ unBindingInfo[resourceType] }}
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, VModel, Watch, Inject } from 'vue-property-decorator'
import { ResourceAiType, BillingModeType, RecordStreamType, RecordStreamsType } from '@vss/device/dicts/resource'
import { BillingEnum, BillingModeEnum, PackagesEnum, ResourceTypeEnum, ConfigModeEnum } from '@vss/device/enums/billing'
import { DeviceTypeEnum } from '@vss/device/enums/index'
import { getStorageTemplate, getRecordTemplates } from '@vss/device/api/template'
@Component({
  name: 'BillingModeSelector'
})
export default class extends Vue {
  @Inject({ default: () => new Object() })
  private configManager

  @Prop({ default: ResourceTypeEnum.Video })
  private resourceType: ResourceTypeEnum

  @Prop({ default: () => new Object() })
  private realPackageRemain

  @VModel({ 
    default: () => {
      return {
        [BillingEnum.BillingMode]: BillingModeEnum.Packages,
        [BillingEnum.RecordNum]: '1',
        [BillingEnum.TemplateId]: '',
        [BillingEnum.RecordTemplateName]: '',
        [BillingEnum.ResourceId]: '',
        [BillingEnum.Resource]: {}
      }
    }
  })
  private configForm

  private deviceTypeEnum = DeviceTypeEnum
  private billingEnum = BillingEnum
  private billingModeEnum = BillingModeEnum
  private packagesEnum = PackagesEnum
  private resourceTypeEnum = ResourceTypeEnum
  private resourceAiType = ResourceAiType
  private billingModeType = BillingModeType
  private recordStreamsType = RecordStreamsType
  private recordStreamType = RecordStreamType
  private recordTemplateList = []
  private resourceList = []
  private rules = {
    [BillingEnum.BillingMode]: [{ required: true, message: '请选择计费模式', trigger: 'blur' }],
    [BillingEnum.TemplateId]: [{ required: true, message: '请选择录制模板', trigger: 'blur' }],
    [BillingEnum.RecordNum]: [{ required: true, message: '请选择录制配置', trigger: 'blur' }],
    [BillingEnum.ResourceId]: [{ required: true, message: '请选择资源包', trigger: 'blur' }],
  }
  private unBindingInfo = {
    [ResourceTypeEnum.Video]: '停用视频服务后将立刻停止设备接入，不能进行实时预览。已存储的录像可继续回看。',
    [ResourceTypeEnum.Viid]: '停用视图服务',
  }

  private loading = {
    table: false,
    recordTemplate: false
  }

  private get isView() {
    return this.configManager.configMode === ConfigModeEnum.View
  }

  private get templateName() {
    const curTemp = this.recordTemplateList.find(item => item.templateId === this.configForm.templateId)
    return curTemp ? curTemp.templateName : ''
  }

  private get hasPagckagesMode() {
    let flag = false
    switch (this.resourceType) {
      case ResourceTypeEnum.Video:
        flag = !!this.configManager[ResourceTypeEnum.Video].length
        break
      case ResourceTypeEnum.AI:
        flag = !!this.configManager[ResourceTypeEnum.AI].length
        break
      case ResourceTypeEnum.Viid:
        flag = false
        break
    }
    if (!this.configForm[BillingEnum.BillingMode] && flag) this.configForm[BillingEnum.BillingMode] = BillingModeEnum.Packages
    return flag
  }

  private get hasOnDemandMode() {
    const flag = this.configManager.hasOndemand
    if (!this.configForm[BillingEnum.BillingMode] && flag && !this.hasPagckagesMode) this.configForm[BillingEnum.BillingMode] = BillingModeEnum.OnDemand
    return flag
  }

  private get hasUnBindingMode() {
    // 编辑时能选停用，AItab时除外
    return this.configManager.configMode === 
      ConfigModeEnum.Edit && ![ResourceTypeEnum.AI].includes(this.resourceType)
  }

  private get hasRecordStreamConfig() {
    // 按需模式下仅IPC拥有录制码流选择
    return [BillingModeEnum.OnDemand].includes(this.configForm[BillingEnum.BillingMode]) && [ResourceTypeEnum.Video].includes(this.resourceType)
  }

  private get hasRecordTemplateConfig() {
    // 按需模式下仅视频与视图能配录制模板
    return [BillingModeEnum.OnDemand].includes(this.configForm[BillingEnum.BillingMode])
      && [ResourceTypeEnum.Video, ResourceTypeEnum.Viid].includes(this.resourceType)
      && this.configForm[BillingEnum.RecordNum] === '1'
  }

  private get hasPackagesTable() {
    // 资源包模式拥有资源包table
    return [BillingModeEnum.Packages].includes(this.configForm[BillingEnum.BillingMode])
  }

  private get resourceInfoList() {
    return this.configManager.configMode === ConfigModeEnum.View ? this.resourceList.filter(item => item.resourceId === this.configForm.resourceId) : this.resourceList
  }

  // @Watch('configManager.deviceStreamSize')
  // private deviceStreamSizeChange() {
  //   if (this.configForm[BillingEnum.RecordNum] !== '0') {
  //     this.configForm[BillingEnum.RecordNum] = '1'
  //   }
  // }

  private async mounted() {
    await this.getResources(this.resourceType)
    this.getRecordTemplate()
  }

  /**
   * 加载资源包
   * @param resourceType 资源包类型
   */
  private async getResources(resourceType: ResourceTypeEnum) {
    if (resourceType === ResourceTypeEnum.Viid) return
    const list = [...this.configManager[resourceType]]
    // 更新资源包实际remain
    if (Array.isArray(list)) {
      list.forEach(resource => {
        if (this.realPackageRemain[resource.resourceId] !== undefined) {
          resource.remainDeviceCount = this.realPackageRemain[resource.resourceId]
        }
      })
      this.resourceList = list
    }
  }

  /**
   * 获取录制模板
   */
  private async getRecordTemplate() {
    try {
      this.loading.recordTemplate = true
      let res
      if (this.resourceType === ResourceTypeEnum.Video) {
        res = await getRecordTemplates({})
      } else if (this.resourceType === ResourceTypeEnum.Viid) {
        res = await getStorageTemplate({})
      } else {
        return
      }
      this.recordTemplateList = res.templates
      if (this.recordTemplateList.length && !+this.configForm[BillingEnum.TemplateId]) {
        this.configForm[BillingEnum.TemplateId] = this.recordTemplateList[0].templateId
      }
    } catch (e) {
      console.log(e)
    } finally {
      this.loading.recordTemplate = false
    }
  }

  private tableRowClick(row) {
    this.configForm[BillingEnum.ResourceId] = row.resourceId
    this.configForm[BillingEnum.Resource] = row
  }

  /**
   * 校验video表单
   */
  public validateConfigForm() {
    const configForm: any = this.$refs.configForm
    return new Promise((resolve) => {
      configForm.validate((valid) => {
        resolve(valid)
      })
    })
  }
}
</script>

<style lang="scss" scoped>
.billing-mode-selector {
  .el-form {
    .el-form-item {
      margin-bottom: 25px;

      ::v-deep {
        .el-input,
        .el-select {
          width: 200px !important;
        }
      }

      ::v-deep .el-table__row {
        cursor: pointer;
      }
    }

    .resource-id {
      ::v-deep .el-radio__label {
        display: none;
      }

      ::v-deep .el-radio__input {
        margin-right: 3px;
      }
    }

    .content-wrap-item {
      max-width: 100%;

      ::v-deep .el-form-item__content {
        margin-left: 0 !important;
      }
    }
  }

  .config-info {
    line-height: 50px;
    color: $textGrey;
  }
}
</style>