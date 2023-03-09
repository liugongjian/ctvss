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
        <el-select
          v-model="configForm[billingEnum.BillingMode]"
          @change="billingModeChange"
        >
          <el-option :key="billingModeEnum.Packages" label="资源包" :value="billingModeEnum.Packages" />
          <el-option :key="billingModeEnum.OnDemand" label="按需计费" :value="billingModeEnum.OnDemand" />
        </el-select>
      </el-form-item>
      <div v-if="configForm[billingEnum.BillingMode] === billingModeEnum.OnDemand && resourceType === resourceTypeEnum.Video">
        <el-form-item label="录制配置:" :prop="billingEnum.RecordStream">
          <el-radio-group v-model="configForm[billingEnum.RecordStream]">
            <el-radio :label="1">主码流录制</el-radio>
            <el-radio :label="2">子码流录制</el-radio>
            <el-radio :label="1">录制</el-radio>
            <el-radio :label="0">无录制</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="录制模板:" :prop="billingEnum.RecordTemplate">
          <el-select
            v-model="configForm[billingEnum.RecordTemplate]"
            placeholder="默认30天存储录像模板"
          >
            <el-option
              v-for="(item, index) in recordTemplateList"
              :key="index"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </div>
      <div v-if="configForm[billingEnum.BillingMode] === billingModeEnum.Packages">
        <el-form-item class="content-wrap-item" label="资源包列表:" :prop="billingEnum.Resource">
          <el-table
            ref="packagesTable"
            v-loading="loading.table"
            :data="resourceList"
            fit
            @row-click="tableRowClick"
          >
            <el-table-column show-overflow-tooltip :prop="packagesEnum.ResourceId" label="订单号" min-width="120" fixed="left">
              <template slot-scope="scope">
                <span class="resource-id">
                  <el-radio v-model="configForm[billingEnum.Resource]" :label="scope.row.resourceId" />
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
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, VModel } from 'vue-property-decorator'
import { ResourceAiType } from '@vss/device/dicts/resource'
import { BillingEnum, BillingModeEnum, PackagesEnum, ResourceTypeEnum } from '@vss/device/enums/billing'
import { getResources } from '@vss/device/api/billing'
@Component({
  name: 'BillingModeSelector'
})
export default class extends Vue {
  private billingEnum = BillingEnum
  private billingModeEnum = BillingModeEnum
  private packagesEnum = PackagesEnum
  private resourceTypeEnum = ResourceTypeEnum
  private resourceAiType = ResourceAiType

  @Prop({ default: ResourceTypeEnum.Video })
  private resourceType: ResourceTypeEnum

  @VModel({ 
    default: () => {
      return {
        [BillingEnum.BillingMode]: BillingModeEnum.Packages,
        [BillingEnum.RecordStream]: 1,
        [BillingEnum.RecordTemplate]: '',
        [BillingEnum.Resource]: ''
      }
    }
  })
  private configForm
  
  private recordTemplateList = []
  private resourceList = []
  private rules = {
    [BillingEnum.BillingMode]: [{ required: true, message: '请选择计费模式', trigger: 'blur' }],
    [BillingEnum.RecordStream]: [{ required: true, message: '请选择录制配置', trigger: 'blur' }],
    [BillingEnum.Resource]: [{ required: true, message: '请选择计资源包', trigger: 'blur' }],
  }

  private loading = {
    table: false
  }

  private mounted() {
    this.getResources(this.resourceType)
  }

  /**
   * 加载资源包
   * @param resourceType 资源包类型
   */
  private async getResources(resourceType: ResourceTypeEnum) {
    try {
      this.loading.table = true
      const res = await getResources({
        type: resourceType
      })
      // 过滤已过期的资源包
      const list = res.resPkgList.filter((resource: any) => {
        if (new Date().getTime() < new Date(resource.expireTime).getTime()) {
          return resource
        }
      })
      this.resourceList = list
    } catch (e) {
      this.$message.error(e.message)
    } finally {
      this.loading.table = false
    }
  }

  private tableRowClick(row) {
    this.configForm[BillingEnum.Resource] = row.resourceId
  }

  /**
   * 计费模式变化
   */
  private billingModeChange(mode: BillingModeEnum) {
    if (mode === BillingModeEnum.OnDemand) {
      this.configForm.resource = ''
    }
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
}
</style>