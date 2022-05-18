<template>
  <div class="cutsom-point-list">
    <div class="cutsom-point-list__btn">
      <el-button @click="backToMap">返回</el-button>
      <el-button type="primary" @click="createNew">新建{{ activeInfo.label }}</el-button>
    </div>
    <el-table
      :data="thisTabData.tags||[]"
      border
      style="width: 100%;"
      class="cutsom-point-list__table"
    >
      <el-table-column
        prop="tagName"
        :label="activeInfo.sortName"
        width="180"
      />
      <el-table-column
        prop="description"
        label="备注"
      />
      <el-table-column
        fixed="right"
        label="操作"
        width="100"
      >
        <template slot-scope="scope">
          <el-button type="text" class="cutsom-point-list__edit" @click="editThis(scope.row)">编辑</el-button>
          <el-popconfirm
            title="确定删除此条数据吗？"
            @confirm="deleteThis(scope.row)"
          >
            <el-button slot="reference" type="text">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      :total="thisTabData.totalNum"
      :page-size="20"
      :hide-on-single-page="true"
      @current-change="freshList"
    />
    <add-custom-dialog
      v-if="showAddDialog"
      :active-info="activeInfo"
      :show-add-dialog="showAddDialog"
      :custom-point-info="customPointInfo"
      :is-updated="isUpdated"
      :edit-data="editData"
      :point-data="pointData"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import addCustomDialog from './addCustomDialog.vue'
import { delInterestPoint, getInterestPoint } from '@/api/map'

@Component({
  name: 'CustomList',
  components: {
    addCustomDialog
  }
})
export default class CustomList extends Vue {
  @Prop({ default: {} }) private listData: any
  @Prop() private activeInfo: any
  @Prop() private activeTab: string
  @Prop() private customPointInfo: any

  private thisTabData: any = []
  private showAddDialog = false
  private editData: any = {}
  private isUpdated = false
  private pointData: any = {}

  @Watch('activeTab', { immediate: true })
  private onActiveTabChange() {
    this.drawList()
  }

  @Watch('listData')
  private onListDataChange() {
    this.drawList()
  }

  private mounted() {
    this.drawList()
  }

  private drawList() {
    this.$nextTick(() => {
      this.thisTabData = this.listData
    })
  }

  private editThis(row: any) {
    const { tagId } = row
    const param = { tagId }
    getInterestPoint(param).then((res) => {
      if (res && res.tagId) {
        this.showAddDialog = true
        this.editData = row
        this.pointData = res
        this.isUpdated = true
      }
    }).catch(err => {
      this.$message.error(`${err.message ? err.message : err}`)
    })
  }

  private deleteThis(row: any) {
    const { tagId } = row
    const param = { tagId }
    delInterestPoint(param).then(() => {
      this.freshList()
    })
  }

  private backToMap() {
    this.$emit('closePointMark')
  }

  private createNew() {
    this.showAddDialog = true
  }

  private closeThis() {
    this.showAddDialog = false
    this.isUpdated = false
  }

  private freshList(curPage: number = 1) {
    this.$emit('getPointsList', curPage)
    this.showAddDialog = false
    this.isUpdated = false
  }
}
</script>

<style lang="scss" scoped>
.device-list__right {
  .cutsom-point-list {
    &__table {
      max-height: calc(100vh - 300px);
      overflow-y: auto;
    }

    &__btn {
      margin-top: 4px;
      margin-bottom: 20px;
    }

    &__edit {
      margin-right: 10px;
    }
  }
}
</style>
