<template>
  <div class="screen-list">
    <div v-if="currentScreen.deviceId">
      <div class="device-name">
        设备名称：{{ currentScreen.deviceName }}
      </div>
      <div class="replay-time-list">
        <el-table
          v-loading="isLoading"
          :data="recordList"
          empty-text="所选日期暂无录像"
        >
          <el-table-column label="录像名称" prop="templateName" min-width="200">
            <template slot-scope="{row}">
              <template v-if="!row.edit">
                <span>{{ row.templateName }}</span>
                <el-button
                  v-if="!isVGroup && checkPermission(['AdminRecord'])"
                  type="text"
                  icon="el-icon-edit"
                  class="edit-button"
                  @click="editRecordName(row)"
                />
              </template>
              <template v-else>
                <el-input
                  v-model="recordName"
                  size="small"
                  class="edit-input"
                />
                <el-button
                  type="primary"
                  size="small"
                  class="edit-save-button"
                  @click="saveEdit(row)"
                >
                  保存
                </el-button>
                <el-button plain size="small" @click="cancelEdit(row)">取消</el-button>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="录像截图" min-width="200">
            <template slot-scope="{row}">
              <el-image
                style="width: 150px; height: 100px;"
                :src="row.cover"
                :preview-src-list="[row.cover]"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="开始时间"
            prop="startTime"
            min-width="180"
            :formatter="dateFormatInTable"
          />
          <el-table-column
            label="时长"
            prop="duration"
            :formatter="durationFormatInTable"
          />
          <el-table-column prop="action" label="操作" width="200" fixed="right">
            <template slot-scope="{row}">
              <el-button
                v-if="!isVGroup && checkPermission(['AdminRecord'])"
                :disabled="row.loading"
                type="text"
                @click="downloadReplay(row)"
              >
                下载录像
              </el-button>
              <el-button type="text" @click="playReplay(row)">
                播放录像
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          :current-page="pager.pageNum"
          :page-size="pager.pageSize"
          :total="pager.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <div v-else class="tip-select-device">
      <el-button type="text" size="mini" @click="selectDevice">请选择设备</el-button>
    </div>
    <device-dir v-if="dialogs.deviceDir" @on-close="onDeviceDirClose" />
    <el-dialog
      v-if="dialogs.play"
      class="video-player"
      :title="`${currentListRecord.templateName}  ${dateFormat(currentListRecord.startTime)}`"
      :visible="true"
      :close-on-click-modal="false"
      @close="closeReplayPlayer()"
    >
      <VssPlayer :url="currentListRecord.url" type="hls" :codec="currentListRecord.codec" :has-progress="true" />
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Inject, Watch } from 'vue-property-decorator'
import { Record } from '@/views/device/services/Record/Record'
import { dateFormatInTable, durationFormatInTable, dateFormat } from '@/utils/date'
import { ScreenManager } from '@/views/device/services/Screen/ScreenManager'
import { getDeviceRecord, editRecordName } from '@/api/device'
import { GroupModule } from '@/store/modules/group'
import { checkPermission } from '@/utils/permission'
import DeviceDir from '../dialogs/DeviceDir.vue'
import VssPlayer from '@/components/VssPlayer/index.vue'

