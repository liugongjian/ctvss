<template>
  <el-tabs v-model="resourceTabType" type="card" class="resource-tabs">
    <el-tab-pane label="视频包" name="video">
      <!--视频包-->
      <div v-loading="loading.resouceVideoList" class="resource-tabs__content">
        <el-table :data="resouceVideoList" @row-click="onResourceRowClick('video', ...arguments)">
          <el-table-column prop="id" label="编号">
            <template scope="scope">
              <el-radio v-model="form.resouceVideo" :label="scope.row.id" />
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
          <el-radio v-model="form.resouceVideo" :label="-1" @change="onFormChange">不绑定任何视频包</el-radio>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane label="AI包" name="ai">
      <!--AI包-->
      <div v-loading="loading.resouceAiList" class="resource-tabs__content">
        <el-table :data="resouceAiList" @row-click="onResourceRowClick('ai', ...arguments)">
          <el-table-column prop="id" label="编号">
            <template scope="scope">
              <el-radio v-model="form.resouceAi" :label="scope.row.id" />
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
          <el-radio v-model="form.resouceAi" :label="-1" @change="onFormChange">不绑定任何视频包</el-radio>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane label="上行带宽包" name="upload">
      <!--上行带宽包-->
      <div v-loading="loading.resouceUploadList" class="resource-tabs__content">
        <el-table :data="resouceUploadList" @row-click="onResourceRowClick('upload', ...arguments)">
          <el-table-column prop="id" label="编号">
            <template scope="scope">
              <el-radio v-model="form.resouceUpload" :label="scope.row.id" />
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
          <el-radio v-model="form.resouceUpload" :label="-1" @change="onFormChange">不绑定任何视频包</el-radio>
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
  @Prop() private device?: any

  private resourceTabType = 'video'
  private resourceAiType = ResourceAiType
  private form: any = {
    resouceVideo: null,
    resouceAi: null,
    resouceUpload: null
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

  private onFormChange() {
    this.$emit('resource-change', this.form)
  }

  @Watch('device', {
    deep: true
  })
  private onDeviceChange(device: any) {
    console.log(device)
    this.form = {
      resouceVideo: device.resouceVideo,
      resouceAi: device.resouceAi,
      resouceUpload: device.resouceUpload
    }
  }

  private onResourceRowClick(type: string, row: any) {
    switch (type) {
      case 'video':
        this.form.resouceVideo = row.resourceId
        break
      case 'ai':
        this.form.resouceAi = row.resourceId
        break
      case 'upload':
        this.form.resouceUpload = row.resourceId
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
