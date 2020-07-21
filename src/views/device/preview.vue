<template>
  <div class="app-container">
    <!-- <el-page-header content="工厂园区37号楼一层A区通道No.311监控" @back="back" /> -->
    <div class="preview-wrap">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="监控预览" name="preview">
          <div class="preview-player" />
          <info-list label-width="70" title="播放地址" class="address">
            <info-list-item label="RTMP:">
              rtmp://102715.push.domain.com:3738/vss/237233774?signature=045bfe2107b98f356e459c8b2bd54be4&expired=5EEC5741
              <el-tooltip class="item" effect="dark" content="复制链接" placement="top">
                <el-button type="text"><i class="el-icon-copy-document" /></el-button>
              </el-tooltip>
            </info-list-item>
            <info-list-item label="FLV:">
              https://102715.push.domain.com:3738/vss/237233774.flv?signature=045bfe2107b98f356e459c8b2bd54be4&expired=5EEC5741
              <el-tooltip class="item" effect="dark" content="复制链接" placement="top">
                <el-button type="text"><i class="el-icon-copy-document" /></el-button>
              </el-tooltip>
            </info-list-item>
            <info-list-item label="HLS:">
              https://102715.push.domain.com:3738/vss/237233774.m3u8?signature=045bfe2107b98f356e459c8b2bd54be4&expired=5EEC5741
              <el-tooltip class="item" effect="dark" content="复制链接" placement="top">
                <el-button type="text"><i class="el-icon-copy-document" /></el-button>
              </el-tooltip>
            </info-list-item>
          </info-list>

          <!-- <info-list label-width="115" title="模版配置">
            <info-list-item label="录制模版:">
              <div class="info-list__edit">
                <div class="info-list__edit--value">{{ template.recordTemplate?template.recordTemplate:'未配置' }}</div>
                <div class="info-list__edit--action">
                  <el-button type="text" @click="setRecordTemplate">设置</el-button>
                  <el-button v-if="template.recordTemplate" type="text">解绑</el-button>
                </div>
              </div>
            </info-list-item>
            <info-list-item label="录制模版:">
              <div class="info-list__edit">
                <div class="info-list__edit--value">{{ template.screencutTemplate?template.screencutTemplate:'未配置' }}</div>
                <div class="info-list__edit--action">
                  <el-button type="text" @click="setScrrenCutTemplate">设置</el-button>
                  <el-button v-if="template.screencutTemplate" type="text">解绑</el-button>
                </div>
              </div>
            </info-list-item>
          </info-list> -->
        </el-tab-pane>
        <el-tab-pane label="录制回放" name="replay">
          <div class="replay-wrap">
            <div class="replay-player" />
            <div class="replay-time-list">
              <el-date-picker
                v-model="replayRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
              <el-table :data="timeList">
                <el-table-column label="开始时间" prop="startTime" min-width="180" :formatter="dateFormatInTable" />
                <el-table-column label="时长" prop="duration" />
                <el-table-column prop="action" label="操作" width="90" fixed="right">
                  <template slot-scope="{row}">
                    <el-button type="primary" @click="changeReplay(row)">播放</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="监控截图" name="snapshot">
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
    <SetScreenCutTemplate
      v-if="setScreenCutTemplateDialog"
      @on-close="closeSetScrrenCutTemplateDialog"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { DeviceStatus, DeviceType, AuthStatus } from '@/dics'
import { dateFormatInTable, dateFormat } from '@/utils/date'
import SetRecordTemplate from '../components/dialogs/SetRecordTemplate.vue'
import SetScreenCutTemplate from '../components/dialogs/SetScreenCutTemplate.vue'
import StatusBadge from '@/components/StatusBadge/index.vue'

@Component({
  name: 'DevicePreview',
  components: {
    SetRecordTemplate,
    SetScreenCutTemplate,
    StatusBadge
  }
})
export default class extends Vue {
  private dateFormatInTable = dateFormatInTable
  private dateFormat = dateFormat
  private activeName = 'preview'
  private deviceId = 3746238431
  private timeList = [
    {
      startTime: 1594260926566,
      duration: '10分钟'
    },
    {
      startTime: 1594260926566,
      duration: '10分钟'
    },
    {
      startTime: 1594260926566,
      duration: '10分钟'
    },
    {
      startTime: 1594260926566,
      duration: '10分钟'
    }
  ]
  private replayRange = null
  private snapshotRange = null
  private template = {
    screencutTemplate: '123'
  }
  private setRecordTemplateDialog = false
  private setScreenCutTemplateDialog = false

  private mounted() {
    if (this.$route.params.tab) this.activeName = this.$route.params.tab
  }

  private back() {
    this.$router.push('/device')
  }

  private handleClick(tab: any, event: any) {
    this.activeName = tab.name
  }

  private setRecordTemplate() {
    this.setRecordTemplateDialog = true
  }

  private setScrrenCutTemplate() {
    this.setScreenCutTemplateDialog = true
  }

  private closeSetRecordTemplateDialog() {
    this.setRecordTemplateDialog = false
  }

  private closeSetScrrenCutTemplateDialog() {
    this.setScreenCutTemplateDialog = false
  }

  private changeReplay() {}
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

  .preview-player {
    height: 500px;
    background: #eee;
  }

  .address {
    ::v-deep .info-item--val {
      overflow: hidden;
      text-overflow:ellipsis;
      white-space: nowrap;
      position: relative;
      padding-right: 20px;

      .el-button--text {
        position: absolute;
        padding: 0;
        right: 0;
      }
    }
  }

  .replay-wrap {
    display: flex;
  }
  .replay-player {
    flex: 4;
    height: 500px;
    background: #eee;
  }
  .replay-time-list {
    flex: 2;
    margin-left: 15px;
    overflow: hidden;

    .el-range-editor {
      width: 100%;
      margin-bottom: 15px;
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
