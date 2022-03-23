<template>
  <div class="screen-list">
    <div v-if="currentScreen.deviceId">
      <div class="device-name">
        {{ currentScreen.deviceName }}
      </div>
      <!--原来的表格-->
      <div class="replay-time-list">
        <el-table
          v-loading="loading"
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
          <el-table-column
            label="开始时间"
            prop="startAt"
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
        <replay-player-dialog
          v-if="dialog.play"
          :video="currentListRecord"
          @on-close="closeReplayPlayer"
        />
      </div>
      <slice-download-dialog
        v-if="dialog.slice"
        :in-protocol="inProtocol"
        :device-id="deviceId"
        @on-close="closeSliceDownload"
      />
    </div>
    <div v-else class="tip-select-device">
      <el-button type="text" @click="selectDevice">请选择设备</el-button>
    </div>
    <device-dir v-if="dialogs.deviceDir" @on-close="onDeviceDirClose" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Inject, Watch } from 'vue-property-decorator'
import { Record } from '@/views/device/models/Record/Record'
import { dateFormatInTable, durationFormatInTable } from '@/utils/date'
import { ScreenManager } from '@/views/device/models/Screen/ScreenManager'
import DeviceDir from '../dialogs/DeviceDir.vue'
import { getDeviceRecord, editRecordName } from '@/api/device'
import { GroupModule } from '@/store/modules/group'
import { checkPermission } from '@/utils/permission'

@Component({
  name: 'ScreenList',
  components: {
    DeviceDir
  }
})
export default class extends Vue {
  private loading = false
  private dialog = {
    play: false,
    slice: false
  }
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  private currentListRecord: any = null
  private recordName = ''
  private dateFormatInTable = dateFormatInTable
  private durationFormatInTable = durationFormatInTable

  private get isVGroup() {
    return GroupModule.group?.inProtocol === 'vgroup'
  }
  private checkPermission = checkPermission

  @Inject('getScreenManager')
  private getScreenManager: Function

  private recordList: Record[] = null

  private get screenManager(): ScreenManager {
    return this.getScreenManager()
  }

  private get currentScreen() {
    return this.screenManager.currentScreen
  }

  @Watch('currentScreen.deviceId')
  private onDeviceChange() {
    console.log('???: ', this.currentScreen.deviceId)
    this.recordList = this.currentScreen.recordManager.getRecordListByPage(0, this.pager)
  }

  @Watch('currentScreen.recordManager.currentDate')
  private onDateChange() {
    console.log('日期改变：  ', this.currentScreen.recordManager.currentDate)
    this.recordList = this.currentScreen.recordManager.getRecordListByPage(0, this.pager)
    console.log('this.record list : ', this.recordList)
  }

  private async mounted() {
    try {
      console.log('-0-0-0-0-0    :  ', this.currentScreen)
      this.loading = true
      this.recordList = this.currentScreen.recordManager.getRecordListByPage(0, this.pager)
    } catch (e) {
      this.$message(e)
    } finally {
      this.loading = false
    }
  }

  /**
   * 分页
   */
  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    this.recordList = this.currentScreen.recordManager.getRecordListByPage(0, this.pager)
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    this.recordList = this.currentScreen.recordManager.getRecordListByPage(0, this.pager)
  }

  private dialogs = {
    deviceDir: false
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
    this.recordListSlice.forEach((record: any) => {
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
        deviceId: this.deviceId,
        inProtocol: this.inProtocol,
        startTime: Math.floor(new Date(row.startTime).getTime() / 1000),
        customName: this.recordName
      })
      this.getRecordList()
      this.loading = false
    } catch (e) {
      this.loading = false
      this.$message.error(e.message)
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
      record.loading = true
      const res = await getDeviceRecord({
        deviceId: this.deviceId,
        startTime: record.startAt / 1000,
        fileFormat: 'mp4',
        inProtocol: this.inProtocol
      })
      if (res.downloadUrl) {
        const link: HTMLAnchorElement = document.createElement('a')
        link.setAttribute('href', res.downloadUrl)
        link.click()
        link.remove()
      }
    } catch (e) {
      this.$message.error(e.message)
    } finally {
      record.loading = false
    }
  }

  /**
   * 播放录像（模态框）
   */
  private playReplay(record: any) {
    this.dialog.play = true
    this.currentListRecord = record
  }

  /**
   * 关闭播放录像弹出框
   */
  private closeReplayPlayer() {
    this.dialog.play = false
    this.currentListRecord = null
  }

  /**
   * 切片下载
   */
  private sliceDownload() {
    this.dialog.slice = true
  }

  /**
   * 关闭切片下载弹出框
   */
  private closeSliceDownload() {
    this.dialog.slice = false
  }
}
</script>
<style lang="scss" scoped>
.device-name {
  padding: 20px;
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
</style>
