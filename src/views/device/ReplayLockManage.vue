<template>
  <div class="screen-list">
    <div>
      <div class="head">
        <div class="head__left">
          <el-button :type="unlockable ? '' : 'primary'" class="unlock-btn" :disabled="unlockable">解锁</el-button>
          <i class="el-icon-info" />锁定录像容量: {{ lockVolume }}
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
            width="55">
          </el-table-column>
          <el-table-column label="设备ID/名称" min-width="200">
            <template slot-scope="{row}">
              <template>
                <span>{{ row.deviceId + '/' }}</span>
                <span>{{ row.deviceName }}</span>
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
            label="录像开始时间"
            prop="startTime"
            min-width="180"
          />
          <el-table-column
            label="录像结束时间"
            prop="endTime"
            min-width="180"
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
          <el-table-column prop="action" label="操作" width="200" fixed="right">
            <template slot-scope="{row}">
              <el-button type="text" @click="unlock(row)">
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
    <UnlockDialog v-if="unlockVisable" :screen="screen" :duration="unlockDuration" :unlock-item="recordLockItem" @on-close="closeUnlock" :multiple="false" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Inject, Watch } from 'vue-property-decorator'
import { dateFormatInTable, durationFormatInTable, dateFormat } from '@/utils/date'
import { getUserLockList} from '@/api/device'
import { GroupModule } from '@/store/modules/group'
import { checkPermission } from '@/utils/permission'
import UnlockDialog from '@/views/device/components/dialogs/Unlock.vue'

@Component({
  name: 'ReplayLockManage',
  components: {
    UnlockDialog
  }
})
export default class extends Vue {
  private pager = {
    pageNum: 1,
    pageSize: 10,
    totalNum: 0
  }

  private dialogs = {
    deviceDir: false,
    play: false
  }

  private deviceName = ''
  private dateFormatInTable = dateFormatInTable
  private durationFormatInTable = durationFormatInTable
  private dateFormat = dateFormat
  private checkPermission = checkPermission
  private lockVolume = ''
  private isLoading = false
  private unlockable = true

  /* unlock dialog visiable */
  private unlockVisable = false

  /* 当前分页后的录像列表 */
  private recordList: any = null

  // 测试数据
  private testData = {
    "lockVolume": "12.1T",
    "pageNum": 1,
    "pageSize": 10,
    "totalNum": 100,
    "totalPage": 10,
    "lockRecords": [
      {
        "deviceId": "123",
        "deviceName": "123",
        "cover": "",
        "startTime": "2023-01-30 12:00:00",
        "endTime": "2023-01-30 16:00:00",
        "duration": 123
      },
      {
        "deviceId": "123",
        "deviceName": "123",
        "cover": "",
        "startTime": "2023-01-30 12:00:00",
        "endTime": "2023-01-30 16:00:00",
        "duration": 123
      },
      {
        "deviceId": "123",
        "deviceName": "123",
        "cover": "",
        "startTime": "2023-01-30 12:00:00",
        "endTime": "2023-01-30 16:00:00",
        "duration": 123
      },
      {
        "deviceId": "123",
        "deviceName": "123",
        "cover": "",
        "startTime": "2023-01-30 12:00:00",
        "endTime": "2023-01-30 16:00:00",
        "duration": 123
      },
      {
        "deviceId": "123",
        "deviceName": "123",
        "cover": "",
        "startTime": "2023-01-30 12:00:00",
        "endTime": "2023-01-30 16:00:00",
        "duration": 123
      },
      {
        "deviceId": "123",
        "deviceName": "123",
        "cover": "",
        "startTime": "2023-01-30 12:00:00",
        "endTime": "2023-01-30 16:00:00",
        "duration": 123
      },
       {
        "deviceId": "123",
        "deviceName": "123",
        "cover": "",
        "startTime": "2023-01-30 12:00:00",
        "endTime": "2023-01-30 16:00:00",
        "duration": 123
      },
      {
        "deviceId": "123",
        "deviceName": "123",
        "cover": "",
        "startTime": "2023-01-30 12:00:00",
        "endTime": "2023-01-30 16:00:00",
        "duration": 123
      },
      {
        "deviceId": "123",
        "deviceName": "123",
        "cover": "",
        "startTime": "2023-01-30 12:00:00",
        "endTime": "2023-01-30 16:00:00",
        "duration": 123
      },
      {
        "deviceId": "123",
        "deviceName": "123",
        "cover": "",
        "startTime": "2023-01-30 12:00:00",
        "endTime": "2023-01-30 16:00:00",
        "duration": 123
      },
      {
        "deviceId": "123",
        "deviceName": "123",
        "cover": "",
        "startTime": "2023-01-30 12:00:00",
        "endTime": "2023-01-30 16:00:00",
        "duration": 123
      },
      {
        "deviceId": "123",
        "deviceName": "123",
        "cover": "",
        "startTime": "2023-01-30 12:00:00",
        "endTime": "2023-01-30 16:00:00",
        "duration": 123
      }
    ]
  }

  // /* 是否为虚拟业务组 */
  // private get isVGroup() {
  //   return GroupModule.group?.inProtocol === 'vgroup'
  // }

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

  /* 获取录像列表 */
  private async getRecordListByPage() {
    try {
      this.loading = true
      const params = {
        deviceName: this.deviceName || undefined,
        pageNum: this.pager.pageNum,
        pageSize: this.pager.pageSize
      }
      // this.recordList = await getUserLockList(params)
      this.lockVolume = this.testData.lockVolume
      this.recordList = this.testData.lockRecords
      let {pageNum, pageSize, totalNum} = this.testData
      this.pager = {pageNum, pageSize, totalNum}
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
    console.log('解锁     ', record)
  }

  /**
   * 多选 
  */ 
 private handleSelectionChange(e: any) {
  if (e.length > 0) {
    this.unlockable = false
  } else {
    this.unlockable = true
  }
 }
}
</script>
<style lang="scss" scoped>
// .dymatic-unlock {
//   background-color: ;
// }

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
