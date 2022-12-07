<template>
  <div>
    <div v-loading="loading.form">
      <el-form :inline="true" class="search-filter__form" :rules="rules" :model="filter" @keyup.enter.native="handleFilter">
        <el-form-item>
          <el-button-group>
            <el-button class="btn-group" @click="timeFilter(1)">近1小时</el-button>
            <el-button class="btn-group" @click="timeFilter(2)">近1天</el-button>
            <el-button class="btn-group" @click="timeFilter(3)">近7天</el-button>
            <el-button class="btn-group" v-show="!showTimePicker" @click="timeFilter(4)">自定义时间</el-button>
          </el-button-group> 
        </el-form-item> 
        <el-form-item>
          <el-date-picker
            class="custom-time-range"
            v-model="filter.timeRange"
            v-show="showTimePicker"
            ref="customTimeRange"
            type="datetimerange"
            :clearable="false"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="['00:00:00', '23:59:59']"
            :picker-options="pickerOpts"
            value-format="timestamp"
            @blur="checkTimePicker"
            size="mini">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="操作名称:" prop="operationNameId">
          <el-select v-model="filter.operationNameId" clearable size="mini" placeholder="请选择操作类型">
            <el-option
              v-for="item in optNameList"
              :key="item.operationNameId"
              :label="item.operationName"
              :value="item.operationNameId"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="search-filter__right" prop="keyWord">
          <el-input v-model="filter.keyWord" placeholder="请输入查询关键字" size="mini" clearable />
        </el-form-item>
        <el-form-item>
          <!-- <el-button type="primary" size="mini" @click="handleFilter"><svg-icon name="search" /></el-button> -->
          <svg-icon name="search" @click="handleFilter" class="search"  />
        </el-form-item>
        <el-form-item>
          <svg-icon name="export" @click="exportCsv" class="export" />
        </el-form-item>
      </el-form>
    </div>
    <div v-loading="loading.list">
      <el-table ref="list" :data="logList" fit @filter-change="optResFilter">
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
        <el-table-column label="操作者" min-width="200" prop="operator">
          <template slot-scope="scope">
            {{ scope.row.operator || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="资源名称" min-width="200" prop="resourceName">
          <template slot-scope="scope">
            {{ scope.row.resourceName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="资源路径" min-width="200" prop="resourcePath">
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
import { Vue, Component } from 'vue-property-decorator'
import { getOptLog, getOptName } from '@/api/operationLog'
import { optResultType } from '@/dics/optResultType'

@Component({
  name: 'OptLog'
})
export default class extends Vue {
  private loading = {
    form: false,
    list: false
  }
  private showTimePicker = false
  private logList = null
  private optNameList = []
  // 操作结果筛选
  private optResTypefilterArray = optResultType
  private optRes = undefined

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
    operationNameId: null,
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
  private validateKeyWord(rule: any, value: string, callback: Function) {
    if (value.length > 32) {
      callback(new Error('查询关键字不超过32位'))
    } else {
      callback()
    }
  }

  private mounted() {
    console.log('mounted')
    this.getOptName()
    this.getList()
  }

  /**
      获取操作名称
   */
  private async getOptName() {
    try {
      this.loading.form = true
      const res = await getOptName()
      console.log('操作名称： ', res)
      this.optNameList = res.operationList
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
      this.loading.list = true
      let startTime = (this.filter.timeRange && this.filter.timeRange.length !== 0) ? this.filter.timeRange[0] / 1000 : undefined
      let endTime = (this.filter.timeRange && this.filter.timeRange.length !== 0) ? this.filter.timeRange[0] / 1000 : undefined
      const time = {
        startTime: startTime,
        endTime: endTime
      }
      const operationNameId = this.filter.operationNameId || undefined
      const keyWord = this.filter.keyWord || undefined
      const params = {
        ...time,
        ...this.filter,
        keyWord: keyWord,
        operationNameId: operationNameId,
        pageNum: this.pager.pageNum,
        pageSize: this.pager.pageSize,
        operationResult: this.optRes || undefined
      }
      console.log('params:   ', params)
      const res = await getOptLog(params)
      console.log('res  :  ', res)
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
      this.$message.error(e)
    } finally {
      this.loading.list = false
    }
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
    this.pager.pageNum = 1
    await this.getList()
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
    for (let key in filters) {
      this.optRes = filters[key][0] ? filters[key][0] + '' : undefined
    }
    this.getList()
  }

  /**
   * 时间筛选按钮组
   */
  private timeFilter(type: number) {
    const current = (new Date()).getTime() // ms
    if (type === 1) {
      console.log('1')
      this.showTimePicker = false
      this.filter.timeRange[0] = current
      this.filter.timeRange[1] = current - 60 * 60 * 1000

    } else if (type === 2) {
      console.log('2')
      this.showTimePicker = false
      this.filter.timeRange[0] = current
      this.filter.timeRange[1] = current - 24 * 60 * 60 * 1000
    } else if (type === 3) {
      console.log('3')
      this.showTimePicker = false
      this.filter.timeRange[0] = current
      this.filter.timeRange[1] = current - 7 * 24 * 60 * 60 * 1000
    } else if (type === 4) {
      console.log('4')
      this.showTimePicker = true
      const customTimeRange: any = this.$refs.customTimeRange
      customTimeRange.focus()
    }
  }

  /**
   * 检查自定义时间
   */
  private checkTimePicker() {
    console.log('filter.timeRange', this.filter.timeRange)
    if (this.filter.timeRange.length < 1) {
      this.showTimePicker = false
    }
  }

  /**
   * 导出
   */
  private async exportCsv() {
    console.log('请求当前搜索条件的数据并导出')
    try {
      // 1.请求分页数据
      await this.getList()
      // 2.导出请求
    } catch (e) {
      this.$message.error(e)
    }
  }
}
</script>
<style scoped>
.el-picker-panel__footer .el-picker-panel__link-btn.el-button--text {
  display: none;
}

.el-button-group {
  margin-top: -2px;
}

.el-form-item__label {
  padding-right: 0;
}
</style>
<style lang="scss" scoped>
.filter {
  cursor: pointer;
}

.btn-group {
  height: 28px;
  line-height: 28px;
  padding-top: 0;
}

.custom-time-range {
  top: 1px;
  left: -9px;
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
</style>
