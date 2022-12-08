<template>
  <el-card>
    <el-tabs v-model="activeName" type="border-card">
      <el-tab-pane label="设备统计" name="first">
        设备统计
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
@Component({
  name: 'Statistic'
})
export default class extends Vue {
  private activeName: string = 'first'
}
</script>

<style>

</style>
