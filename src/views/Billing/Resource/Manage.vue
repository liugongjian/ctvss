<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-card>
      <div class="filter-container">
        <div class="filter-container__right">
          <el-input v-model="deviceName" class="filter-container__search-group" clearable placeholder="请输入设备名称" @keyup.enter.native="handleFilter">
            <el-button slot="append" class="el-button-rect" @click="handleFilter"><svg-icon name="search" /></el-button>
          </el-input>
          <el-button class="el-button-rect" @click="refresh"><svg-icon name="refresh" /></el-button>
        </div>
      </div>
      <el-table v-loading="loading" :data="dataList">
        <el-table-column prop="id" label="设备ID/名称" min-width="180">
          <template slot-scope="{ row }">
            <div class="device-list__device-name">
              <div class="device-list__device-id">{{ row.deviceId }}</div>
              <div>{{ row.deviceName }}</div>
            </div>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="dirPath" label="设备路径" min-width="180" /> -->
        <el-table-column prop="deviceType" label="类型" />
        <!-- <el-table-column label="码率">
          <template slot-scope="{row}">
            {{ row.codec ? '已绑定' : '-' }}
          </template>
        </el-table-column> -->
        <el-table-column prop="deviceVendor" label="厂商">
          <template slot-scope="{ row }">
            {{ row.deviceVendor ? row.deviceVendor : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="gbId" label="国标ID" min-width="190">
          <template slot-scope="{ row }">
            {{ row.gbId ? row.gbId : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="action" class-name="col-action" width="270" fixed="right">
          <template slot-scope="scope">
            <!-- <el-button type="text" @click="goToPreview('preview', scope.row)">实时预览</el-button>
            <el-button type="text" @click="goToPreview('replay', scope.row)">录像回放</el-button> -->
            <el-button v-permission="['*']" type="text" @click="updateResource(scope.row)">服务配置</el-button>
            <el-button v-if="UserModule.version === 2" type="text" @click="goToDevice(scope.row)">查看设备</el-button>
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
    <resource v-if="dialog.resource" :device="currentDevice" @on-close="closeDialog('resource', ...arguments)" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { getResourceDevices } from '@/api/billing'
import Resource from '@vss/device/components/Resource/Edit.vue'
import { UserModule } from '@/store/modules/user'

@Component({
  name: 'BillingResourceManagement',
  components: {
    Resource
  }
})
export default class extends Vue {
  private UserModule = UserModule
  private resourceId: any = ''
  private deviceName = ''
  private loading = false
  private dialog = {
    resource: false
  }
  private currentDevice = {}
  private breadCrumbContent = ''
  private dataList: Array<object> = []
  private pager: any = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }

  @Watch('dataList.length')
  private onDataListChange(data: any) {
    data === 0 && this.pager.pageNum > 1 && this.handleCurrentChange(this.pager.pageNum - 1)
  }

  @Watch('$route.path', { immediate: true })
  public pathChange(){
    this.dataList = []
    this.$nextTick(() => this.getData())
  }

  private back() {
    const params: any = this.$route.params
    this.$router.push({
      name: 'BillingResource',
      query: {
        type: params.type || 'video'
      }
    })
  }

  public updateResource(row: any) {
    this.currentDevice = {
      device: {
        deviceId: row.deviceId
      }
    }
    this.dialog.resource = true
  }

  private goToDevice(row: any) {
    this.$router.push({
      name: 'DeviceInfo',
      query: {
        deviceId: row.deviceId,
        type: row.deviceType
      }
    })
  }

  public closeDialog(type: string, refresh: any) {
    // @ts-ignore
    this.dialog[type] = false
    if (refresh === true) {
      this.getResourceDevices()
    }
  }

  // private async mounted() {
  //   this.getData()
  // }

  private getData(){
    this.breadCrumbContent = this.$route.meta.title
    this.resourceId = this.$route.query.resourceId
    this.getResourceDevices()
  }

  /**
   * 分页查询与资源包绑定的设备列表
   */
  private async getResourceDevices() {
    try {
      const params = {
        resourceId: this.resourceId,
        pageNum: this.pager.pageNum,
        pageSize: this.pager.pageSize,
        deviceName: this.deviceName || undefined
      }
      this.loading = true
      const res: any = await getResourceDevices(params)
      this.dataList = res.devices
      this.pager.total = res.totalNum
    } catch (e) {
      console.log(e)
    } finally {
      this.loading = false
    }
  }

  /**
   * 刷新
   */
  private refresh() {
    this.getResourceDevices()
  }

  /**
   * 按设备名称搜索过滤
   */
  private async handleFilter() {
    this.pager.pageNum = 1
    await this.getResourceDevices()
  }

  private handleSizeChange(val: number) {
    const pager: any = this.pager
    pager.pageSize = val
    pager.pageNum = 1
    this.getResourceDevices()
  }

  private handleCurrentChange(val: number) {
    const pager: any = this.pager
    pager.pageNum = val
    this.getResourceDevices()
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  &__search-group {
    margin-right: 10px;
  }
}
</style>
