<template>
  <el-tooltip content="录像锁定" placement="top">
    <div class="control__btn" @click="lock">
      <svg-icon name="lock" width="16" height="16" />
      <LockDialog
        v-if="dialog.lock"
        :screen="screen"
        @on-close="closeLock"
      />
    </div>
  </el-tooltip>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import LockDialog from './LockDialogs/Lock.vue'

@Component({
  name: 'RecordLock',
  components: { LockDialog }
})
export default class extends Vue {
  @Prop()
  private screen: Screen

  private dialog = {
    lock: false
  }

  /**
   * 锁定片段
   */
  private async lock() {
    this.dialog.lock = true
  }

  /**
   * 关闭锁定
   */
  private closeLock() {
    this.dialog.lock = false
  }
}
</script>
