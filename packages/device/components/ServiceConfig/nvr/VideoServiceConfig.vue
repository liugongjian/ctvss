<template>
  <div class="video-service-config">
    <el-button v-if="selectedList.length < configManager.channelSize && !isView" type="text" @click="bindingChannel">+ 配置通道</el-button>
    <span class="config-title">已配置通道：</span>
    <el-table
      ref="nvrTable"
      v-loading="loading"
      :data="realSelectedList"
      fit
    >
      <el-table-column show-overflow-tooltip :prop="nvrConfigEnum.ChannelName" label="已配置通道" min-width="90">
        <template slot-scope="{ row }">
          {{ row[nvrConfigEnum.ChannelName] }}
        </template>
      </el-table-column>
      <el-table-column :prop="nvrConfigEnum.BillingMode" label="计费模式">
        <template slot-scope="{ row }">
          {{ billingModeType[row[nvrConfigEnum.BillingMode]] }}
        </template>
      </el-table-column>
      <el-table-column label="余量" min-width="110">
        <template slot-scope="{ row }">
          {{ remain(row) }}
        </template>
      </el-table-column>
      <el-table-column :prop="nvrConfigEnum.ExpireTime" label="到期时间" min-width="160" />
      <el-table-column show-overflow-tooltip :prop="nvrConfigEnum.StorageTime" label="存储配置">
        <template slot-scope="{ row }">
          {{ row[nvrConfigEnum.StorageTime] }}
        </template>
      </el-table-column>
      <el-table-column v-if="!isView" label="操作" prop="action" width="80" fixed="right">
        <template slot-scope="{ row }">
          <el-button type="text" @click="unBindingChannel(row.channelNum)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <VideoServiceBindingDialog
      v-if="showBindingDialog"
      :selected-list="selectedList"
      :real-package-remain="realPackageRemainObj"
      @on-close="closeDialog"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Inject, Watch } from 'vue-property-decorator'
import { BillingModeEnum, NvrConfigEnum, ConfigModeEnum } from '@vss/device/enums/billing'
import { BillingModeType } from '@vss/device/dicts/resource'
import VideoServiceBindingDialog from './VideoServiceBindingDialog.vue'
@Component({
  name: 'NvrVideoServiceConfig',
  components: {
    VideoServiceBindingDialog
  }
})
export default class extends Vue {
  @Inject({ default: () => new Object() })
  private configManager

  private nvrConfigEnum = NvrConfigEnum
  private billingModeEnum = BillingModeEnum
  private billingModeType = BillingModeType

  private loading = false
  private showBindingDialog = false
  private selectedList = []
  private realSelectedList = []
  private initPackageRemainObj = {}
  private realPackageRemainObj = {}

  private remain(row) {
    return row[NvrConfigEnum.BillingMode] === BillingModeEnum.Packages ? `${row[NvrConfigEnum.RemainDeviceCount]}路 / ${row[NvrConfigEnum.TotalDeviceCount]}路` : '-'
  }

  private get isView() {
    return this.configManager.configMode === ConfigModeEnum.View
  }

  @Watch('configManager.channelSize')
  private channelSizeChange(channelSize: number) {
    console.log(this.selectedList)
    this.selectedList = this.selectedList.filter(item => +item.channelNum <= channelSize)
    console.log(this.selectedList)
  }

  @Watch('selectedList', { deep: true })
  private selectedListChange(selectedList) {
    this.realPackageRemainObj = { ...this.initPackageRemainObj }
    selectedList.forEach(item => {
      if (item.billingMode === BillingModeEnum.Packages) {
        if (this.initPackageRemainObj[item.resourceId] === undefined) {
          this.initPackageRemainObj[item.resourceId] = +item.remainDeviceCount
          this.realPackageRemainObj[item.resourceId] = +item.remainDeviceCount - 1
        } else {
          this.realPackageRemainObj[item.resourceId] = this.realPackageRemainObj[item.resourceId] - 1
        }
      }
    })
    this.realSelectedList = selectedList.map(item => {
      return {
        ...item,
        [NvrConfigEnum.RemainDeviceCount]: this.realPackageRemainObj[item.resourceId]
      }
    })
    this.$emit('config-change', selectedList.map(item => {
      return {
        billingMode: item.billingMode,
        channelNum: item.channelNum + '',
        resourceId: item.billingMode === BillingModeEnum.Packages ? item.resourceId : '',
        recordNum: item.recordStream,
        templateId: item.templateId
      }
    }))
  }

  private async mounted() {
    await this.getConfigList()
  }

  private async getConfigList() {
    try {
      this.loading = true
      const videoInfo = this.configManager.initInfo.video
      if (videoInfo && videoInfo.length) {
        const res = videoInfo
        res.forEach(item => {
          if (item.billingMode === BillingModeEnum.Packages) {
            if (this.initPackageRemainObj[item.resourceId] === undefined) {
              this.initPackageRemainObj[item.resourceId] = +item.remainDeviceCount + 1
            } else {
              this.initPackageRemainObj[item.resourceId]++
            }
          }
        })
        this.selectedList = res
      }
    } catch (e) {
      this.$message.error(e.message)
    } finally {
      this.loading = false
    }
  }

  private bindingChannel() {
    this.showBindingDialog = true
  }

  private unBindingChannel(channleNum: number) {
    const target = this.selectedList.findIndex(channel => channel.channelNum === channleNum)
    if (target >= 0) this.selectedList.splice(target, 1)
  }

  public async validateConfigForm() {
    if (this.selectedList.length < this.configManager.channelSize) {
      return new Error('请为所有通道配置资源包')
    }
  }

  private closeDialog(data) {
    console.log(data)
    this.showBindingDialog = false
    Array.isArray(data) && (
      this.selectedList.push(...data.map(item => {
        return item.billingMode === BillingModeEnum.Packages
          ? {
            [NvrConfigEnum.ChannelNum]: item.channelNum,
            [NvrConfigEnum.ChannelName]: item.name,
            [NvrConfigEnum.BillingMode]: item.billingMode,
            [NvrConfigEnum.ResourceId]: item.resourceId,
            [NvrConfigEnum.RemainDeviceCount]: item.resource['remainDeviceCount'],
            [NvrConfigEnum.TotalDeviceCount]: item.resource['totalDeviceCount'],
            [NvrConfigEnum.ExpireTime]: item.resource['expireTime'],
            [NvrConfigEnum.StorageTime]: `${item.resource['storageTime']}天`
          }
          : {
            [NvrConfigEnum.ChannelNum]: item.channelNum,
            [NvrConfigEnum.ChannelName]: item.name,
            [NvrConfigEnum.BillingMode]: item.billingMode,
            [NvrConfigEnum.TemplateId]: item.templateId,
            [NvrConfigEnum.ExpireTime]: '永久',
            [NvrConfigEnum.StorageTime]: item.RecordTemplateName || '默认30天存储录像模板'
          }
      }))
    )
  }
}
</script>
<style lang="scss" scoped>
.video-service-config {
  .config-title {
    display: block;
    color: $textGrey;
    padding: 5px 0;
  }
}
</style>