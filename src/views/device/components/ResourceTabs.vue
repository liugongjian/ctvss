<template>
  <el-tabs v-model="resourceTabType" type="card" class="resource-tabs">
    <el-tab-pane label="视频包" name="video">
      <!--视频包-->
      <div v-loading="loading.resouceVideoList" class="resource-tabs__content">
        <el-table :data="resouceVideoList" @row-click="onResourceRowClick('video', ...arguments)">
          <el-table-column prop="resourceId" label="编号">
            <template scope="scope">
              <el-radio v-model="form.resouceVideoId" :label="scope.row.resourceId" />
            </template>
          </el-table-column>
          <el-table-column prop="totalDeviceCount" label="可接入设备数量">
            <template scope="scope">
              {{ scope.row.totalDeviceCount }}路
            </template>
          </el-table-column>
          <el-table-column prop="remainDeviceCount" label="接入设备余量">
            <template scope="scope">
              {{ scope.row.remainDeviceCount }}路
            </template>
          </el-table-column>
          <el-table-column prop="bitRate" label="码率">
            <template scope="scope">
              {{ scope.row.bitRate }}Mbps
            </template>
          </el-table-column>
          <el-table-column prop="storageTime" label="存储周期">
            <template scope="scope">
              {{ scope.row.storageTime }}天
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="开通时间" />
          <el-table-column prop="expireTime" label="到期时间" />
        </el-table>
        <div v-if="resouceVideoList.length" class="resource-tabs__none">
          <el-radio v-model="form.resouceVideoId" :label="-1" @change="onFormChange">不绑定任何视频包</el-radio>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane label="AI包" name="ai">
      <!--AI包-->
      <div v-loading="loading.resouceAiList" class="resource-tabs__content">
        <el-table :data="resouceAiList" @row-click="onResourceRowClick('ai', ...arguments)">
          <el-table-column prop="resourceId" label="编号">
            <template scope="scope">
              <el-radio v-model="form.resouceAiId" :label="scope.row.resourceId" />
            </template>
          </el-table-column>
          <el-table-column prop="totalDeviceCount" label="可接入设备数量">
            <template scope="scope">
              {{ scope.row.totalDeviceCount }}路
            </template>
          </el-table-column>
          <el-table-column prop="remainDeviceCount" label="接入设备余量">
            <template scope="scope">
              {{ scope.row.remainDeviceCount }}路
            </template>
          </el-table-column>
          <el-table-column prop="aiType" label="分析类型">
            <template scope="scope">
              {{ resourceAiType[scope.row.aiType] }}
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="开通时间" />
          <el-table-column prop="expireTime" label="到期时间" />
        </el-table>
        <div v-if="resouceAiList.length" class="resource-tabs__none">
          <el-radio v-model="form.resouceAiId" :label="-1" @change="onFormChange">不绑定任何视频包</el-radio>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane label="上行带宽包" name="upload">
      <!--上行带宽包-->
      <div v-loading="loading.resouceUploadList" class="resource-tabs__content">
        <el-table :data="resouceUploadList" @row-click="onResourceRowClick('upload', ...arguments)">
          <el-table-column prop="resourceId" label="编号">
            <template scope="scope">
              <el-radio v-model="form.resouceUploadId" :label="scope.row.resourceId" />
            </template>
          </el-table-column>
          <el-table-column prop="value" label="剩余上行带宽">
            <template scope="scope">
              {{ scope.row.value }}Mbps
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="开通时间" />
          <el-table-column prop="expireTime" label="到期时间" />
        </el-table>
        <div v-if="resouceUploadList.length" class="resource-tabs__none">
          <el-radio v-model="form.resouceUploadId" :label="-1" @change="onFormChange">不绑定任何视频包</el-radio>
        </div>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>
<script lang='ts'>
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { ResourceAiType } from '@/dics'
import { getResources } from '@/api/billing'

@Component({
  name: 'ResourceTabs'
})
export default class extends Vue {
  @Prop() private value?: any

  private resourceTabType = 'video'
  private resourceAiType = ResourceAiType
  private form: any = {
    resouceVideoId: null,
    resouceAiId: null,
    resouceUploadId: null
  }
  private loading = {
    resouceVideoList: false,
    resouceAiList: false,
    resouceUploadList: false
  }
  private resouceVideoList = []
  private resouceAiList = []
  private resouceUploadList = []

  private async mounted() {
    this.resouceVideoList = await this.getResouces('VSS_VIDEO', this.loading.resouceVideoList)
    this.resouceAiList = await this.getResouces('VSS_AI', this.loading.resouceAiList)
    this.resouceUploadList = await this.getResouces('VSS_UPLOAD_BW', this.loading.resouceUploadList)
  }

  /**
   * 加载资源包
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async getResouces(type: string, loading: any) {
    try {
      loading = true
      const res = await getResources({
        type
      })
      return res.resPkgList
    } catch (e) {
      this.$message.error(e.message)
    } finally {
      loading = false
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
  }

  /**
   * 切换资源包
   */
  private onFormChange() {
    const resouceVideo = this.resouceVideoList.find((resource: any) => resource.resourceId === this.form.resouceVideoId)
    const resouceAi = this.resouceAiList.find((resource: any) => resource.resourceId === this.form.resouceAiId)
    const resouceUpload = this.resouceUploadList.find((resource: any) => resource.resourceId === this.form.resouceUploadId)
    const resources = [resouceVideo, resouceAi, resouceUpload]
    const result: any = []
    resources.forEach((resource: any) => {
      resource && result.push({
        workOrderId: resource.workOrderId,
        resourceId: resource.resourceId,
        resourceType: resource.type
      })
    })
    this.$emit('input', result)
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
    this.onFormChange()
  }
}
</script>
<style lang="scss" scoped>
  .resource-tabs {
    &.el-tabs {
      margin: 0;
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
