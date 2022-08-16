<template>
  <div>
    <div class="tab-container">
      <div class="filter-container">
        <el-button type="primary" @click="addApp">添加算法</el-button>
      </div>
      <el-table>
        <el-table-column label="算法类型" />
        <el-table-column label="描述" />
        <el-table-column label="当前算法版本" />
        <el-table-column label="告警次数" />
        <el-table-column label="关联设备" />
        <el-table-column label="操作" />
      </el-table>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'AiManage',
  components: {
  }
})

export default class IBoxList extends Vue {
  public tableData = []

  async mounted() {

  }
}
</script>
