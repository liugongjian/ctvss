<template>
  <div class="app-container">
    <el-card>
      <div class="title">
        <div class="title-block" />
        <div>已开通计费项</div>
      </div>
      <el-descriptions label-class-name="desc-label" content-class-name="desc-content" :column="1" border>
        <el-descriptions-item>
          <template slot="label">
            设备
          </template>
          设备管理费
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            带宽
          </template>
          <div class="desc-button">
            <div>
              <div>上行带宽</div>
              <div>下行带宽</div>
            </div>
            <div><el-button type="text" @click="changeChargeType">变更带宽计费类型</el-button></div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            存储
          </template>
          <div>
            <div>视频存储费</div>
            <div>视频存储费</div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            AI服务
          </template>
          AI服务费
        </el-descriptions-item>
      </el-descriptions>
      <div class="title">
        <div class="title-block" />
        <div>历史记录</div>
      </div>
      <el-table
        :data="tableData"
        style="width: 100%;"
      >
        <el-table-column
          prop="date"
          label="计费模式变更"
        >
        </el-table-column>
        <el-table-column
          prop="name"
          label="变更时间"
        >
        </el-table-column>
        <el-table-column
          prop="address"
          label="生效时间"
        >
        </el-table-column>
      </el-table>
    </el-card>
    <dialogue :visible.sync="dialogueVisible" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Dialogue  from './component/Dialogue.vue'


@Component({
  name: 'OnDemand',
  components: {
    Dialogue
  }
})

export default class extends Vue {
  private dialogueVisible = false
  private tableData = [{
    date: '1',
    name: '2',
    address: '3'
  }]

  private changeChargeType(){
    this.dialogueVisible = true
  }
}
</script>
<style lang="scss" scoped>
.el-card {
  padding: 0 20px;
  min-height: 88vh;

  ::v-deep &__body {
    padding: 0 !important;
  }

  ::v-deep .desc-label {
    width: 150px;
    text-align: right;
    padding-right: 20px;
  }

  ::v-deep .desc-content {
    padding-left: 20px;
    line-height: 30px;
  }

  .desc-button {
    display: flex;
    justify-content: space-between;
  }

  .title {
    margin-top: 23px;
    display: flex;
    margin-bottom: 16px;

    .title-block {
      width: 4px;
      height: 14px;
      background-color: $primary;
      border: none;
      margin-top: 2px;
      margin-right: 12px;
      display: inline-block;

      & ~ div {
        font-size: 14px;
        color: #333;
        line-height: 20px;
        font-weight: 500;
      }
    }
  }
}
</style>
