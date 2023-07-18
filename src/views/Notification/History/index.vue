<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <el-radio-group v-model="timeRangeType" size="medium" @change="timeRangeTypeChange">
          <el-radio-button
            v-for="(item, index) in timeRangeTypeList"
            :key="index"
            :label="item"
          />
        </el-radio-group>
        <el-date-picker
          v-if="timeRangeType === '自定义时间'"
          v-model="timeRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="timeRangeChange"
        />
        <div class="filter-container__right">
          <el-button v-if="advancedFilterFlag" type="primary" @click="search">查询</el-button>
          <el-button v-else class="el-button-rect" @click="timeRangeTypeChange(timeRangeType)"><svg-icon name="refresh" /></el-button>
          <el-button v-if="advancedFilterFlag" type="primary" @click="advancedFilterFlag = !advancedFilterFlag">收起</el-button>
          <el-button v-else type="primary" @click="advancedFilterFlag = !advancedFilterFlag">高级筛选</el-button>
        </div>
        <el-form ref="form" :model="searchForm" label-width="120px" class="filter-container__advance-search" :class="{ 'filter-container__advance-search__expanded': advancedFilterFlag }">
          <el-form-item label="策略名称" prop="policyName">
            <el-input v-model="searchForm.policyName" />
          </el-form-item>
          <el-form-item label="策略描述" prop="description">
            <el-input v-model="searchForm.description" />
          </el-form-item>
          <el-form-item label="用户组" prop="userGroup">
            <!-- <div class="user-group">
              <el-select v-model="searchForm.userGroup" />
              <el-select v-model="searchForm.userGroup" />
            </div> -->
            <el-select v-model="searchForm.userGroup">
              <el-option
                v-for="(item, index) in userGroupOptions"
                :key="index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="推送方式" prop="notifyChannel">
            <el-select v-model="searchForm.notifyChannel">
              <el-option
                v-for="(item, index) in notifyChannelOptions"
                :key="index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="消息类型" prop="source">
            <el-select v-model="searchForm.source">
              <el-option
                v-for="(item, index) in sourceOptions"
                :key="index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="消息内容" prop="notifyContent">
            <el-input v-model="searchForm.notifyContent" />
          </el-form-item>
        </el-form>
      </div>
      <el-table
        ref="table"
        v-loading="loading"
        :data="dataList"
        fit
        class="template__table"
        @sort-change="sortChange"
      >
        <el-table-column
          key="create_time"
          column-key="create_time"
          prop="createTime"
          sortable="custom"
          label="推送时间"
          min-width="240"
        >
          <template slot-scope="{ row }">
            {{ row.createTime }}
          </template>
        </el-table-column>
        <el-table-column prop="policyName" label="策略名称" min-width="260" show-overflow-tooltip />
        <el-table-column prop="description" label="策略描述" min-width="260" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row.description || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="notifyChannel" label="推送方式" min-width="160">
          <template slot-scope="scope">
            {{ scope.row.notifyChannel === '1' ? '邮件推送' : '短信推送' }}
          </template>
        </el-table-column>
        <el-table-column prop="source" label="消息类型" width="140">
          <template slot-scope="{ row }">
            {{ sourceMap[row.source] }}
          </template>
        </el-table-column>
        <el-table-column v-if="isCarShow" label="车辆专用" width="140" align="center">
          <template slot-scope="{ row }">
            <el-tag v-if="row.source === '5'" type="success">是</el-tag>
            <el-tag v-else>否</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="notifyContent" label="消息内容" min-width="260" show-overflow-tooltip />
        <el-table-column prop="notifyUserDetails" label="推送对象" min-width="260" show-overflow-tooltip>
          <template slot-scope="{ row }">
            {{ row.notifyUserDetails && (row.notifyChannel === '1' ? JSON.parse(row.notifyUserDetails).email : JSON.parse(row.notifyUserDetails).phone) }}
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
    </el-card>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Watch } from 'vue-property-decorator'
import { INotifictionPolicy } from '@/type/Notification'
import { dateFormatInTable } from '@/utils/date'
import { getNotificationHistory } from '@/api/notification'
import { getGroupList } from '@/api/accessManage'
import { UserModule } from '@/store/modules/user'

@Component({
  name: 'notification-history-list'
})
export default class extends Vue {
  private loading = false
  private timeRangeType = '今天'
  private timeRangeTypeList = ['今天', '近3天', '自定义时间']
  private timeRange = []
  private advancedFilterFlag = false
  private notifyChannelOptions = [
    { value: '', label: '所有方式' },
    { value: '1', label: '邮件推送' },
    { value: '2', label: '短信推送' }
  ]

  private sourceOptions = [
    { value: '', label: '所有类型' },
    { value: '1', label: '设备消息' },
    // { value: '2', label: '资源包消息' },
    { value: '3', label: 'AI消息' },
    { value: '4', label: '平台事件消息' }
  ]

