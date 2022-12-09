<template>
  <el-card>
    <el-tabs v-model="activeName" type="border-card">
      <el-tab-pane label="IP管理" name="first">
        <div class="access-restriction">
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
              prop="date"
              label="IP"
              width="180"
            />
            <el-table-column
              prop="name"
              label="锁定开始时间"
              width="180"
            />
            <el-table-column
              prop="address"
              label="锁定结束时间"
            />
            <el-table-column
              prop="address"
              label="操作"
            >
              <span>解除锁定</span>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <el-tab-pane label="账号管理" name="second">
        <div>
          <el-table
            :data="tableData"
            style="width: 100%;"
          >
            <el-table-column
              prop="username"
              label="用户名"
              width="180"
            />
            <el-table-column
              prop="lastTime"
              label="最后登录时间"
              width="180"
            />
            <el-table-column
              prop="ip"
              label="最后登录IP"
            />
            <el-table-column
              prop="onlineStatus"
              label="在线状态"
            />
            <el-table-column
              prop="lockStatus"
              label="锁定状态"
            />
            <el-table-column
              prop="lockStart"
              label="锁定开始时间"
            />
            <el-table-column
              prop="lockEnd"
              label="锁定结束时间"
            />
            <el-table-column
              prop="address"
              label="操作"
            >
              <el-button>锁定</el-button>
              <el-button>查看访问日志</el-button>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
    <ip-restriction v-if="showIpDialog" :ip-access-rules="ipAccessRules" @on-close="changeIpDialog" @refresh="initData" />
    <lock-rule v-if="showCustomDialog" @on-close="changeCustomDialog" />
    <list-drawer v-if="showListDrawer" @on-close="changeShowListDrawer" />
  </el-card>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import { getIpRules } from '@/api/accessManage'

import IpRestriction from './components/Dialog/IpRestriction.vue'
import LockRule from './components/Dialog/LockRule.vue'
import ListDrawer from './components/ListDrawer.vue'

@Component({
  name: 'AccessRestriction',
  components: {
    IpRestriction,
    LockRule,
    ListDrawer
  }
})
export default class extends Vue {
  private activeName: string = 'first'

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
      if (this.ipAccessRules.whiteIpList.length) {
        return {
          name: '白名单',
          list: this.ipAccessRules.whiteIpList
        }
      } else if (this.ipAccessRules.blackIpList.length) {
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

  private async getIpList() {
    try {
      const res = await getIpRules(2)
      this.ipTableData = res.rules
    } catch (error) {
      this.$message.error(error)
    }
  }
}
</script>
<style lang="scss" scoped>
.access-restriction {
  p {
    margin-bottom: 0;
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

  p {
    margin-top: 0;
  }
}

</style>
