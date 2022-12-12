<template>
  <el-card>
    <el-tabs v-model="activeName" type="border-card" @tab-click="handleClick">
      <el-tab-pane label="IP管理" name="ipManage">
        <div v-if="activeName === 'ipManage'" class="access-restriction">
          <div class="access-restriction__title">
            <div class="access-restriction__title-text">IP访问限制</div>
            <el-button type="primary" size="mini" @click="changeIpDialog">配置</el-button>
          </div>
          <el-descriptions v-if="ipAccessRules" :column="1">
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
              <template slot-scope="{row}">
                <span v-if="row.blackIpList.length > 1">
                  <el-tooltip class="item" effect="dark" :content="row.blackIpList.join('/')" placement="top-start">
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
              <template slot-scope="{row}">
                <span>{{ dateFormat(Number(row.createTime)) }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="expireTime"
              label="锁定结束时间"
            >
              <template slot-scope="{row}">
                <span>{{ dateFormat(Number(row.expireTime)) }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="address"
              label="操作"
            >
              <template slot-scope="{row}">
                <el-button type="text" @click.stop.prevent="relieveLock(row)">解除锁定</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <el-tab-pane label="账号管理" name="accountManage">
        <div v-if="activeName === 'accountManage'">
          <el-table
            :data="tableData"
            style="width: 100%;"
          >
            <el-table-column
              prop="username"
              label="用户名"
              width="120"
            />
            <el-table-column
              prop="lastTime"
              label="最后登录时间"
              width="180"
            />
            <el-table-column
              prop="ip"
              label="最后登录IP"
              width="180"
            />
            <el-table-column
              prop="onlineStatus"
              label="在线状态"
            />
            <el-table-column
              prop="lockStatus"
              label="锁定状态"
            >
              <template slot-scope="{row}">
                {{ row.enabled === 1 ?'锁定' :'未锁定' }}
              </template>
            </el-table-column>
            <el-table-column
              prop="createTime"
              label="锁定开始时间"
              width="180"
            >
              <template slot-scope="{row}">
                <span>{{ dateFormat(Number(row.createTime)) }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="expireTime"
              label="锁定结束时间"
              width="180"
            >
              <template slot-scope="{row}">
                <span>{{ dateFormat(Number(row.expireTime)) }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="address"
              label="操作"
              width="220"
            >
              <template slot-scope="{row}">
                <!-- <el-button type="text">{{ row.enabled === 1 ?'解除锁定' :'锁定' }}</el-button> -->
                <el-button v-if="row.enabled === 1" type="text" @click.stop.prevent="relieveLock(row)">解除锁定</el-button>
                <el-button v-else type="text" @click.stop.prevent="changeCustomDialog">锁定</el-button>
                <el-button type="text" @click.stop.prevent="changeShowListDrawer">查看访问日志</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
    <ip-restriction v-if="showIpDialog" :ip-access-rules="ipAccessRules" @on-close="changeIpDialog" @refresh="initData" />
    <lock-rule v-if="showCustomDialog" @on-close="changeCustomDialog" @refresh="initData" @set-lock="setIpRules" />
    <list-drawer v-if="showListDrawer" @on-close="changeShowListDrawer" />
  </el-card>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import { getIpRules, unlockIpRules, getIplock, setIpLock, setIpRules } from '@/api/accessManage'

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
  private activeName: string = 'ipManage'

  private dateFormat = dateFormat

  private showIpDialog: boolean = false
  private ipDataForDialog = {}

  private ipTableData = []
  private tableData = []

  private showCustomDialog: boolean = false

  private showListDrawer: boolean = false

  private ipAccessRules: any = {}

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

  private changeCustomDialog() {
    this.showCustomDialog = !this.showCustomDialog
  }

  private changeShowListDrawer() {
    this.showListDrawer = !this.showListDrawer
  }

  private get getAccessRestriction() {
    if (this.ipAccessRules) {
      if (this.ipAccessRules.whiteIpList && this.ipAccessRules.whiteIpList.length) {
        return {
          name: '白名单',
          list: this.ipAccessRules.whiteIpList
        }
      } else if (this.ipAccessRules.whiteIpList && this.ipAccessRules.blackIpList.length) {
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
    this.$confirm('确认解除？').then(async() => {
      const param = {
        ruleId: rowInfo.ruleId
      }
      await unlockIpRules(param)
      this.getIpList()
    }).catch(() => { console.log() })
  }

  private async getIpList() {
    try {
      const res = await getIpRules(2)
      this.ipTableData = res.rules
    } catch (error) {
      this.$message.error(error)
    }
  }

  private handleClick() {
    if (this.activeName === 'ipManage') {
      this.initData()
    } else {
      this.getIplock()
    }
  }

  // 锁定 公用回调
  private async setIpRules(param: any) {
    try {
      if (this.activeName === 'ipManage') {
        await setIpRules(param)
        this.initData()
      } else {
        await setIpLock(param)
        this.getIplock()
      }
    } catch (error) {
      this.$message.error(error && error.message)
    }
  }

  private async getIplock() {
    try {
      const res = await getIplock()
      this.tableData = res.rules
    } catch (error) {
      this.$message.error(error && error.message)
    }
  }

  // private unlockThis(rowInfo: any) {
  //   this.$confirm('确认解除？').then(async() => {
  //     const param = {
  //       ruleId: rowInfo.ruleId
  //     }
  //     await unlockIpRules(param)
  //     this.getIpList()
  //   }).catch(() => { console.log() })
  // }
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

</style>
