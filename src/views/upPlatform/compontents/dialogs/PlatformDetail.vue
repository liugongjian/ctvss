<template>
  <el-dialog
    title="向上级联平台详情"
    :visible="dialogVisible"
    :close-on-click-modal="true"
    width="900px"
    center
    @close="closeDialog"
  >
    <div v-loading="loading" class="dialog-wrap">
      <info-list v-if="platform" label-width="150" class="platform-info-list">
        <info-list-item label="平台ID:">{{ platform.platformId }}</info-list-item>
        <info-list-item label="平台状态:"><status-badge :status="platform.status" />{{ platformStatus[platform.status] }}</info-list-item>
        <info-list-item label="平台名称:">{{ platform.name }}</info-list-item>
        <info-list-item label="SIP服务国标编码:">{{ platform.sipId }}</info-list-item>
        <info-list-item label="SIP服务国标域:">{{ platform.sipDomain }}</info-list-item>
        <info-list-item label="SIP服务IP:">{{ platform.sipIp }}</info-list-item>
        <info-list-item label="SIP服务端口:">{{ platform.sipPort }}</info-list-item>
        <info-list-item label="设备国标编号:">{{ platform.gbId || '-' }}</info-list-item>
        <info-list-item label="级联区域:">{{ platform.cascadeRegion }}</info-list-item>
        <info-list-item v-if="platform.enabledNat === 1" label="本地IP:">{{ platform.natIp || '-' }}</info-list-item>
        <info-list-item v-if="platform.enabledNat === 1" label="本地端口:">{{ platform.natPort || '-' }}</info-list-item>
        <info-list-item label="SIP认证用户名:">{{ platform.sipUser || '-' }}</info-list-item>
        <info-list-item label="SIP认证密码:">{{ platform.sipPassword || '-' }}</info-list-item>
        <info-list-item label="注册周期（秒）:">{{ platform.registerInterval }}</info-list-item>
        <info-list-item label="心跳周期（秒）:">{{ platform.heartbeatInterval }}</info-list-item>
        <info-list-item label="信令传输:">{{ platform.transType }}</info-list-item>
        <info-list-item label="字符集:">{{ platform.characterType }}</info-list-item>
        <info-list-item label="权限集合:">{{ platform.permissionSet }}</info-list-item>
        <info-list-item label="级联类型:">{{ platform.cascadeType === 1 ? '行政区划' : '虚拟业务组' }}</info-list-item>
        <info-list-item label="35114国密认证:">{{ platform.enabledGB35114 ? '已启用' : '未启用' }}</info-list-item>
        <info-list-item v-if="platform.enabledGB35114" label="强制双向认证:">{{ platform.gb35114Mode === 2 ? '已启用' : '未启用' }}</info-list-item>
        <info-list-item label="描述:">{{ platform.description }}</info-list-item>
      </info-list>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getPlatform } from '@/api/upPlatform'
import { PlatformStatus } from '@/dics'
import StatusBadge from '@/components/StatusBadge/index.vue'

@Component({
  name: 'DeviceDetail',
  components: {
    StatusBadge
  }
})
export default class extends Vue {
  private dialogVisible = true
  @Prop()
  private platformId?: string
  private platformStatus = PlatformStatus

  private platform = null
  private loading = false

  private mounted() {
    this.getPlatformInfo()
  }

  private async getPlatformInfo() {
    try {
      this.loading = true
      const res = await getPlatform({
        platformId: this.platformId
      })
      this.platform = res.platform
    } catch (e) {
      console.log(e)
    } finally {
      this.loading = false
    }
  }

  private closeDialog(isRefresh = false) {
    this.dialogVisible = false
    this.$emit('on-close', isRefresh)
  }
}
</script>
<style lang="scss" scoped>
  .platform-info-list {
    display: flex;
    flex-wrap: wrap;

    ::v-deep .info-item {
      flex: 1;
      min-width: 50%;
    }
  }
</style>
