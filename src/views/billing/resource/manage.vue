<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-table v-loading="loading" :data="dataList">
      <el-table-column prop="id" label="设备ID/名称" />
      <el-table-column prop="path" label="设备路径">
        <template slot-scope="{row}">
          {{ row.totalDeviceCount }}路
        </template>
      </el-table-column>
      <el-table-column prop="type" label="类型" />
      <el-table-column label="视频包">
        <template slot-scope="{row}">
          {{ row.video ? '已绑定' : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="AI包">
        <template slot-scope="{row}">
          {{ row.ai ? '已绑定' : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="上行带宽包">
        <template slot-scope="{row}">
          {{ row.bandwidth ? '已绑定' : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="码率">
        <template slot-scope="{row}">
          {{ row.codec ? '已绑定' : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="factory" label="厂商" />
      <el-table-column prop="gbId" label="国标ID" />
      <el-table-column label="操作" prop="action" class-name="col-action" width="270" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" @click="goToPreview('preview', scope.row)">实时预览</el-button>
          <el-button type="text" @click="goToPreview('replay', scope.row)">录像回放</el-button>
          <el-button type="text">查看截图</el-button>
          <el-dropdown @command="handleMore">
            <el-button type="text">更多<i class="el-icon-arrow-down" /></el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>查看通道</el-dropdown-item>
              <el-dropdown-item v-if="isAllowedDelete && checkPermission(['*'])" :command="{type: 'delete', device: scope.row}">删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getResourceCount } from '@/api/dashboard'
@Component({
  name: 'BillingResourceManagement'
})
export default class extends Vue {
  private type: any = ''
  private loading: any = {
    form: false,
    submit: false
  }
  private breadCrumbContent: string = ''
  
  private policyList: Array<object> = []
  private showSecretKey: boolean = false


  private rowClick(row: any) {
  }

  private back() {
    this.$router.push({
      name: 'billing-resource'
    })
  }

  private async mounted() {
    this.breadCrumbContent = this.$route.meta.title
    try {

    } catch (e) {
      console.log(e)
    } finally {
      this.loading = false
    }
  }

  private async getPolicyList() {
    let params: any = {
      pageSize: 1000
    }
    try {

    } catch (e) {
      this.$message.error(e && e.message)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
