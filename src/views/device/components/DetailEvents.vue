<template>
  <div class="app-container">
    <div class="filter-container">
      <div class="filter-container__right">
        <span>时间区间：</span>
        <el-date-picker
          v-model="search.timeRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
        <span>设备/流事件：</span>
        <el-select v-model="search.eventType">
          <el-option
            v-for="(item, index) in eventsTypeList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-button class="el-button-rect" @click="refresh"><svg-icon name="refresh" /></el-button>
      </div>
    </div>
    <el-table ref="table" v-loading="loading" :data="dataList" fit class="template__table">
      <el-table-column prop="number" label="序号" />
      <el-table-column prop="time" label="时间" min-width="200" />
      <el-table-column prop="events" label="设备/流事件" min-width="300" />
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
</template>

<script lang='ts'>
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { dateFormatInTable } from '@/utils/date'

@Component({
  name: 'DeviceEvents'
})
export default class extends Vue {
  @Prop() private deviceId?: String
  @Prop() private inProtocol?: String
  private loading = false
  private callbackTemplateName = ''
  private search = {
    timeRange: null,
    eventType: ''
  }
  private eventsTypeList: Array<any> = [
    {
      label: '全部',
      value: ''
    },
    {
      label: '设备/流上下线',
      value: '1'
    },
    {
      label: '录制事件',
      value: '2'
    },
    {
      label: '超码率',
      value: '3'
    }
  ]
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  private dateFormatInTable = dateFormatInTable

  // @Watch('dataList.length')
  // private onDataListChange(data: any) {
  //   data === 0 && this.pager.pageNum > 1 && this.handleCurrentChange(this.pager.pageNum - 1)
  // }

  private async mounted() {
    await this.getList()
  }

  private async refresh() {
    await this.getList()
  }
  private async getList() {
    try {
      this.loading = true
      let params = {
        pageNum: this.pager.pageNum,
        pageSize: this.pager.pageSize
      }
      // const res = await getCallbackTemplates(params)
      // this.dataList = res.templates
    } catch (e) {
      this.$message.error(`获取事件列表失败，原因：${e && e.message}`)
    } finally {
      this.loading = false
    }
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getList()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getList()
  }
}
</script>

<style lang="scss" scoped>
.filter-container__right {
  > * {
    margin-left: 10px;
  }
}
.filter-container__search-group {
  margin-right: 10px;
}
.template__table {
  ::v-deep .el-table__body {
    td {
      cursor: pointer;
    }
    .col-action {
      cursor: default;
    }
  }
}
</style>
