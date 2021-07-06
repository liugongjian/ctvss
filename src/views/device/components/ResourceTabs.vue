<template>
  <el-tabs v-model="resourceTabType" type="card" class="resource-tabs">
    <el-tab-pane label="视频包" name="video">
      <!--视频包-->
      <div class="resource-tabs__content">
        <el-table :data="resouceVideoList" @row-click="onResourceRowClick('video', ...arguments)">
          <el-table-column prop="resourceId" label="编号">
            <template scope="scope">
              <el-radio v-model="form.resouceVideo" :label="scope.row.resourceId" />
            </template>
          </el-table-column>
          <el-table-column prop="value" label="可接入设备数量">
            <template scope="scope">
              {{ scope.row.value }}路
            </template>
          </el-table-column>
          <el-table-column prop="value" label="接入设备余量">
            <template scope="scope">
              {{ scope.row.value }}路
            </template>
          </el-table-column>
          <el-table-column prop="codeRate" label="码率">
            <template scope="scope">
              {{ scope.row.codeRate }}Mbps
            </template>
          </el-table-column>
          <el-table-column prop="storageTime" label="存储周期">
            <template scope="scope">
              {{ scope.row.storageTime }}天
            </template>
          </el-table-column>
          <el-table-column prop="startTime" label="开通时间" />
          <el-table-column prop="endTime" label="到期时间" />
        </el-table>
        <div class="resource-tabs__none">
          <el-radio v-model="form.resouceVideo" :label="-1" @change="onFormChange">不绑定任何视频包</el-radio>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane label="AI包" name="ai">
      <!--AI包-->
      <div class="resource-tabs__content">
        <el-table :data="resouceAiList" @row-click="onResourceRowClick('ai', ...arguments)">
          <el-table-column prop="resourceId" label="编号">
            <template scope="scope">
              <el-radio v-model="form.resouceAi" :label="scope.row.resourceId" />
            </template>
          </el-table-column>
          <el-table-column prop="value" label="可接入设备数量">
            <template scope="scope">
              {{ scope.row.value }}路
            </template>
          </el-table-column>
          <el-table-column prop="value" label="接入设备余量">
            <template scope="scope">
              {{ scope.row.value }}路
            </template>
          </el-table-column>
          <el-table-column prop="aiType" label="分析类型">
            <template scope="scope">
              {{ resourceAiType[scope.row.aiType] }}
            </template>
          </el-table-column>
          <el-table-column prop="startTime" label="开通时间" />
          <el-table-column prop="endTime" label="到期时间" />
        </el-table>
        <div class="resource-tabs__none">
          <el-radio v-model="form.resouceAi" :label="-1" @change="onFormChange">不绑定任何视频包</el-radio>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane label="上行带宽包" name="upload">
      <!--上行带宽包-->
      <div class="resource-tabs__content">
        <el-table :data="resouceUploadList" @row-click="onResourceRowClick('upload', ...arguments)">
          <el-table-column prop="resourceId" label="编号">
            <template scope="scope">
              <el-radio v-model="form.resouceUpload" :label="scope.row.resourceId" />
            </template>
          </el-table-column>
          <el-table-column prop="value" label="剩余上行带宽">
            <template scope="scope">
              {{ scope.row.value }}Mbps
            </template>
          </el-table-column>
          <el-table-column prop="startTime" label="开通时间" />
          <el-table-column prop="endTime" label="到期时间" />
        </el-table>
        <div class="resource-tabs__none">
          <el-radio v-model="form.resouceUpload" :label="-1" @change="onFormChange">不绑定任何视频包</el-radio>
        </div>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>
<script lang='ts'>
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { ResourceAiType } from '@/dics'
// import { Device } from '@/type/device'

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
  private resouceVideoList = [
    {
      resourceId: 1,
      value: 100,
      codeRate: 8,
      storageTime: 7,
      startTime: '2021-04-29 11:03:32',
      endTime: '2021-04-29 11:03:32'
    },
    {
      resourceId: 2,
      value: 100,
      codeRate: 8,
      storageTime: 7,
      startTime: '2021-04-29 11:03:32',
      endTime: '2021-04-29 11:03:32'
    }
  ]
  private resouceAiList = [
    {
      resourceId: 1,
      value: 100,
      aiType: 'AI-100',
      startTime: '2021-04-29 11:03:32',
      endTime: '2021-04-29 11:03:32'
    },
    {
      resourceId: 2,
      value: 100,
      aiType: 'AI-100',
      startTime: '2021-04-29 11:03:32',
      endTime: '2021-04-29 11:03:32'
    }
  ]
  private resouceUploadList = [
    {
      resourceId: 1,
      value: 100,
      startTime: '2021-04-29 11:03:32',
      endTime: '2021-04-29 11:03:32'
    },
    {
      resourceId: 2,
      value: 100,
      startTime: '2021-04-29 11:03:32',
      endTime: '2021-04-29 11:03:32'
    }
  ]

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
