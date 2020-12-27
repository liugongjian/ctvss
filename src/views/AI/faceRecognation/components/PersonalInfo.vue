<template>
  <div>
    <el-button type="primary" @click="showAddPesronDialog=true">添加人员</el-button>
    <el-table v-loading="loading" class="personal-info__table" :data="dataList" fit>
      <el-table-column prop="profile" label="头像">
        <template slot-scope="{row}">
          {{ row.profile }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="description" label="描述" />
    </el-table>
    <AddPersonal v-if="showAddPesronDialog" @on-close="showAddPesronDialog=false" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import AddPersonal from './dialogs/AddPersonal'

@Component({
  name: 'PersonalInfo',
  components: {
    AddPersonal
  }
})
export default class extends Vue {
  private showAddPesronDialog = false
  private loading = false
  private dataList = []
}
</script>

<style lang="scss" scoped>
.personal-info__table {
  margin-top: 10px;
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
