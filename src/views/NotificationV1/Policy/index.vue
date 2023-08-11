<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <el-button type="primary" @click="handleCreate">新建推送策略</el-button>
        <div class="filter-container__right">
          <el-input v-model="notificationPolicyName" class="filter-container__search-group" placeholder="请输入策略名" @keyup.enter.native="search">
            <el-button slot="append" class="el-button-rect" @click="search"><svg-icon name="search" /></el-button>
          </el-input>
          <el-button class="el-button-rect" @click="refresh"><svg-icon name="refresh" /></el-button>
        </div>
      </div>
      <el-table ref="table" v-loading="loading" :data="dataList" fit class="template__table">
        <el-table-column prop="name" label="策略名" min-width="240" />
        <el-table-column prop="description" label="策略描述" min-width="260" show-overflow-tooltip>
          <template slot-scope="{ row }">
            {{ row.description || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="notifyChannel" label="推送方式" min-width="160">
          <template slot-scope="scope">
            {{ scope.row.notifyChannel === '1' ? '邮件推送' : '短信推送' }}
          </template>
        </el-table-column>
        <el-table-column prop="effectiveTime" label="推送时段" min-width="160">
          <template slot-scope="{ row }">
            {{ row.effectiveTime | timeFormat }}
          </template>
        </el-table-column>
        <el-table-column prop="notifyFreq" label="推送频率" width="200">
          <template slot-scope="{ row }">
            {{ notifyFreqMap[row.notifyFreq] }}
          </template>
        </el-table-column>
        <el-table-column prop="source" label="消息类型" width="200">
          <template slot-scope="{ row }">
            {{ sourceMap[row.source] }}
          </template>
        </el-table-column>
        <el-table-column prop="sourceRulesLabel" label="子类型" width="200" show-overflow-tooltip />
        <el-table-column prop="active" label="状态" width="200">
          <template slot-scope="{ row }">
            <el-button v-if="row.active === 1" type="success" size="mini">已生效</el-button>
            <el-button v-else type="danger" size="mini">未生效</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="action" class-name="col-action" label="操作" width="250" fixed="right">
          <template slot-scope="{ row }">
            <el-button v-if="row.active" type="text" @click="toggleStatus(parseInt(row.id), 0)">关闭</el-button>
            <el-button v-else type="text" @click="toggleStatus(parseInt(row.id), 1)">开启</el-button>
            <el-button type="text" @click="update(row)">编辑策略</el-button>
            <el-button type="text" @click="deleteTemplate(row)">删除策略</el-button>
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
import { toggleNotificationPolicyStatus, getNotificationPolicyList, deleteNotificationPolicy } from '@/api/notification'

@Component({
  name: 'ai-template',
  filters: {
    timeFormat: (value: string) => {
      const timeRange = JSON.parse(value)[0]
      return timeRange.start_time.substr(0, 5) + ' - ' + timeRange.end_time.substr(0, 5)
    }
  }
})
export default class extends Vue {
  private loading = false
  private notificationPolicyName = ''
  private dataList: Array<INotifictionPolicy> = []
  private notifyFreqMap = {
    '30': '半小时',
    '60': '1小时',
    '120': '2小时',
    '240': '4小时',
    '480': '8小时',
    '1440': '24小时'
  }
  private sourceMap = {
    '1': '设备消息',
    '2': '资源包消息',
    '3': 'AI消息',
    '4': '平台事件消息'
  }
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  private dateFormatInTable = dateFormatInTable
  private currentTemplateId: any

  @Watch('dataList.length')
  private onDataListChange(data: any) {
    data === 0 && this.pager.pageNum > 1 && this.handleCurrentChange(this.pager.pageNum - 1)
  }

  private async mounted() {
    await this.getList()
  }

  private async refresh() {
    await this.getList()
  }

  private async getList() {
    try {
      this.loading = true
      const params = {
        name: this.notificationPolicyName,
        pageNum: this.pager.pageNum,
        pageSize: this.pager.pageSize
      }
      const res = await getNotificationPolicyList(params)
      this.dataList = res.data
      this.pager.total = res.totalNum
      this.pager.pageNum = res.pageNum
      this.pager.pageSize = res.pageSize
    } catch (e) {
      this.$message.error(`获取策略列表失败，原因：${e && e.message}`)
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

  private handleCreate() {
    this.$router.push('/notification/policy/create')
  }

  private async search() {
    this.pager.pageNum = 1
    await this.getList()
  }

  private async deleteTemplate(row: INotifictionPolicy) {
    this.$alertDelete({
      type: '消息推送策略',
      msg: `确定删除消息推送策略"${row.name}"`,
      method: deleteNotificationPolicy,
      payload: { id: row.id },
      onSuccess: this.getList
    })
  }

  private async toggleStatus(id: number, active: number) {
    try {
      await toggleNotificationPolicyStatus({ id, active })
      this.getList()
    } catch (e) {
      this.$message.error(`操作失败，原因：${e && e.message}`)
    }
  }

  private update(row: INotifictionPolicy) {
    this.$router.push({
      path: '/notification/policy/edit',
      query: {
        id: row.id!.toString()
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.filter-container__search-group {
  margin-right: 10px;
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

body {
  ::v-deep .el-tooltip__popper {
    max-width: 300px;
  }
}
</style>
