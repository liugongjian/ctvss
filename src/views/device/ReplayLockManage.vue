<template>
  <div class="screen-list">
    <div v-loading="jumpLoading">
      <div class="head">
        <div class="head__left">
          <el-button :type="unlockable ? '' : 'primary'" class="unlock-btn" :disabled="unlockable" @click="unlockBatch">解锁</el-button>
          <i class="el-icon-info" />锁定录像容量: {{ (lockVolume / 1024 / 1024 / 1024).toFixed(3) + 'GB' }}
        </div>
        <div class="head__right">
          <el-input v-model="deviceName" placeholder="请输入设备名称" clearable @keyup.enter.native="getRecordListByPage">
            <el-button slot="append" class="el-button-rect" @click="getRecordListByPage">
              <svg-icon name="search" />
            </el-button>
          </el-input>
        </div>
      </div>
      <div class="replay-time-list">
        <el-table
          v-loading="isLoading"
          :data="recordList"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            type="selection"
            width="55"
          >
          </el-table-column>
          <el-table-column label="设备ID/名称" min-width="200">
            <template slot-scope="{ row }">
              <template>
                <span class="jump-2-device" @click="jump2device(row)">{{ row.deviceId + '/' }}</span>
                <span>{{ row.deviceName }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="录像截图" min-width="200">
            <template slot-scope="{ row }">
              <el-image
                style="width: 150px; height: 100px;"
                :src="row.cover"
                :preview-src-list="[row.cover]"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="录像开始时间"
            prop="startTime"
            min-width="180"
            :formatter="dateFormatInTable"
          />
          <el-table-column
            label="录像结束时间"
            prop="endTime"
            min-width="180"
            :formatter="dateFormatInTable"
          />
          <el-table-column
            label="时长"
            prop="duration"
            :formatter="durationFormatInTable"
          />
          <!-- <el-table-column
            label="锁定人"
            prop="duration"
            :formatter="durationFormatInTable"
          /> -->
          <el-table-column prop="action" label="操作" width="100" fixed="right">
            <template slot-scope="{ row }">
              <el-button type="text" @click.stop.native="replay(row)">
                播放
              </el-button>
              <el-button type="text" @click.stop.native="unlock(row)">
                解锁
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          :current-page="pager.pageNum"
          :page-size="pager.pageSize"
          :total="pager.totalNum"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <UnlockDialog v-if="unlockVisable" :unlock-item="recordLockItem" :multiple="multiple" @on-close="closeUnlock" />
    <UnlockDialog v-if="unlockBatchVisable" :unlock-item="recordLockItem" :multiple="multiple" @on-close="closeUnlock" />
    <VideoDialog v-if="showVideoDialog" :record="currentRecord" :type="videoType" @on-close="closeVideo" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Inject, Watch } from 'vue-property-decorator'
import { dateFormatInTable, durationFormatInTable, dateFormat } from '@/utils/date'
import { getUserLockList } from '@/api/device'
import { GroupModule } from '@/store/modules/group'
import { checkPermission } from '@vss/base/utils/permission'
import UnlockDialog from '@/views/device/components/dialogs/Unlock.vue'
import { redirectToDeviceDetail } from '@/utils/device'
import VideoDialog from './components/dialogs/VideoDialog.vue'

@Component({
  name: 'ReplayLockManage',
  components: {
    UnlockDialog,
    VideoDialog
  }
})
export default class extends Vue {
  // 查看该页面是否需要对应权限   ？

  private pager = {
    pageNum: 1,
    pageSize: 10,
    totalNum: 0
  }

  private dialogs = {
    deviceDir: false,
    play: false
  }

  private showVideoDialog = false
  private currentRecord: any = {}
  private videoType = ''
  
  private deviceName = ''
  private dateFormatInTable = dateFormatInTable
  private durationFormatInTable = durationFormatInTable
  private dateFormat = dateFormat
  private checkPermission = checkPermission
  private lockVolume = ''
  private isLoading = false
  private unlockable = true
  private recordLockItem: any = null
  private jumpLoading = false
  private multiple = false

  /* unlock dialog visiable */
  private unlockVisable = false
  /* unlock batch items */
  private unlockBatchVisable = false

  /* 当前分页后的录像列表 */
  private recordList: any = []

