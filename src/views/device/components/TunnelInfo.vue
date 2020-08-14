<template>
  <div class="tunnel-info-wrap">
    <div class="tunnel-info-bg" @click="close" />
    <transition name="slide">
      <div v-if="show" class="tunnel-info">
        <div class="tunnel-info__title">通道信息</div>
        <div class="tunnel-info__close" @click="close">
          <i class="el-icon el-icon-close" />
        </div>
        <el-row class="tunnel-info__base">
          <el-col :span="12">
            <info-list label-position="left" label-width="80">
              <info-list-item label="设备名称:">一号楼</info-list-item>
              <info-list-item label="创建时间:">2020-06-13 18:12:44</info-list-item>
            </info-list>
          </el-col>
          <el-col :span="12">
            <info-list label-position="left" label-width="80">
              <info-list-item label="通道数:">120</info-list-item>
            </info-list>
          </el-col>
        </el-row>
        <div class="filter-container">
          <el-dropdown>
            <el-button>批量操作<i class="el-icon-arrow-down el-icon--right" /></el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>移动至</el-dropdown-item>
              <el-dropdown-item>启用设备</el-dropdown-item>
              <el-dropdown-item>停用设备</el-dropdown-item>
              <el-dropdown-item>启用流</el-dropdown-item>
              <el-dropdown-item>停用流</el-dropdown-item>
              <el-dropdown-item>删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <el-table v-loading="loading" :data="tunnelList" fit>
          <el-table-column type="selection" width="55" />
          <el-table-column label="通道ID/名称" width="200">
            <template slot-scope="{row}">
              <router-link to="/">{{ row.tunnelId }}</router-link>
              <div>
                {{ row.tunnelName }}
                <el-tooltip class="item" effect="dark" content="实时预览" placement="top">
                  <router-link to="/device/preview"><i class="el-icon-video-camera" /></router-link>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="设备状态">
            <template slot-scope="{row}">
              <status-badge :status="row.deviceStatus" />
              {{ deviceStatus[row.streamStatus] }}
            </template>
          </el-table-column>
          <el-table-column label="流状态">
            <template slot-scope="{row}">
              <status-badge :status="row.deviceStatus" />
              {{ deviceStatus[row.streamStatus] }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="scope">
              <el-button type="text">启用设备</el-button>
              <el-dropdown @command="handle(scope.row)">
                <el-button type="text">更多<i class="el-icon-arrow-down" /></el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item>实时预览</el-dropdown-item>
                  <el-dropdown-item>录像回放</el-dropdown-item>
                  <el-dropdown-item>查看截图</el-dropdown-item>
                  <el-dropdown-item>停用流</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          :current-page="pager.pageIndex"
          :page-size="pager.pageSize"
          :total="pager.total"
        />
      </div>
    </transition>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { DeviceStatus } from '@/dics'
import StatusBadge from '@/components/StatusBadge/index.vue'

@Component({
  name: 'TunnelInfo',
  components: {
    StatusBadge
  }
})
export default class extends Vue {
  private deviceStatus = DeviceStatus
  private loading = false
  private show = false
  private pager = {
    pageIndex: 1,
    pageSize: 10,
    total: 20
  }

  private tunnelList = [
    {
      tunnelId: 374623843,
      tunnelName: '一楼楼道监控',
      deviceStatus: 'on',
      streamStatus: 'on'
    },
    {
      tunnelId: 374623843,
      tunnelName: '一楼楼道监控',
      deviceStatus: 'on',
      streamStatus: 'on'
    }
  ]

  private mounted() {
    this.show = true
  }

  private close() {
    this.$emit('close')
  }

  private handle(tunnel: any) {

  }
}
</script>
<style lang="scss" scoped>
  .tunnel-info-wrap {
    position: relative;
    z-index: 10;
  }
  .tunnel-info-bg {
    position: fixed;
    z-index: 10;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
  }
  .tunnel-info {
    position: fixed;
    right: 0;
    top: 0;
    width: 600px;
    height: 100%;
    padding: 20px;
    z-index: 11;
    background: #fff;
    &__title {
      font-size: 18px;
    }
    &__close {
      position: absolute;
      top: 20px;
      right: 20px;
      padding: 0;
      background: transparent;
      border: none;
      outline: none;
      cursor: pointer;
      font-size: 16px;
    }
    &__base {
      margin: 20px 0;
    }
  }
  .slide-enter-active, .slide-leave-active {
    transition: transform .2s;
  }
  .slide-enter, .slide-leave-to {
    transform: translateX(550px);
  }
</style>
