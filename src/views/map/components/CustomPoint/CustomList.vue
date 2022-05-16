<template>
  <div class="cutsom-point-list">
    <div class="cutsom-point-list__btn">
      <el-button @click="backToMap">返回</el-button>
      <el-button type="primary" @click="createNew">新建{{ activeInfo.label }}</el-button>
    </div>
    <el-table
      :data="listData"
      border
      style="width: 100%;"
    >
      <el-table-column
        prop="name"
        :label="activeInfo.sortName"
        width="180"
      />
      <el-table-column
        prop="remarks"
        label="备注"
      />
      <el-table-column
        fixed="right"
        label="操作"
        width="100"
      >
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="editThis(scope.row)">编辑</el-button>
          <el-button type="text" size="small" @click="deleteThis(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <add-custom-dialog v-if="showAddDialog" :active-info="activeInfo" :show-add-dialog="showAddDialog" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import addCustomDialog from './addCustomDialog.vue'

@Component({
  name: 'CustomList',
  components: {
    addCustomDialog
  }
})
export default class CustomList extends Vue {
  @Prop({ default: [] }) private listData: any
  @Prop() private activeInfo: any

  private showAddDialog = false

  @Watch('activeTab', { immediate: true })
  private onActiveTabChange(val: string) {
    console.log('tets===>Watch', val)
  }

  private mounted() {
    // console.log('tets===>', this.activeTab)
  }

  private editThis(row: any) {

  }

  private deleteThis(row: any) {

  }

  private backToMap() {

  }

  private createNew() {
    this.showAddDialog = true
  }

  private closeThis() {
    this.showAddDialog = false
  }
}
</script>

<style lang="scss" scoped>
.device-list__right {
  .cutsom-point-list {
    &__btn {
      margin-top: 4px;
      margin-bottom: 20px;
    }
  }
}
</style>
