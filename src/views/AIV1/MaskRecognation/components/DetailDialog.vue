<template>
  <el-dialog
    title="告警详情"
    :custom-class="theme"
    :visible="dialogVisible"
    :close-on-click-modal="true"
    width="70%"
    center
    @close="closeDialog"
  >
    <div class="alert" :class="theme">
      <div class="alert-header">
        <div class="alert-header__level" :class="`alert-header__level--${alertItem.level}`">
          <svg-icon :name="alertItem.level" />
          {{ typeDic[alertItem.level] }}
        </div>
        <div class="alert-header__type">{{ alertItem.type }}</div>
        <div class="alert-header__datetime">{{ alertItem.datetime }}</div>
      </div>
      <div class="alert-body">
        <div class="alert-body__item">
          <img src="https://ai.ctyun.cn/static/frontend/imgs/electronic/178_1.jpg">
        </div>
        <div class="alert-body__item">
          <img src="https://ai.ctyun.cn/static/frontend/imgs/electronic/178_1.jpg">
        </div>
        <div class="alert-body__item">
          <img src="https://ai.ctyun.cn/static/frontend/imgs/electronic/178_1.jpg">
        </div>
        <div class="alert-body__item">
          <img src="https://ai.ctyun.cn/static/frontend/imgs/electronic/178_1.jpg">
        </div>
        <div class="alert-body__item">
          <img src="https://ai.ctyun.cn/static/frontend/imgs/electronic/178_1.jpg">
        </div>
        <div class="alert-body__item">
          <img src="https://ai.ctyun.cn/static/frontend/imgs/electronic/178_1.jpg">
        </div>
        <div class="alert-body__item">
          <img src="https://ai.ctyun.cn/static/frontend/imgs/electronic/178_1.jpg">
        </div>
        <div class="alert-body__item">
          <img src="https://ai.ctyun.cn/static/frontend/imgs/electronic/178_1.jpg">
        </div>
        <div class="alert-body__item">
          <img src="https://ai.ctyun.cn/static/frontend/imgs/electronic/178_1.jpg">
        </div>
        <div class="alert-body__item">
          <img src="https://ai.ctyun.cn/static/frontend/imgs/electronic/178_1.jpg">
        </div>
        <div class="alert-body__item">
          <img src="https://ai.ctyun.cn/static/frontend/imgs/electronic/178_1.jpg">
        </div>
        <div class="alert-body__item">
          <img src="https://ai.ctyun.cn/static/frontend/imgs/electronic/178_1.jpg">
        </div>
        <div class="alert-body__item">
          <img src="https://ai.ctyun.cn/static/frontend/imgs/electronic/178_1.jpg">
        </div>
        <div class="alert-body__item">
          <img src="https://ai.ctyun.cn/static/frontend/imgs/electronic/178_1.jpg">
        </div>
        <div class="alert-body__item">
          <img src="https://ai.ctyun.cn/static/frontend/imgs/electronic/178_1.jpg">
        </div>
        <div class="alert-body__item">
          <img src="https://ai.ctyun.cn/static/frontend/imgs/electronic/178_1.jpg">
        </div>
        <div class="alert-body__item">
          <img src="https://ai.ctyun.cn/static/frontend/imgs/electronic/178_1.jpg">
        </div>
        <div class="alert-body__item">
          <img src="https://ai.ctyun.cn/static/frontend/imgs/electronic/178_1.jpg">
        </div>
        <div class="alert-body__item">
          <img src="https://ai.ctyun.cn/static/frontend/imgs/electronic/178_1.jpg">
        </div>
        <div class="alert-body__item">
          <img src="https://ai.ctyun.cn/static/frontend/imgs/electronic/178_1.jpg">
        </div>
        <div class="alert-body__item">
          <img src="https://ai.ctyun.cn/static/frontend/imgs/electronic/178_1.jpg">
        </div>
        <div class="alert-body__item">
          <img src="https://ai.ctyun.cn/static/frontend/imgs/electronic/178_1.jpg">
        </div>
        <div class="alert-body__item">
          <img src="https://ai.ctyun.cn/static/frontend/imgs/electronic/178_1.jpg">
        </div>
        <div class="alert-body__item">
          <img src="https://ai.ctyun.cn/static/frontend/imgs/electronic/178_1.jpg">
        </div>
        <div class="alert-body__item">
          <img src="https://ai.ctyun.cn/static/frontend/imgs/electronic/178_1.jpg">
        </div>
        <div class="alert-body__item">
          <img src="https://ai.ctyun.cn/static/frontend/imgs/electronic/178_1.jpg">
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({
  name: 'AlertBoardDetailDialog'
})
export default class extends Vue {
  @Prop() private alertId: any
  @Prop() private theme: any

  private dialogVisible = true
  private typeDic = {
    warning: '一般警告',
    alert: '严重警告'
  }
  private alertItem = {
    id: 1,
    level: 'warning',
    type: '未带口罩',
    datetime: '2020-12-23 13:32:40'
  }

  private closeDialog(isRefresh: boolean = false) {
    this.dialogVisible = false
    this.$emit('on-close', isRefresh)
  }
}
</script>
<style lang="scss" scoped>
  .alert-header {
    display: flex;
    width: 400px;
    margin: 0 auto;

    &__level {
      width: 30%;
      &--warning {
        color: #F4C46C;
      }
      &--alert {
        color: #E56161;
      }
    }
    &__datetime {
      flex: 1;
      text-align: right;
    }
  }

  .alert-body {
    display: flex;
    flex-wrap: wrap;
    border-top: 1px solid $borderGrey;
    margin-top: 15px;
    padding-top: 15px;
    max-height: 60vh;
    overflow: auto;

    &__item {
      margin: 15px;
      flex: 1 0 200px;
      img {
        width: 100%;
      }
    }
  }

  .dashboard-alert-live-dialog {
    .alert-body {
      border-top: 1px solid #6086a6;
    }
  }
</style>
