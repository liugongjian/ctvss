<template>
  <el-dialog
    title="视图库详情"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="700px"
    center
    class="dialog"
    @close="closeDialog"
  >
    <div class="detail__section">
      <el-descriptions title="级联信息" :column="2">
        <el-descriptions-item label="平台ID">
          {{ platformDetails.cascadeViidId || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="平台名称">
          {{ platformDetails.name || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="网络类型">
          {{ Network[platformDetails.network] || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="级联区域">
          {{ regionTxt || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="心跳周期">
          {{ platformDetails.keepaliveInterval || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="描述" span="2">
          {{ platformDetails.description || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="上级视图编码">
          {{ platformDetails.apsId || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="上级服务器IP">
          {{ platformDetails.ipAddr || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="上级服务器端口">
          {{ platformDetails.port && platformDetails.port.toString() || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="用户名">
          {{ platformDetails.username || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="密码">
          {{ platformDetails.password || '-' }}
        </el-descriptions-item>
      </el-descriptions>
      <el-descriptions title="本级视图库信息" :column="2">
        <el-descriptions-item label="本级视图编码">
          {{ platformDetails.localApsId || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="本级服务器IP">
          {{ platformDetails.cascadeIp || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="本级服务器端口">
          {{ platformDetails.cascadePort && platformDetails.cascadePort.toString() || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">关 闭</el-button>
    </div>
  </el-dialog>
</template>
<script lang='ts'>
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Network } from '@/dics'
import { translateResourceRegion } from '@vss/device/api/dict'

@Component({
  name: 'ViidDetailsDialog'
})
export default class extends Vue {
  @Prop({ default: {} })
  private platformDetails
  private dialogVisible = true
  private closeDialog() {
    this.$emit('on-close')
  }
  private Network = Network
  private regionTxt = '-'

  @Watch('platformDetails', { immediate: true })
  private onDeviceChange() {
    this.getRegionTxt()
  }

  private async getRegionTxt() {
    try {
      if (!this.platformDetails.regionCode) {
        throw null
      }
      const res = await translateResourceRegion({ code: this.platformDetails.regionCode })
      this.regionTxt = res.name
    } catch (e) {
      this.regionTxt = '-'
    }
  }
}
</script>

<style lang="scss" scoped>
.detail__section {
  padding: 0 15px;
  overflow: hidden;
}

::v-deep .el-descriptions {
  &__header {
    margin: 10px 0;
  }

  &-item {
    vertical-align: top;

    &__content {
      word-break: break-all;
    }

    &__label {
      min-width: 120px;
      text-align: right;
      color: $textGrey;
    }
  }

  td {
    padding: 10px 0;
  }

  .el-link {
    margin-left: 10px;
  }
}

.dialog-footer {
  margin-top: 30px;
  text-align: center;
}
</style>
