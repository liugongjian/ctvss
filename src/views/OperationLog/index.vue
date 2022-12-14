<template>
  <div class="app-container">
    <el-card class="card">
      <opt-log />
    </el-card>
  </div>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator'
import OptLog from './OptLog.vue'

@Component({
  name: 'OperationLog',
  components: {
    OptLog
  }
})
export default class extends Vue {

}
</script>

<style lang="scss" scoped>
.card {
  height: 850px;
}
</style>
 