  // /* 是否为虚拟业务组 */
  // private get isVGroup() {
  //   return GroupModule.group?.inProtocol === 'vgroup'
  // }

  private mounted() {
    this.getRecordListByPage()
  }

  // 播放录像
  // 后端接口没有细分，无法正常判断设备状态及正确返回报错信息，需要前端魔改
  // 设备名称为空，判定为已被删除的设备
  private async replay(row: any) {
    // if (row.deviceName === '') return this.$message.error('该设备已删除，无法播放')
    this.currentRecord = row
    this.showVideoDialog = true
    this.videoType = 'record'
  }

  private closeVideo() {
    this.currentRecord = {}
    this.showVideoDialog = false
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

  /* 获取录像列表 */
  private async getRecordListByPage() {
    try {
      this.loading = true
      const params = {
        deviceName: this.deviceName || undefined,
        pageNum: this.pager.pageNum,
        pageSize: this.pager.pageSize
      }
      this.recordList = await getUserLockList(params)
      this.lockVolume = this.recordList.lockVolume
      const { pageNum, pageSize, totalNum } = this.recordList
      this.pager = { pageNum, pageSize, totalNum }
      this.recordList = this.recordList.lockRecords
      this.secToMs(this.recordList)
    } catch (e) {
      this.$message.error(e)
    } finally {
      this.loading = false
    }
  }

  /**
   * pager 重置
   */
  private resetPager() {
    this.pager = {
      pageNum: 1,
      pageSize: 10,
      totalNum: 0
    }
  }
  
  /**
   * 解锁
   */
  private unlock(record: any) {
    this.recordLockItem = JSON.parse(JSON.stringify([record]))
    this.msToS(this.recordLockItem)
    this.multiple = false
    this.unlockVisable = true
  }

  // 关闭解锁 dialog
  private async closeUnlock(isUnlocked?: boolean) {
    try {
      if (isUnlocked) {
        await this.getRecordListByPage() // 重新加载 lock list  
      }
    } catch (e) {
      this.$message.error(e)
    } finally {
      // this.recordLockItem = []
      this.unlockVisable = false
      this.unlockBatchVisable = false
    }
  }

  /**
   * 批量解锁 
  */ 
 private handleSelectionChange(records: any) {
  this.recordLockItem = JSON.parse(JSON.stringify(records))
  this.msToS(this.recordLockItem)
  if (records.length > 1) {
    this.unlockable = false
    this.multiple = true
  } else if (records.length === 1) {
    this.unlockable = false
    this.multiple = false
  } else {
    this.unlockable = true
    this.multiple = false
  }
 }

 private async jump2device(row: any) {
  try {
    this.jumpLoading = true
    await redirectToDeviceDetail(this, row.deviceId, 'ipc')
  } catch (e) {
    if (e == 'Error: 没有查询到该设备') {
      this.$message.error('该设备已删除，无法跳转设备详情')
    } else {
      this.$message.error(e)
    }
  } finally {
    this.jumpLoading = false
  }
 }
 
  private unlockBatch() {
    if (!this.multiple) {
      this.unlockVisable = true
      // this.unlockBatchVisable = false
    } else {
      // this.unlockVisable = false
      this.unlockBatchVisable = true
    }
  }

  /**
  * startTime 秒转毫秒
  */
  private secToMs(records: any) {
    records.map((record: any) => {
      record.startTime = record.startTime * 1000
      record.endTime = record.endTime * 1000
    })
  }

  /**
  * startTime ms转s
  */
  private msToS(records: any) {
    records.map((record: any) => {
      record.startTime = record.startTime / 1000
      record.endTime = record.endTime / 1000
    })
  }
}
</script>
<style lang="scss" scoped>
// .dymatic-unlock {
//   background-color: ;
// }
.jump-2-device {
  color: $primary;
  cursor: pointer;

  &:hover {
    color: #fb9c5d;
  }

  &:active {
    color: #e1762f;
  }
}

.el-icon-info {
  margin-left: 15px;
  margin-right: 5px;
}

.head {
  display: flex;
  justify-content: space-between;
  margin: 10px;

  &__right {
    display: flex;

    .el-input {
      margin-right: 10px;
    }
  }
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
