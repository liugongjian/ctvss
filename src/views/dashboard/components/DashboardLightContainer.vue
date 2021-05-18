<template>
  <div class="dashboard-wrap-overview__item">
    <el-card class="dashboard-wrap-overview__item__card">
      <div slot="header">
        <span>{{ title }}</span>
        <slot name="header" />
      </div>
      <slot />
    </el-card>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  name: 'DashboardContainer'
})
export default class extends Vue {
  @Prop() private title?: string
}
</script>

<style lang="scss" scoped>
  .el-card {
    ::v-deep {
      .el-card__header {
        padding: 0;
        font-weight: 600;
        font-size: 14px;
        line-height: 40px;
        margin: 5px 20px 0 20px;
        border-bottom: 2px solid #DFE4ED
      }
      .el-card__body {
        padding: 15px 18px;
        height: auto;
      }
    }
  }
  .dashboard-wrap-overview__tab-pane {
    .el-card {
      ::v-deep {
        .el-card__body {
          padding-top: 5px;
        }
        .el-tabs__item {
          font-weight: bold;
        }
      }
    }
  }
</style>