  private sourceMap = {
    1: '设备消息',
    2: '资源包消息',
    3: 'AI消息',
    4: '平台事件消息',
    5: '设备消息'
  }
  private userGroupOptions = []
  private searchForm = {
    policyName: '',
    description: '',
    userGroup: '',
    notifyChannel: '',
    source: '',
    notifyContent: '',
    startTime: 0,
    endTime: 0,
    sortBy: 'create_time',
    sortDirection: 'desc'
  }
  private dataList: Array<INotifictionPolicy> = []
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }

  private get isCarShow() {
    return UserModule.tags && UserModule.tags.isCarShow && UserModule.tags.isCarShow === 'true'
  }

  private dateFormatInTable = dateFormatInTable
  private currentTemplateId: any

  @Watch('dataList.length')
  private onDataListChange(data: any) {
    data === 0 && this.pager.pageNum > 1 && this.handleCurrentChange(this.pager.pageNum - 1)
  }

  private mounted() {
    this.getUserGroupList()
    this.timeRangeTypeChange(this.timeRangeType)
  }

  private refresh() {
    this.search()
  }

  /**
   * 获取推送历史列表
   */
  private async getList() {
    try {
      this.loading = true
      const params: any = this.searchForm
      if (!this.advancedFilterFlag) {
        params.policyName = ''
        params.description = ''
        params.userGroup = ''
        params.notifyChannel = ''
        params.source = ''
        params.notifyContent = ''
      }
      params.pageNum = this.pager.pageNum
      params.pageSize = this.pager.pageSize
      const res = await getNotificationHistory(params)
      this.dataList = res.data
      this.pager.total = res.totalNum
      this.pager.pageNum = res.pageNum
      this.pager.pageSize = res.pageSize
    } catch (e) {
      this.$message.error(`获取推送历史列表失败，原因：${e && e.message}`)
    } finally {
      this.loading = false
    }
  }

  /**
   * 搜索
   */
  private search() {
    this.pager.pageNum = 1
    this.getList()
  }

  /**
   * 触发排序
   * @param sort 排序对象
   */
  private sortChange(sort: any) {
    if (sort.order) {
      this.searchForm.sortBy = sort.column.columnKey
      this.searchForm.sortDirection = sort.order === 'ascending' ? 'asc' : 'desc'
      this.search()
    }
  }

  /**
   * 时间范围变化
   * @param val 时间起始
   */
  private timeRangeChange(val) {
    this.searchForm.startTime = val[0].getTime()
    this.searchForm.endTime = val[1].getTime()
    if (this.searchForm.startTime === this.searchForm.endTime) {
      this.searchForm.endTime = this.searchForm.endTime + 24 * 60 * 60 * 1000
    }
    this.search()
  }

  /**
   * 时间范围类型变化
   * @param type 范围类型
   */
  private timeRangeTypeChange(type: string) {
    const today = new Date(new Date().toLocaleDateString()).getTime()
    switch (type) {
      case '今天':
        this.searchForm.startTime = today
        this.searchForm.endTime = new Date().getTime()
        break
      case '近3天':
        this.searchForm.startTime = today - 2 * 24 * 60 * 60 * 1000
        this.searchForm.endTime = new Date().getTime()
        break
      case '自定义时间':
        this.searchForm.startTime = today - 6 * 24 * 60 * 60 * 1000
        this.searchForm.endTime = new Date().getTime()
        this.timeRange = [this.searchForm.startTime, this.searchForm.endTime]
        break
    }
    this.search()
  }

  /**
   * 获取用户列表
   */
  public async getUserGroupList() {
    try {
      const { groups } = await getGroupList({
        pageSize: 1000
      })
      this.userGroupOptions = groups.map(item => {
        return {
          value: item.groupId,
          label: item.groupName
        }
      })
      this.userGroupOptions.unshift({
        value: '',
        label: '所有用户组'
      })
    } catch (e) {
      this.$alertError(e && e.message)
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

  private handleCreate() {
    this.$router.push('/notification/policy/create')
  }

  private async handleFilter() {
    this.pager.pageNum = 1
    await this.getList()
  }

  private update(row: INotifictionPolicy) {
    this.$router.push({
      path: '/notification/policy/update',
      query: {
        templateId: row.id!.toString()
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  min-width: 1100px;

  .el-radio-group {
    margin-right: 20px;
  }

  &__advance-search {
    display: flex;
    flex-wrap: wrap;
    max-height: 0;
    transition: all 0.5s;

    &__expanded {
      max-height: 500px;
    }

    & > .el-form-item {
      flex: 1 0 33.33%;

      .el-select {
        width: 100%;
      }

      .user-group {
        .el-select {
          width: 40%;
        }

        .el-select + .el-select {
          width: 55%;
          float: right;
        }
      }
    }
  }
}

.template__table {
  ::v-deep .el-table__body {
    // td {
    //   cursor: pointer;
    // }
    .col-action {
      cursor: default;
    }
  }
}
</style>
