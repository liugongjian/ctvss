<template>
  <el-drawer
    title="我是标题"
    :visible="true"
    :before-close="handleClose"
    size="55%"
  >
    <div class="drawer-box">
      <opt-log :operator-id="1" />
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
  @Prop() private operatorId?: string

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
    bottom: 26px;
    right: 26px;
  }
}
</style>
