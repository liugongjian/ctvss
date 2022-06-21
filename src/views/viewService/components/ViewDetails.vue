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
      <el-descriptions :column="2">
        <el-descriptions-item label="平台ID：">
          {{ platformDetails.cascadeViidId || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="平台名称：">
          {{ platformDetails.name || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="视频编码：">
          {{ platformDetails.apsId || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="服务器IP地址：">
          {{ platformDetails.ipAddr || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="服务器端口">
          {{ platformDetails.port || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="用户名">
          {{ platformDetails.username || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="密码">
          {{ platformDetails.password || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="心跳周期">
          {{ platformDetails.keepaliveInterval || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="描述">
          {{ platformDetails.description || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">关 闭</el-button>
    </div>
  </el-dialog>
</template>
<script lang='ts'>
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({
  name: 'ViewDetails'
})
export default class extends Vue {
  @Prop({ default: {} })
  private platformDetails
  private dialogVisible = true
  private closeDialog() {
    this.$emit('on-close')
  }
}
</script>

<style lang="scss" scoped>
.detail__section {
  padding: 0 50px;
  overflow: hidden;
}
.dialog-footer {
  margin-top: 30px;
  text-align: center;
}
</style>
