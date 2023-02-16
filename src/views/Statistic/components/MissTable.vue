<!--
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-02-15 15:36:02
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-02-16 10:40:08
 * @FilePath: /vss-user-web/src/views/Statistic/components/MissTable.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div>
    <el-table
      :data="dayMissTableData"
      style="width: 100%;"
    >
      <el-table-column
        prop="startTime"
        label="开始时间"
        width="180"
      />
      <el-table-column
        prop="endTime"
        label="结束时间"
        width="180"
      />
      <el-table-column
        prop="missSeconds"
        label="缺失时长(秒)"
      >
        <template slot-scope="{row}">
          <span style="margin-left: 10px;">{{ row.missSeconds }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="missSeconds"
        label="缺失时长"
      >
        <template slot-scope="{row}">
          <span style="margin-left: 10px;">{{ (row.missSeconds/3600).toFixed(2) }}小时</span>
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
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { RecordMissQuery, CalendarMissResponse, CalendarMissItem } from '@/type/Statistic'
import { getCalendarMissData } from '@/api/statistic'
import { dateFormat } from '@/utils/date'
@Component({
  name: 'MissTable',
  components: {
  }
})
export default class extends Vue {
  @Prop() private info
  @Prop() private from

  private dayMissTableData: CalendarMissItem[] = []

  private layout = 'total, sizes, prev, pager, next, jumper'

  private pager = {
    pageNum: 1,
    pageSize: 10,
    totalNum: 0
  }

  @Watch('info', { deep: true })
  private onInfoChange() {
    this.getMissData()
  }

  async mounted() {
    await this.getMissData()
  }

  private async getMissData() {
    if (this.from === 'dialog') {
      this.layout = 'total, prev, pager, next'
    }
    try {
      const { deviceId, dateValue: [startTime, endTime], ignore, inProtocol, groupId } = this.info
      const { pageNum, pageSize } = this.pager
      const param: RecordMissQuery = {
        deviceId,
        startTime: dateFormat(startTime, 'yyyy-MM-dd HH:mm:ss'),
        endTime: dateFormat(endTime, 'yyyy-MM-dd HH:mm:ss'),
        ignore,
        pageNum,
        pageSize,
        inProtocol,
        groupId
      }
      const data: CalendarMissResponse = await getCalendarMissData(param)
      this.pager.totalNum = Number(data.totalNum)
      this.dayMissTableData = data.misses
    } catch (error) {
      this.$$message.error(error)
    }
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getMissData()
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getMissData()
  }
}
</script>
