<template>
  <el-tabs v-model="resourceTabType" type="card" class="resource-tabs">
    <el-tab-pane label="视频包" name="video">
      <!--视频包-->
      <div v-loading="loading.resouceVideoList" class="resource-tabs__content">
        <el-table :data="resouceVideoList" fit @row-click="onResourceRowClick('video', ...arguments)">
          <el-table-column prop="resourceId" label="编号" min-width="120">
            <template slot-scope="scope">
              <span class="resource-id">
                <el-radio v-model="form.resouceVideoId" :label="scope.row.resourceId" />
                {{ scope.row.resourceId.substr(0, 10) }}
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
        <div v-if="isUpdate || isFreeUser" class="resource-tabs__none">
          <el-radio v-model="form.resouceVideoId" :label="-1" @change="onFormChange(false)">不绑定任何视频包</el-radio>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane v-if="inProtocol === 'gb28181'" label="AI包" name="ai">
      <!--AI包-->
      <div v-loading="loading.resouceAiList" class="resource-tabs__content">
        <el-table :data="resouceAiList" fit @row-click="onResourceRowClick('ai', ...arguments)">
          <el-table-column prop="resourceId" label="编号" min-width="120">
            <template slot-scope="scope">
              <span class="resource-id">
                <el-radio v-model="form.resouceAiId" :label="scope.row.resourceId" />
                {{ scope.row.resourceId.substr(0, 10) }}
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
              {{ resourceAiType[scope.row.aiType] }}
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="开通时间" min-width="170" />
          <el-table-column prop="expireTime" label="到期时间" min-width="170" />
        </el-table>
        <div class="resource-tabs__none">
          <el-radio v-model="form.resouceAiId" :label="-1" @change="onFormChange(false)">不绑定任何AI包</el-radio>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane v-if="!isPrivateInNetwork" label="上行带宽包" name="upload">
      <!--上行带宽包-->
      <div v-loading="loading.resouceUploadList" class="resource-tabs__content">
        <el-table :data="resouceUploadList" fit @row-click="onResourceRowClick('upload', ...arguments)">
          <el-table-column prop="resourceId" label="编号" min-width="120">
            <template slot-scope="scope">
              <span class="resource-id">
                <el-radio v-model="form.resouceUploadId" :label="scope.row.resourceId" />
                {{ scope.row.resourceId.substr(0, 10) }}
              </span>
            </template>
          </el-table-column>
          <!-- <el-table-column prop="value" label="剩余上行带宽">
            <template slot-scope="scope">
              {{ scope.row.value }}Mbps
            </template>
          </el-table-column> -->
          <el-table-column prop="bandWidth" label="上行带宽总量">
            <template slot-scope="scope">
              {{ scope.row.bandWidth }}Mbps
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="开通时间" min-width="170" />
          <el-table-column prop="expireTime" label="到期时间" min-width="170" />
        </el-table>
        <div v-if="isUpdate || isFreeUser" class="resource-tabs__none">
          <el-radio v-model="form.resouceUploadId" :label="-1" @change="onFormChange(false)">不绑定任何上行带宽包</el-radio>
        </div>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>
<script lang='ts'>
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { ResourceAiType } from '@/dics'
import { getResources } from '@/api/billing'
import { UserModule } from '@/store/modules/user'

@Component({
  name: 'ResourceTabs'
})
export default class extends Vue {
  @Prop() private value?: any
  @Prop() private isUpdate?: boolean
  @Prop() private inProtocol?: string
  @Prop() private isPrivateInNetwork?: string

  private resourceTabType = 'video'
  private resourceAiType = ResourceAiType
  private form: any = {
    resouceVideoId: -1,
    resouceAiId: -1,
    resouceUploadId: -1
  }
  private loading:any = {
    resouceVideoList: false,
    resouceAiList: false,
    resouceUploadList: false
  }
  private resouceVideoList = []
  private resouceAiList = []
  private resouceUploadList = []

  public get isFreeUser() {
    return UserModule.tags && UserModule.tags.resourceFree === '1'
  }

  private async mounted() {
    this.resouceVideoList = await this.getResouces('VSS_VIDEO', 'resouceVideoList')
    this.resouceAiList = await this.getResouces('VSS_AI', 'resouceAiList')
    this.resouceUploadList = await this.getResouces('VSS_UPLOAD_BW', 'resouceUploadList')
    this.onFormChange(true)
  }

  /**
   * 加载资源包
   */
  private async getResouces(type: string, loadingType: string) {
    try {
      this.loading[loadingType] = true
      const res = await getResources({
        type
      })
      // 过滤已过期的资源包
      const list = res.resPkgList.filter((resource: any) => {
        if (new Date().getTime() < new Date(resource.expireTime).getTime()) {
          return resource
        }
      })
      return list
    } catch (e) {
      this.$message.error(e.message)
    } finally {
      this.loading[loadingType] = false
    }
  }

  /**
   * 监听设备详情
   */
  @Watch('value', {
    deep: true
  })
  private onDeviceChange(resources: any) {
    resources.forEach((resource: any) => {
      switch (resource.resourceType) {
        case 'VSS_VIDEO':
          this.form.resouceVideoId = resource.resourceId
          break
        case 'VSS_AI':
          this.form.resouceAiId = resource.resourceId
          break
        case 'VSS_UPLOAD_BW':
          this.form.resouceUploadId = resource.resourceId
          break
      }
    })
    this.onFormChange(true)
  }

  /**
   * 切换资源包
   */
  private onFormChange(isInit: boolean) {
    const resouceVideo = this.resouceVideoList.find((resource: any) => resource.resourceId === this.form.resouceVideoId)
    const resouceAi = this.resouceAiList.find((resource: any) => resource.resourceId === this.form.resouceAiId)
    const resouceUpload = this.resouceUploadList.find((resource: any) => resource.resourceId === this.form.resouceUploadId)
    const resources = [resouceVideo, resouceAi, resouceUpload]
    const result: any = []
    const mapping: any = []
    resources.forEach((resource: any) => {
      if (resource) {
        const resourceResult = {
          workOrderId: resource.workOrderId,
          resourceId: resource.resourceId,
          resourceType: resource.type
        }
        result.push(resourceResult)
        mapping[resource.resourceId] = Object.assign(resourceResult, { remainDeviceCount: resource.remainDeviceCount })
      }
    })
    if (!isInit) {
      this.$emit('input', result)
    }
    this.$emit('on-change', {
      isInit,
      mapping
    })
  }

  /**
   * 单击行
   */
  private onResourceRowClick(type: string, row: any) {
    switch (type) {
      case 'video':
        this.form.resouceVideoId = row.resourceId
        break
      case 'ai':
        this.form.resouceAiId = row.resourceId
        break
      case 'upload':
        this.form.resouceUploadId = row.resourceId
        break
    }
    this.onFormChange(false)
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
      border: 1px solid #dfe4ed;
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
        background: #F5F7FA;
      }
    }

    ::v-deep .el-table .el-table__row {
      cursor: pointer;
    }
  }
</style>
