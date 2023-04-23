<!--
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-04-14 14:24:16
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-04-14 15:44:55
 * @FilePath: /vss-user-web/src/views/AccessManage/AccessRestriction/components/ListDrawer.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <el-drawer
    :title="`${drawerInfo.userName}访问日志`"
    :visible="true"
    :before-close="handleClose"
    size="55%"
  >
    <div class="drawer-box">
      <opt-log :operator-id="drawerInfo.iamUserId" />
    </div>
  </el-drawer>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import OptLog from '@/views/OperationLog/OptLog.vue'
@Component({
  name: 'ListDrawer',
  components: {
    OptLog
  }
})
export default class extends Vue {
  @Prop() private drawerInfo?: string

  private handleClose() {
    this.$emit('on-close')
  }
}
</script>
<style lang="scss" scoped>
.drawer-box {
  padding: 10px;

  ::v-deep .el-pagination {
    position: fixed;
    bottom: 36px;
    right: 26px;
  }
}
</style>
