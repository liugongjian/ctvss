<template>
  <div>
    <el-button type="primary" @click="showAddPesronDialog=true">添加人员</el-button>
    <el-table v-loading="loading" class="personal-info__table" :data="dataList" fit @row-click="rowClick">
      <el-table-column prop="profile" label="头像" min-width="200">
        <template slot-scope="{row}">
          {{ row.profile }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="description" label="描述" />
    </el-table>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'PersonalInfo'
})
export default class extends Vue {
  private showAddPesronDialog = false
  private loading = false
}
</script>

<style lang="scss" scoped>
.personal-info__table {
  ::v-deep .el-table__body {
    td {
      cursor: pointer;
    }
    .col-action {
      cursor: default;
    }
  }
}
</style>
