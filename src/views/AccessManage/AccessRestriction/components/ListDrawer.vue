<template>
  <el-drawer
    title="我是标题"
    :visible="true"
    :before-close="handleClose"
  >
    <el-radio-group v-model="radio" size="medium">
      <el-radio-button label="近一小时" value="1h" />
      <el-radio-button label="近1天" value="1d" />
      <el-radio-button label="近7天" value="7d" />
      <el-radio-button label="自定义时间" value="custom" />
    </el-radio-group>
    <el-table
      :data="tableData"
      style="width: 100%;"
    >
      <el-table-column
        prop="lastTime"
        label="操作时间"
        width="180"
      />
      <el-table-column
        prop="action"
        label="操作名称"
      />
      <el-table-column
        prop="resourcName"
        label="资源名称"
      />
      <el-table-column
        prop="IP"
        label="操作IP"
      />
    </el-table>
  </el-drawer>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
@Component({
  name: 'ListDrawer'
})
export default class extends Vue {
  private tableData = []
  private radio = '1h'
  private handleClose() {

  }
}
</script>