@Component({
  name: 'ScreenList',
  components: {
    DeviceDir,
    VssPlayer
  }
})
export default class extends Vue {
  @Inject('getScreenManager')
  private getScreenManager: Function

  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }

  private dialogs = {
    deviceDir: false,
    play: false
  }

  private currentListRecord: any = null
  private recordName = ''
  private dateFormatInTable = dateFormatInTable
  private durationFormatInTable = durationFormatInTable
  private dateFormat = dateFormat
  private checkPermission = checkPermission

  /* 当前分页后的录像列表 */
  private recordList: Record[] = null

  /* 是否为虚拟业务组 */
  private get isVGroup() {
    return GroupModule.group?.inProtocol === 'vgroup'
  }

  private get screenManager(): ScreenManager {
    return this.getScreenManager()
  }

  private get currentScreen() {
    return this.screenManager.currentScreen
  }

  private get isLoading() {
    return this.currentScreen.isLoading
  }

  /**
   * 切换不同设备/切换日期
   */
  @Watch('currentScreen.recordManager.recordList', {
    immediate: true
  })
  private async getRecordList() {
    try {
      // 没有加载录像直接进入录像列表时，没有 recordManager
      if (!this.currentScreen.recordManager) return
      this.resetPager()
      // 当天没有记录则将页面置空并return
      if (!this.currentScreen.recordManager.recordList || this.currentScreen.recordManager.recordList.length === 0) {
        this.recordList = []
        return
      }
      this.getRecordListByPage()
    } catch (e) {
      this.$message.error(e)
    }
  }

  private mounted() {
    this.getRecordListByPage()
  }

  /**
   * 分页
   */
  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    this.getRecordListByPage()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    this.getRecordListByPage()
  }

  /* 获取录像列表，重置/保留当前页码状态 */
  private getRecordListByPage() {
    const records = this.currentScreen.recordManager.getRecordListByPage(this.pager, this.screenManager.currentScreen.currentRecordDatetime)
    this.recordList = records.recordList
    this.pager.total = records.length
    this.secToMs(this.recordList)
  }
  /**
   * 选择视频
   * @param screen 视频
   */
  private selectDevice() {
    this.dialogs.deviceDir = true
  }

  /**
   * 关闭视频选择对话框
   * @param device 设备
   */
  private onDeviceDirClose(item) {
    this.dialogs.deviceDir = false
    if (item) {
      this.screenManager.openTreeItem(item)
    }
  }

  /** 编辑录像名称
   */
  private editRecordName(row: any) {
    this.recordName = row.templateName
    this.recordList.forEach((record: any) => {
      record.edit = false
    })
    row.edit = true
  }

  /**
   * 保存录像名称
   */
  private async saveEdit(row: any) {
    try {
      this.loading = true
      await editRecordName({
        deviceId: this.currentScreen.deviceId,
        inProtocol: this.currentScreen.inProtocol,
        startTime: Math.floor(new Date(row.startTime).getTime() / 1000),
        customName: this.recordName
      })
      await this.currentScreen.recordManager.getRecordListByDate(this.currentScreen.recordManager.currentDate)
      this.getRecordListByPage()
    } catch (e) {
      this.$message.error(e.message)
    } finally {
      this.loading = false
    }
  }

  /**
   * 取消编辑录像名称
   */
  private cancelEdit(row: any) {
    this.recordName = ''
    row.edit = false
  }

  /**
   * 下载录像
   */
  private async downloadReplay(record: any) {
    try {
      console.log('屎粑粑   🐕', record.startTime)
      record.loading = true
      const res = await getDeviceRecord({
        deviceId: this.currentScreen.deviceId,
        startTime: record.startTime / 1000,
        fileFormat: 'mp4',
        inProtocol: this.currentScreen.inProtocol
      })
      if (res.downloadUrl) {
        const link: HTMLAnchorElement = document.createElement('a')
        link.setAttribute('href', res.downloadUrl)
        link.click()
        link.remove()
      }
      record.loading = false
    } catch (e) {
      this.$message.error(e.message)
    }
  }

  /**
   * 播放录像（模态框）
   */
  private playReplay(record: any) {
    // 变了变了
    this.dialogs.play = true
    this.currentListRecord = record
  }

  /**
   * 关闭播放录像弹出框
   */
  private closeReplayPlayer() {
    // 变了变了
    this.dialogs.play = false
    this.currentListRecord = null
  }

  /**
   * startTime 秒转毫秒
   */
  private secToMs(records: any) {
    this.records = records.map((record: any) => {
      record.startTime = record.startTime * 1000
    })
  }

  /**
   * pager 重置
   */
  private resetPager() {
    this.pager = {
      pageNum: 1,
      pageSize: 10,
      total: 0
    }
  }
}
</script>
<style lang="scss" scoped>
.device-name {
  padding: 10px 20px;
}

.replay-time-list {
  flex: 1;
  margin-left: 15px;
  margin-top: 15px;
  overflow: auto;

  .el-range-editor {
    width: 100%;
    margin-bottom: 15px;
  }

  .edit-button {
    margin-left: 5px;
  }

  .edit-input {
    width: 50%;
  }

  .edit-save-button {
    margin-left: 10px;
  }
}

.video-player ::v-deep {
  .el-dialog {
    width: 840px;
  }

  .el-dialog__body {
    padding-top: 10px;
    padding-bottom: 20px;

    .vss-player__wrap {
      background: #333;
      height: 450px;
    }
  }
}
</style>
