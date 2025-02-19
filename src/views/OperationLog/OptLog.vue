<template>
  <div>
    <div v-loading="loading.form">
      <el-form :inline="true" class="search-filter__form" :rules="rules" :model="filter" @keyup.enter.native="handleFilter">
        <el-form-item>
          <el-radio-group v-model="btnSelected">
            <el-radio-button :label="1">近1小时</el-radio-button>
            <el-radio-button :label="2">近1天</el-radio-button>
            <el-radio-button :label="3">近7天</el-radio-button>
            <el-radio-button v-show="!showTimePicker" label="4">自定义时间</el-radio-button>
          </el-radio-group>
        </el-form-item> 
        <el-form-item>
          <el-date-picker
            v-show="showTimePicker"
            ref="customTimeRange"
            v-model="filter.timeRange"
            class="custom-time-range"
            type="datetimerange"
            :clearable="false"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="['00:00:00', '23:59:59']"
            :picker-options="pickerOpts"
            value-format="timestamp"
            size="mini"
            @blur="checkTimePicker"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item style="margin-top: 1px;" label="操作名称:" prop="operationNameId">
          <el-select v-model="filter.operationNameId" size="mini" placeholder="请选择操作类型">
            <el-option
              v-for="item in optNameList"
              :key="item.operationNameId"
              :label="item.operationName"
              :value="item.operationNameId"
            />
          </el-select>
        </el-form-item>
        <el-form-item style="margin-top: 1px;" class="search-filter__right" prop="keyWord">
          <el-input v-model="filter.keyWord" placeholder="请输入查询关键字" size="mini" clearable />
        </el-form-item>
        <el-form-item style="margin-top: 1px;">
          <!-- <el-button type="primary" size="mini" @click="handleFilter"><svg-icon name="search" /></el-button> -->
          <svg-icon name="search" class="search" @click="handleFilter" />
        </el-form-item>
        <el-form-item style="margin-top: 1px;">
          <el-tooltip placement="top" content="导出">
            <svg-icon name="export" class="export" @click="exportClick" />
          </el-tooltip>
        </el-form-item>
      </el-form>
    </div>
    <div v-loading="loading.list">
      <el-table ref="list" height="680px" :data="logList" fit @filter-change="optResFilter">
        <el-table-column label="操作时间" min-width="200" prop="operationTime">
          <template slot-scope="scope">
            {{ scope.row.operationTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作名称" min-width="200" prop="operationName">
          <template slot-scope="scope">
            {{ scope.row.operationName || '-' }}
          </template>
        </el-table-column>
        <el-table-column v-if="!isSub" label="操作者" min-width="200" prop="operator">
          <template slot-scope="scope">
            {{ scope.row.operator || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="资源名称" min-width="200" prop="resourceName">
          <template slot-scope="scope">
            {{ scope.row.resourceName || '-' }}
          </template>
        </el-table-column>
        <el-table-column v-if="!isSub" label="资源路径" min-width="200" prop="resourcePath">
          <template slot-scope="scope">
            {{ scope.row.resourcePath || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作IP" min-width="200" prop="sourceIP">
          <template slot-scope="scope">
            {{ scope.row.sourceIP || '-' }}
          </template>
        </el-table-column>
        <el-table-column v-if="false" min-width="200" prop="operationType">
          <template slot="header">
            <span class="filter">操作类型</span>
            <!-- <svg-icon class="filter" name="filter" width="15" height="15" /> -->
          </template>
          <template slot-scope="scope">
            {{ scope.row.operationType || '-' }}
          </template>
        </el-table-column>
        <el-table-column v-if="false" min-width="200" prop="operationResult" :filters="optResTypefilterArray" :filter-method="filterHandler" :filter-multiple="false" fixed="right">
          <template slot="header">
            <span class="filter">操作结果</span>
            <svg-icon class="filter" name="filter" width="15" height="15" />
          </template>
          <template slot-scope="scope">
            {{ scope.row.operationResult }}
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
</template>

<script lang='ts'>
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import { getOptLog, getOptName, exportLog } from '@/api/operationLog'
import { optResultType } from '@/dics/optResultType'
import settings from '@/settings'
import axios from 'axios'
 
@Component({
  name: 'OptLog'
})
export default class extends Vue {
  private loading = {
    form: false,
    list: false,
    disabled: false
  }
  private showTimePicker = false
  private logList = null
  private optNameList = []
  // 操作结果筛选
  private optResTypefilterArray = optResultType
  private optRes = undefined

  // 优化切换请求更新
  private axiosSource = null

  // 只可选择最近90天
  private pickerOpts = {
    disabledDate(time: any) {
      const today = new Date(new Date().toLocaleDateString()).getTime()
      const times = new Date(new Date(time.getTime()).toLocaleDateString()).getTime()
      return times > today || times < today - 91 * 24 * 60 * 60 * 1000
    }
  }


  private filter = {
    timeRange: [],
    // operationType: null,
    operationNameId: 0,
    keyWord: null
  }

  private pager = {
    pageNum: 1,
    pageSize: 20,
    total: 0
  }

  private rules = {
    keyWord: [
      { validator: this.validateKeyWord, trigger: 'change' }
    ]
  }

  private btnSelected = 1

  // 子用户查询界面显示控制
  private isSub = false

  @Prop()
  private operatorId: string

  @Watch('btnSelected', {
    immediate: true
  })
  private handleBtns(val: any) {
    this.timeFilter(+val)
  }

  @Watch('filter', {
    immediate: true,
    deep: true
  })
  private handleFilters() {
    this.getList()
  }

  private created() {
    this.operatorId ? this.isSub = true : this.isSub = false
  }

  private mounted() {
    this.getOptName()
    this.getList()
  }

  private validateKeyWord(rule: any, value: string, callback: Function) {
    if (value.length > 32) {
      callback(new Error('查询关键字不超过32位'))
    } else {
      callback()
    }
  }

  /**
      获取操作名称
   */
  private async getOptName() {
    try {
      this.loading.form = true
      const res = await getOptName()
      this.optNameList = res.operationList
      this.optNameList.unshift({
        operationNameId: 0,
        operationName: '全部'
      })
      // this.optNameList = this.fakeList
    } catch (e) {
      this.$message.error(e)
    } finally {
      this.loading.form = false
    }
  }

  /**
   * 获取操作日志
   */
  private async getList() {
    try {
      this.loading.disabled = true
      const params = this.initParams()
      this.axiosSource = axios.CancelToken.source()
      const res = await getOptLog(params, this.axiosSource.token)
      res.operationLogList.map((item: any) => {
        if (item.operationResult === '0') {
          item.operationResult = '失败'
        } else if (item.operationResult === '1') {
          item.operationResult = '成功'
        } else {
          item.operationResult = '-'
        }
      })
      this.logList = res.operationLogList
      this.pager.total = res.totalNum
    } catch (e) {
      if (e.code === -2) return
      this.$message.error(e)
    } finally {
      this.loading.disabled = false
      this.loading.list = false
    }
  }

  private initParams(type?: any) {
    this.loading.list = true
    const startTime = (this.filter.timeRange && this.filter.timeRange.length !== 0) ? +('' + this.filter.timeRange[0]).slice(0, -3) : undefined
    const endTime = (this.filter.timeRange && this.filter.timeRange.length !== 0) ? +('' + this.filter.timeRange[1]).slice(0, -3) : undefined
    const time = {
      startTime: startTime,
      endTime: endTime
    }
    const operationNameId = this.filter.operationNameId || undefined
    const keyWord = this.filter.keyWord || undefined
    const params = {
      operatorId: this.operatorId,
      ...time,
      ...this.filter,
      keyWord: keyWord,
      operationNameId: operationNameId === 0 ? undefined : operationNameId,
      pageNum: type ? undefined : this.pager.pageNum,
      pageSize: type ? undefined : this.pager.pageSize,
      operationResult: this.optRes || undefined
    }
    return params
  }

  private async filterHandler(value: any, row: any) {
    if (value === '1') {
      this.optRes = '1'
      return row.operationResult === '成功'
    } else if (value === '0') {
      this.optRes = '0'
      return row.operationResult === '失败'
    }
  }

  /**
   * 搜索
   */
  private async handleFilter() {
    try {
      this.axiosSource.cancel() //避免多次请求
      if (+this.btnSelected !== 4) {
        this.timeFilter(+this.btnSelected)
      }
      if (this.filter.timeRange.length < 1) {
       throw new Error('请选择查询时间段！')
      }
      this.pager.pageNum = 1
      await this.getList()
    } catch (e) {
      this.$message.error(e)
    }
    
  }

  private handleSizeChange(val: number) {
    const pager: any = this.pager
    pager.pageSize = val
    pager.pageNum = 1
    this.getList()
  }
  private handleCurrentChange(val: number) {
    const pager: any = this.pager
    pager.pageNum = val
    this.getList()
  }

  /**
   * 筛选操作结果
   */
  public async optResFilter(filters: any) {
    for (const key in filters) {
      this.optRes = filters[key][0] ? filters[key][0] + '' : undefined
    }
    this.getList()
  }

  /**
   * 时间筛选按钮组
   */
  private timeFilter(type: number) {
    const current = (new Date()).getTime() // ms
    // 清空一下搜索条件
    this.filter.timeRange = []
    if (type === 1) {
      this.showTimePicker = false
      this.filter.timeRange[0] = current - 60 * 60 * 1000
      this.filter.timeRange[1] = current
    } else if (type === 2) {
      this.showTimePicker = false
      this.filter.timeRange[0] = current - 24 * 60 * 60 * 1000
      this.filter.timeRange[1] = current
    } else if (type === 3) {
      this.showTimePicker = false
      this.filter.timeRange[0] = current - 7 * 24 * 60 * 60 * 1000
      this.filter.timeRange[1] = current
    } else if (type === 4) {
      this.showTimePicker = true
      const customTimeRange: any = this.$refs.customTimeRange
      customTimeRange.focus()
    }
  }

  /**
   * 检查自定义时间
   */
  private checkTimePicker() {
    if (this.filter.timeRange.length < 1) {
      this.showTimePicker = false
      this.btnSelected = null
    }
  }

  /**
   * 导出
   */
  private exportClick() {
    this.$msgbox({
      title: '导出操作日志',
      message: '确认导出当前查询条件下的全部日志吗？',
      showCancelButton: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    }).then(() => {
      this.exportCsv()
    }).catch((e) => {
      if (e === 'cancel') return
      this.$message.error(e)
    })
    
  }

  private async exportCsv() {
    try {
      // 1.请求分页数据
      await this.getList()
      // 2.导出请求
      const params = this.initParams('export')
      const res = await exportLog(params)
      this.exportLog(res.data)
    } catch (e) {
      this.$message.error(e)
    } finally {
      this.loading.list = false
    }
  }
 
  private exportLog(file: any) {
    // const xlsxData = new Blob([file])
    const a = document.createElement('a')
    // a.href = window.URL.createObjectURL(xlsxData)
    a.download = '操作日志.xlsx'
    a.href = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + file
    a.click()
    a.remove()
  }
}
</script>
<style>
.el-picker-panel__footer .el-picker-panel__link-btn.el-button--text {
  display: none;
}

.el-button-group {
  margin-top: -2px;
}

.el-form-item__label {
  padding-right: 10px;
}

.el-radio-button--medium .el-radio-button__inner {
  height: 28px;
  line-height: 28px;
  padding-top: 0;
}

.el-pagination {
  margin-top: 35px;
}
</style>
<style lang="scss" scoped>
.search-filter__form {
  margin-top: 0;
}

.filter {
  cursor: pointer;
}

.custom-time-range {
  top: 1px;
  left: -11px;
}

.export {
  margin-left: 2px;

  &:hover {
    cursor: pointer;
  }
}

.search {
  &:hover {
    cursor: pointer;
  }
}

.form-left {
  float: left;
}

</style>
