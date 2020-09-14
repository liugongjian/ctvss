<!-- 设备管理页面中的三合一预览（实时、录像、截图）-->
<template>
  <div class="app-container">
    <div class="preview-wrap">
      <el-button class="btn-detail" @click="goToDetail"><i class="el-icon-tickets" /> 查看设备详情</el-button>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane lazy label="实时预览" name="preview">
          <live-view v-if="activeName === 'preview'" :device-id="deviceId" />
        </el-tab-pane>
        <el-tab-pane lazy label="录像回放" name="replay">
          <replay-view v-if="activeName === 'replay'" :device-id="deviceId" />
        </el-tab-pane>
        <el-tab-pane v-if="false" label="监控截图" name="snapshot">
          <el-date-picker
            v-model="snapshotRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
          <div class="snapshot-list">
            <div class="snapshot-item">
              <div class="img" />
              <span>{{ dateFormat(1594260926566) }}</span>
            </div>
            <div class="snapshot-item">
              <div class="img" />
              <span>{{ dateFormat(1594260926566) }}</span>
            </div>
            <div class="snapshot-item">
              <div class="img" />
              <span>{{ dateFormat(1594260926566) }}</span>
            </div>
            <div class="snapshot-item">
              <div class="img" />
              <span>{{ dateFormat(1594260926566) }}</span>
            </div>
            <div class="snapshot-item">
              <div class="img" />
              <span>{{ dateFormat(1594260926566) }}</span>
            </div>
            <div class="snapshot-item">
              <div class="img" />
              <span>{{ dateFormat(1594260926566) }}</span>
            </div>
            <div class="snapshot-item">
              <div class="img" />
              <span>{{ dateFormat(1594260926566) }}</span>
            </div>
            <div class="snapshot-item">
              <div class="img" />
              <span>{{ dateFormat(1594260926566) }}</span>
            </div>
            <div class="snapshot-item">
              <div class="img" />
              <span>{{ dateFormat(1594260926566) }}</span>
            </div>
            <div class="snapshot-item">
              <div class="img" />
              <span>{{ dateFormat(1594260926566) }}</span>
            </div>
            <div class="snapshot-item">
              <div class="img" />
              <span>{{ dateFormat(1594260926566) }}</span>
            </div>
            <div class="snapshot-item">
              <div class="img" />
              <span>{{ dateFormat(1594260926566) }}</span>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <SetRecordTemplate v-if="setRecordTemplateDialog" @on-close="closeSetRecordTemplateDialog" />
    <SetSnapshotTemplate
      v-if="setSnapshotTemplateDialog"
      @on-close="closeSetScrrenCutTemplateDialog"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Inject, Watch } from 'vue-property-decorator'
import { DeviceStatus, DeviceType, AuthStatus } from '@/dics'
import { dateFormatInTable, dateFormat } from '@/utils/date'
import { getDevicePreview } from '@/api/device'
import copy from 'copy-to-clipboard'
import SetRecordTemplate from '../components/dialogs/SetRecordTemplate.vue'
import SetSnapshotTemplate from '../components/dialogs/SetSnapshotTemplate.vue'
import StatusBadge from '@/components/StatusBadge/index.vue'
import ReplayView from './components/ReplayView.vue'
import LiveView from './components/LiveView.vue'

@Component({
  name: 'DevicePreview',
  components: {
    SetRecordTemplate,
    SetSnapshotTemplate,
    StatusBadge,
    ReplayView,
    LiveView
  }
})
export default class extends Vue {
  @Inject('deviceRouter') private deviceRouter!: Function
  private dateFormatInTable = dateFormatInTable
  private dateFormat = dateFormat
  private activeName = 'preview'
  private snapshotRange = null
  private template = {
    snapshotTemplate: '123'
  }
  private setRecordTemplateDialog = false
  private setSnapshotTemplateDialog = false

  private get deviceId() {
    return this.$route.query.deviceId
  }

  @Watch('$route.query')
  private onRouterChange() {
    this.activeName = 'preview'
  }

  private mounted() {
    if (this.$route.query.previewTab) this.activeName = this.$route.query.previewTab.toString()
  }

  private goToDetail() {
    this.deviceRouter({
      id: this.deviceId,
      type: 'detail'
    })
  }

  private handleClick(tab: any, event: any) {
    this.activeName = tab.name
  }

  private setRecordTemplate() {
    this.setRecordTemplateDialog = true
  }

  private setScrrenCutTemplate() {
    this.setSnapshotTemplateDialog = true
  }

  private closeSetRecordTemplateDialog() {
    this.setRecordTemplateDialog = false
  }

  private closeSetScrrenCutTemplateDialog() {
    this.setSnapshotTemplateDialog = false
  }
}
</script>
<style lang="scss" scoped>
  .app-container {
    ::v-deep {
      .info-list__title {
        margin: 10px 5px 0 5px;
      }
    }
  }

  .device-list__title {
    height: 40px;
    line-height: 40px;
    border-bottom: 1px solid $borderGrey;
    padding: 0 15px;
  }

  .device-list {
    padding: 10px;
    ::v-deep .status-badge {
      width: 6px;
      height: 6px;
    }
  }

  .preview-wrap {
    position: relative;
    padding-top: 6px;
    .btn-detail {
      position: absolute;
      top: -12px;
      right: 0;
      z-index: 9;
    }
  }

  .snapshot-list {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -10px;
    .snapshot-item {
      position: relative;
      width: 25%;
      span {
        position: absolute;
        bottom: 20px;
        left: 20px;
      }
      .img {
        background: #eee;
        margin: 10px;
        min-height: 200px;
      }
    }
  }
</style>
