<template>
  <div class="statistic-box statistic-box__automatic">
    <div class="statistic-box__title">
      <div class="statistic-box__title-text">自动补录设置</div>
      <el-button type="primary" size="mini" @click="editAutomaticDialog">
        编辑
      </el-button>
    </div>
    <el-form ref="automatic">
      <el-form-item label="启用自动补录">
        {{ globalConfig.enableRecordRecovery ? '开启' : '关闭' }}
      </el-form-item>
      <el-form-item label="最大并发路数">
        {{ globalConfig.maxStreamNum }}路
      </el-form-item>
      <!-- <el-form-item label="最大补录带宽"> 10Mbps </el-form-item> -->
      <el-form-item label="自动补录时段">
        每天
        <span
          v-for="(item, index) in globalConfig.operateTimeWindows"
          :key="index"
        >
          {{ item.beginTime }} - {{ item.endTime }}
        </span>
      </el-form-item>
    </el-form>
    <div class="statistic-box__title history">
      <div class="statistic-box__title-text">自动补录历史</div>
      <el-button type="primary" @click="exportData">导出</el-button>
    </div>
    <el-table :data="tableData" style="width: 100%" height="280">
      <el-table-column prop="deviceId" label="设备ID/名称" min-width="180">
        <template slot-scope="{ row }">
          <div class="statistic-box__device_name">
            <p class="statistic-box__device_id">{{ row.deviceId }}</p>
            <p>{{ row.deviceName }}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="recordStartTime" label="断点起始时间" min-width="180">
        <template slot-scope="{ row }">
          <span>{{ dateFormat(row.recordStartTime*1000) || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="recordEndTime" label="断点截止时间" min-width="180">
        <template slot-scope="{ row }">
          <span>{{ dateFormat(row.recordEndTime*1000) || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="recordDuration" label="缺失时长" min-width="100">
        <template slot-scope="{ row }">
          <!-- <span>{{ row.recordDuration }}秒</span> -->
          <span>({{ durationFormat(row.recordDuration) }})</span>
        </template>
      </el-table-column>
      <el-table-column prop="operateStartTime" label="补录操作时间" min-width="340">
        <template slot-scope="{ row }">
          <span>{{ dateFormat(row.operateStartTime*1000) || '--' }} - </span>
          <span>{{ dateFormat(row.operateEndTime*1000) || '--' }} </span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="补录状态" min-width="100">
        <template slot-scope="{ row }">
          <span v-if="row.recoveryStatus === 2" class="statistic-box__device_status">
            <el-tooltip class="item" effect="dark" :content="row.errorMessage" placement="top-start">
              <span>{{ statusToText[row.recoveryStatus] }} <i class="el-icon-warning-outline statistic-box__device_warning" /></span>
            </el-tooltip>
          </span>
          <span v-else>{{ statusToText[row.recoveryStatus] }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page="pager.pageNum"
      :page-size="pager.pageSize"
      :total="pager.totalNum"
      :layout="layout"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 非页面主体内容 -->

    <el-dialog
      title="自动补录配置"
      :visible="ifShowEditAutomatic"
      width="60%"
      :before-close="handleClose"
      :close-on-click-modal="false"
    >
      <el-form
        ref="automaticForm"
        :model="automaticForm"
        label-width="130px"
        :rules="automaticRules"
      >
        <el-form-item label="启用自动补录" prop="enableRecordRecovery">
          <el-switch v-model="automaticForm.enableRecordRecovery" />
        </el-form-item>
        <el-form-item label="最大并发路数" prop="maxStreamNum">
          <el-input v-model="automaticForm.maxStreamNum" @input="minValue" />
        </el-form-item>
        <!-- <el-form-item label="最大补录带宽">
          <el-input v-model="automaticForm.name" />
        </el-form-item> -->
        <el-form-item label="自动补录时段">
          <div>每天</div>
          <el-form-item
            v-for="(item, index) in automaticForm.operateTimeWindows"
            :key="index"
            class="statistic-box statistic-box__automatic_timeList"
            prop="operateTimeWindows"
            :rules="{
              type: 'array',
              trigger: 'change',
              validator: validateOperateTimeWindows
            }"
          >
            <el-time-picker
              v-model="item.time"
              is-range
              value-format="HH:mm"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              placeholder="选择时间范围"
              format="HH:mm"
              :editable="false"
              :picker-options="pickerOptions"
            />
            <el-button
              v-if="automaticForm.operateTimeWindows.length > 1"
              type="text"
              class="statistic-box__automatic-dialog-remove"
              @click="removeThis(index)"
            >
              <i class="el-icon-remove" />
            </el-button>
          </el-form-item>
          <el-button
            type="text"
            class="statistic-box__automatic-dialog-add"
            :disabled="automaticForm.operateTimeWindows.length >= 5"
            @click="addTime"
          >
            + 添加
          </el-button>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="clearDialog">取 消</el-button>
        <el-button type="primary" @click="sureThis">确 定</el-button>
      </span>
    </el-dialog>
    <export-dialog v-if="exportDialogVisible" @on-close="closeExport" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import {
  setAutomaticConfig,
  getAutomaticConfig,
  getAutomaticHistory
} from '@/api/statistic'

import { dateFormat, durationFormat } from '@/utils/date'
import ExportDialog from './ExportDialog.vue'

@Component({
  name: 'AutomaticRecord',
  components: {
    ExportDialog
  }
})
export default class extends Vue {
  @Prop() private deviceId: string
  @Prop() private wrap

  private maxHeight = 0
  private tableData = []
  private ifShowEditAutomatic = false
  private exportDialogVisible = false

  private layout = 'total, sizes, prev, pager, next, jumper'

  private valueFormat = new Date(new Date().toLocaleDateString()).getTime()

  private durationFormat = durationFormat
  private dateFormat = dateFormat

  private pickerOptions = {
    step: '00:01',
    format: 'HH:mm'
  }

  private pager = {
    pageNum: 1,
    pageSize: 10,
    totalNum: 0
  }

  private automaticForm: any = {
    enableRecordRecovery: false,
    maxStreamNum: 1,
    operateTimeWindows: [
      {
        startTime: '',
        endTime: '',
        time: ''
      }
    ]
  }

  private automaticRules: any = {
    maxStreamNum: [{ validator: this.validateNum, trigger: 'blur' }],
    operateTimeWindows: [
      { validator: this.validateOperateTimeWindows, trigger: 'blur' }
    ]
  }

  private globalConfig: any = {
    enableRecordRecovery: false,
    maxStreamNum: 1,
    maxBandWidth: 3,
    operateTimeWindows: []
  }

  private statusToText: any = {
    0: '正在补录',
    1: '已完成',
    2: '补录失败'
  }

  @Watch('deviceId', { immediate: true })
  private onDeviceIdChange() {
    this.pager.pageNum = 1
    this.pager.pageSize = 10
    this.getAutomaticHistory()
  }

  private async mounted() {
    await this.getAutomaticConfig()
    this.calMaxHeight()
    window.addEventListener('resize', this.calMaxHeight)
  }

  private destroyed() {
    window.removeEventListener('resize', this.calMaxHeight)
  }

  /**
   * 计算最大高度
   */
  public calMaxHeight() {
    const wrap = this.wrap
    const size = wrap.getBoundingClientRect()
    const top = size.top
    const documentHeight = document.body.offsetHeight
    this.maxHeight = documentHeight - top - 190
  }

  private validateNum(rule: any, value: number, callback: Function) {
    if (!value) {
      callback(new Error('请输入最大并发路数'))
    } else if (value > 5000) {
      callback(new Error('最大并发路数为5000'))
    } else if (value < 1) {
      callback(new Error('最大并发路数最小值为1'))
    } else {
      callback()
    }
  }

  private validateOperateTimeWindows(
    rule: any,
    value: Array<[string, string]>,
    callback: Function
  ) {
    const hasOverlap: boolean = this.checkOverlap(value)
    if (hasOverlap) {
      callback(new Error('所选时间存在重叠，请重新选择'))
    } else {
      callback()
    }
  }

  /**
 * 判断入参 时间段数组 是否存在 重叠
 * @param intervals
 * @eg [{time:[beginTime,endTime]}]
*/
  private checkOverlap(intervals: any) {
    return intervals.some((interval, index) =>
      intervals
        .slice(index + 1)
        .some(
          (nextInterval) =>
            interval.time[1] >= nextInterval.time[0] &&
            interval.time[0] <= nextInterval.time[1]
        )
    )
  }

  private async getAutomaticConfig() {
    try {
      const res = await getAutomaticConfig()
      const {
        enableRecordRecovery,
        maxStreamNum,
        maxBandWidth,
        operateTimeWindows
      } = res || {}
      this.globalConfig = {
        enableRecordRecovery,
        maxStreamNum,
        maxBandWidth,
        operateTimeWindows
      }
    } catch (error) {
      this.$message.error(error && error.message)
    }
  }

  private minValue(value) {
    value = value.replace(/[^\d]/g, '')
    this.automaticForm.num = value
  }

  private removeThis(index) {
    this.automaticForm.operateTimeWindows.splice(index, 1)
  }

  private editAutomaticDialog() {
    const {
      enableRecordRecovery,
      maxStreamNum,
      maxBandWidth,
      operateTimeWindows
    } = this.globalConfig

    const result = operateTimeWindows.map((item) => ({
      time: [item.beginTime, item.endTime]
    }))

    this.automaticForm = {
      enableRecordRecovery: !!enableRecordRecovery,
      maxStreamNum,
      maxBandWidth,
      operateTimeWindows: result
    }

    this.ifShowEditAutomatic = true
  }

  private handleClose() {
    this.ifShowEditAutomatic = false
  }

  private addTime() {
    this.automaticForm.operateTimeWindows = [
      ...this.automaticForm.operateTimeWindows,
      {
        // startTime: '',
        // endTime: '',
        time: ''
      }
    ]
  }

  private async sureThis() {
    const {
      enableRecordRecovery,
      maxStreamNum,
      maxBandWidth,
      operateTimeWindows
    } = this.automaticForm

    const result = operateTimeWindows?.map(item => {
      const [beginTime, endTime] = item.time
      return { beginTime, endTime }
    })

    const param = {
      enableRecordRecovery: enableRecordRecovery ? 1 : 0,
      maxStreamNum,
      maxBandWidth,
      operateTimeWindows: result
    }

    try {
      await setAutomaticConfig(param)
      this.clearDialog()
      await this.getAutomaticConfig()
    } catch (error) {
      this.$message.error(error && error.message)
    }
  }

  private clearDialog() {
    this.automaticForm = {
      enableRecordRecovery: false,
      maxStreamNum: 1,
      maxBandWidth: 3,
      operateTimeWindows: []
    }

    this.ifShowEditAutomatic = false
  }

  // 获取 自动补录历史
  private async getAutomaticHistory() {
    try {
      const { pageNum, pageSize } = this.pager

      const param = {
        searchKey: this.deviceId,
        pageNum,
        pageSize
      }

      const res = await getAutomaticHistory(param)
      const { totalNum, recoveryList } = res
      this.tableData = recoveryList
      this.pager.totalNum = Number(totalNum)
    } catch (error) {
      this.$message.error(error && error.message)
    }
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getAutomaticHistory()
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getAutomaticHistory()
  }

  private exportData(){
    this.exportDialogVisible = true
  }

  private closeExport(){

  }
}
</script>

<style lang="scss" scoped>
.statistic-box {
  &__title {
    padding-left: 16px;
    border-left: 8px solid #fa8334;
    height: 26px;
    line-height: 26px;
    font-size: 16px;
    font-weight: bold;
    margin: 20px 0 10px;


    &-text {
      width: 160px;
      display: inline-block;
    }
  }

  &__automatic {
    &_timeList {
      margin-top: 10px;
    }
    &-dialog-add {
      margin-top: 25px;
    }
    &-dialog-remove{
      margin-left: 10px;
      color: $textGrey;
    }
  }

  &__device {
    &_name{
      cursor: pointer;
    }
    &_id{
      color: #fa8334;
    }

    &_status{
      cursor: pointer;
    }

    &_warning{
      color: red;
    }
  }

}
.history{
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px !important;
  .el-button{
    display: flex;
    align-items: center;
  }
}
</style>
