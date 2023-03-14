<template>
  <el-card>
    <el-tabs v-model="activeName" type="border-card" @tab-click="handleClick">
      <el-tab-pane label="IP管理" name="ipManage">
        <div v-if="activeName === 'ipManage'" class="access-restriction">
          <div class="access-restriction__title">
            <div class="access-restriction__title-text">IP访问限制</div>
            <el-button type="primary" size="mini" @click="changeIpDialog">配置</el-button>
          </div>
          <el-descriptions v-if="ipAccessRules && getAccessRestriction.list.length > 0" :column="1">
            <el-descriptions-item label="访问名单类型">{{ getAccessRestriction.name }}</el-descriptions-item>
            <el-descriptions-item :label="`${getAccessRestriction.name}列表`">
              <p v-for="item in getAccessRestriction.list" :key="item">{{ item }}</p>
            </el-descriptions-item>
            <el-descriptions-item label="是否启用">{{ ipAccessRules.enabled === 1 ? '是' : '否' }}</el-descriptions-item>
          </el-descriptions>

          <div class="access-restriction__title">
            <div class="access-restriction__title-text">临时IP访问限制</div>
            <el-button v-if="getAccessRestriction.name === '黑名单'" type="primary" size="mini" @click="changeCustomDialog">添加锁定规则</el-button>
          </div>
          <el-table
            :data="ipTableData"
            style="width: 100%;"
          >
            <el-table-column
              prop="blackIpList"
              label="IP"
              width="180"
            >
              <template slot-scope="{ row }">
                <span v-if="row.blackIpList.length > 1">
                  <el-tooltip class="item" effect="dark" placement="top-start">
                    <div slot="content">
                      <p v-for="item in row.blackIpList" :key="item">
                        {{ item }}
                      </p>
                    </div>
                    <span> {{ row.blackIpList[0] }}</span>
                  </el-tooltip>
                </span>
                <span v-else>{{ row.blackIpList.join(',') }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="createTime"
              label="锁定开始时间"
              width="180"
            >
              <template slot-scope="{ row }">
                <span>{{ dateFormat(Number(row.createTime)) }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="expireTime"
              label="锁定结束时间"
            >
              <template slot-scope="{ row }">
                <span v-if="row.expireTime === '-1'">永久</span>
                <span v-else>{{ dateFormat(Number(row.expireTime)) }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="address"
              label="操作"
            >
              <template slot-scope="{ row }">
                <el-button type="text" @click.stop.prevent="relieveLock(row)">解除锁定</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <!-- 账号管理  -->
      <el-tab-pane label="账号管理" name="accountManage">
        <div v-if="activeName === 'accountManage'" class="account-manage">
          <el-form :inline="true">
            <el-form-item label="在线状态">
              <el-select v-model="listQueryForm.onlineStatus" placeholder="请选择在线状态">
                <el-option label="全部" value="" />
                <el-option label="在线" value="true" />
                <el-option label="离线" value="false" />
              </el-select>
            </el-form-item>
            <el-form-item label="锁定状态">
              <el-select v-model="listQueryForm.lockStatus" placeholder="请选择锁定状态">
                <el-option label="全部" value="" />
                <el-option v-for="item in Object.keys(lockStateToText)" :key="lockStateToText[item]" :label="lockStateToText[item]" :value="item" />
              </el-select>
            </el-form-item>
            <el-form-item label="用户名">
              <el-input v-model="listQueryForm.username" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item>
              <el-button icon="el-icon-search" @click="searchAccountlock" />
              <!-- <el-button icon="el-icon-refresh" circle @click="resetSearch" /> -->
            </el-form-item>
          </el-form>
          <el-table
            :data="tableData"
            style="width: 100%;"
          >
            <el-table-column
              prop="userName"
              label="用户名"
              width="200"
            />
            <el-table-column
              prop="lastLoginTime"
              label="最后登录时间"
              width="220"
            >
              <!-- <template slot-scope="{row}">
                {{ row.lastLoginTime === '-' ? row.lastLoginTime : dateFormat(Number(row.lastLoginTime)) }}
              </template> -->
            </el-table-column>
            <el-table-column
              prop="lastLoginIp"
              label="最后登录IP"
              width="220"
            >
              <template slot-scope="{ row }">
                <span v-if="row.lastLoginIp.split(',').length > 1">
                  <el-tooltip class="item" effect="dark" :content="row.lastLoginIp" placement="top-start">
                    <span> {{ row.lastLoginIp.split(',')[0] }}</span>
                  </el-tooltip>
                </span>
                <span v-else>{{ row.lastLoginIp }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="isOnline"
              label="在线状态"
            >
              <template slot-scope="{ row }">
                {{ row.isOnline ? '在线' : '离线' }}
              </template>
            </el-table-column>
            <el-table-column
              prop="lockState"
              label="锁定状态"
            >
              <template slot-scope="{ row }">
                <span v-if="row.lockState === 0">
                  {{ lockStateToText[row.lockState] }}
                </span>
                <span v-else-if="row.lockState === 1" class="account-manage__lock">
                  <el-tooltip class="item" effect="dark" :content="row.lockIP" placement="top-start">
                    <span> {{ lockStateToText[row.lockState] }} <i class="el-icon-warning" /></span>
                  </el-tooltip>
                </span>
                <span v-else class="account-manage__lock">
                  <span> {{ lockStateToText[row.lockState] }} <i class="el-icon-warning" /></span>
                </span>
              </template>
            </el-table-column>
            <el-table-column
              prop="lockStartTime"
              label="锁定开始时间"
              width="220"
            >
              <!-- <template slot-scope="{row}">
                <span>{{ dateFormat(Number(row.lockStartTime)) }}</span>
              </template> -->
            </el-table-column>
            <el-table-column
              prop="lockEndTime"
              label="锁定结束时间"
              width="220"
            >
              <!-- <template slot-scope="{row}">
                <span v-if="row.lockEndTime === '-'">永久</span>
                <span v-else>{{ dateFormat(Number(row.lockEndTime)) }}</span>
              </template> -->
            </el-table-column>
            <el-table-column
              prop="address"
              label="操作"
              width="220"
            >
              <template slot-scope="{ row }">
                <el-button v-if="row.lockState !== 0" type="text" @click.stop.prevent="relieveLock(row)">解除锁定</el-button>
                <el-button v-else type="text" @click.stop.prevent="changeCustomDialog(row)">锁定</el-button>
                <el-button type="text" @click.stop.prevent="changeShowListDrawer(row)">查看访问日志</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-if="Array.isArray(tableData)"
            :current-page="pager.pageNum" :page-size="pager.pageSize" :total="pager.totalNum" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
    <ip-restriction v-if="showIpDialog" :ip-access-rules="ipAccessRules" @on-close="changeIpDialog" @refresh="initData" />
    <lock-rule v-if="showCustomDialog" :active-name="activeName" @on-close="changeCustomDialog" @refresh="initData" @set-lock="setIpRules" />
    <list-drawer v-if="showListDrawer" :drawer-info="drawerInfo" @on-close="changeShowListDrawer" />
  </el-card>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import {
  getIpRules,
  unlockIpRules,
  // setIpLock,
  setIpRules,
  getAccessList,
  accountUnlock,
  accountLock
} from '@/api/accessManage'

import IpRestriction from './components/Dialog/IpRestriction.vue'
import LockRule from './components/Dialog/LockRule.vue'
import ListDrawer from './components/ListDrawer.vue'
import { dateFormat } from '@/utils/date'

@Component({
  name: 'AccessRestriction',
  components: {
    IpRestriction,
    LockRule,
    ListDrawer
  }
})
export default class extends Vue {
  private activeName = 'ipManage'

  private dateFormat = dateFormat

  private showIpDialog = false
  private ipDataForDialog = {}

  private ipTableData = []
  private tableData = []

  private showCustomDialog = false

  private showListDrawer = false

  private ipAccessRules: any = {}

  private drawerInfo = ''

  private lockStateToText = {
    0: '未锁定',
    1: '锁定IP',
    2: '锁定用户'
  }

  private pager = {
    pageNum: 1,
    pageSize: 10,
    totalNum: 0
  }

  private listQueryForm: any = {
    onlineStatus: '',
    lockStatus: '',
    username: ''
  }

  private userName = ''

  async mounted() {
    await this.initData()
  }

  private async initData() {
    await this.getIpAccessRules()
    await this.getIpList()
  }

  private changeIpDialog() {
    this.showIpDialog = !this.showIpDialog
  }

  private changeCustomDialog(row?: any) {
    this.showCustomDialog = !this.showCustomDialog
    if (row) {
      this.iamUserId = row.iamUserId
    }
  }

  private changeShowListDrawer(row: any) {
    this.showListDrawer = !this.showListDrawer
    this.drawerInfo = row
  }

  private get getAccessRestriction() {
    if (this.ipAccessRules) {
      if (this.ipAccessRules.whiteIpList && this.ipAccessRules.whiteIpList.length) {
        return {
          name: '白名单',
          list: this.ipAccessRules.whiteIpList
        }
      } else if (this.ipAccessRules.blackIpList && this.ipAccessRules.blackIpList.length) {
        return {
          name: '黑名单',
          list: this.ipAccessRules.blackIpList
        }
      }
    }
    return {
      name: '无',
      list: []
    }
  }

  private async getIpAccessRules() {
    try {
      const res = await getIpRules(1)
      this.ipAccessRules = res.rules[0]
    } catch (error) {
      this.$message.error(error)
    }
  }

  private relieveLock(rowInfo: any) {
    try {
      if (this.activeName === 'ipManage') {
        this.$confirm('是否确定解除该用户的访问限制？').then(async() => {
          const param = {
            ruleId: rowInfo.ruleId
          }
          await unlockIpRules(param)
          this.getIpList()
          this.$message.success('解除成功')
        }).catch(() => { console.log() })
      } else {
        this.$confirm('是否确定解除该用户的访问限制？').then(async() => {
          const param = {
            iamUserId: rowInfo.iamUserId
          }
          await accountUnlock(param)
          this.getAccountlock()
          this.$message.success('解除成功')
        }).catch(() => { console.log() })
      }
    } catch (error) {
      this.$message.error(error)
    }
  }

  private async getIpList() {
    try {
      const res = await getIpRules(2)
      this.ipTableData = res.rules
    } catch (error) {
      this.$message.error(error && error.message)
    }
  }

  private handleClick() {
    if (this.activeName === 'ipManage') {
      this.initData()
    } else {
      this.getAccountlock()
    }
  }

  // 锁定 公用回调
  private async setIpRules(param: any) {
    try {
      if (this.activeName === 'ipManage') {
        await setIpRules(param)
        this.changeCustomDialog()
        this.initData()
      } else {
        const { blackIpList, expireTime } = param

        let query: any = {}

        if (expireTime) {
          query = {
            customLockEnd: Math.floor(expireTime / 1000),
            lockIP: blackIpList.join(','),
            iamUserId: this.iamUserId
          }
        } else {
          query = {
            lockTimeMin: -1,
            lockIP: blackIpList.join(','),
            iamUserId: this.iamUserId
          }
        }

        await accountLock(query)
        this.changeCustomDialog()
        this.getAccountlock()
      }
      this.$message.success('绑定成功')
    } catch (error) {
      this.$message.error(error && error.message)
    }
  }

  private async getAccountlock() {
    try {
      const { pageNum, pageSize } = this.pager

      const param = {
        pageNum,
        pageSize,
        isOnlineFilter: this.listQueryForm.onlineStatus,
        lockStateFilter: (this.listQueryForm.lockStatus).toString(),
        userName: this.listQueryForm.username
      }

      const res = await getAccessList(param)

      this.tableData = res.accessRules
      this.pager.totalNum = Number(res.totalNum)
    } catch (error) {
      this.$message.error(error && error.message)
    }
  }

  private searchAccountlock() {
    this.pager.pageNum = 1
    this.getAccountlock()
  }

  private handleSizeChange(val: number) {
    this.pager.pageSize = val
    this.pager.pageNum = 1
    this.getAccountlock()
  }

  private handleCurrentChange(val: number) {
    this.pager.pageNum = val
    this.getAccountlock()
  }

  private resetSearch() {
    this.pager = {
      pageNum: 1,
      pageSize: 10,
      totalNum: 0
    }

    this.listQueryForm = {
      onlineStatus: '',
      lockStatus: '',
      username: ''
    }
    this.getAccountlock()
  }
}
</script>
<style lang="scss" scoped>
.access-restriction {
  p {
    margin-bottom: 0;
    margin-top: 0;
  }

  &__title {
    padding-left: 16px;
    border-left: 8px solid #fa8334;
    height: 26px;
    line-height: 26px;
    font-size: 16px;
    font-weight: bold;
    margin: 10px 0 20px;

    &-text {
      width: 120px;
      display: inline-block;
    }
  }

  ::v-deep .el-descriptions {
    &-item__label {
      text-align: right;
      min-width: 120px;
    }
  }

  ::v-deep .el-button {
    &--mini {
      margin-left: 26px;
      min-width: 140px;
    }
  }
}

.account-manage {
  ::v-deep .el-form {
    float: right;
  }

  &__lock {
    color: red;
  }
}

</style>
