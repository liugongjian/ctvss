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
        <div class="alert-header__level" :class="`alert-header__level--${alertIcon[alertItem.level]}`">
          <svg-icon :name="alertIcon[alertItem.level]" />
          {{ alertLevel[alertItem.level] }}
        </div>
        <div class="alert-header__type">{{ alertType[alertItem.type] }}</div>
        <div class="alert-header__datetime">{{ alertItem.datetime }}</div>
      </div>
      <div class="alert-body">
        <div class="alert-body__video">
          <video />
        </div>
        <div class="alert-body__image">
          <div class="alert-body__image__decorator--top" />
          <div class="alert-body__image__decorator--bottom" />
          <div class="alert-body__image__wrap">
            <img ref="img" :src="alertItem.img" @load="onload">
            <div
              v-for="(location, locationIndex) in alertItem.locations"
              :key="locationIndex"
              class="alert-body__image__mask"
              :class="{'alert-body__image__mask--warning': location.isMask}"
              :style="`top:${location.clientTopPercent}%; left:${location.clientLeftPercent}%; width:${location.clientWidthPercent}%; height:${location.clientHeightPercent}%;`"
            />
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { AlertType, AlertLevel, AlertIcon } from '@/dics'

@Component({
  name: 'AlertBoardDetailDialog'
})
export default class extends Vue {
  @Prop() private alertId: any
  @Prop() private theme: any
  private alertType = AlertType
  private alertLevel = AlertLevel
  private alertIcon = AlertIcon

  private dialogVisible = true
  private alertItem = {
    id: 1,
    level: 'serious',
    type: 2,
    datetime: '2020-12-23 13:32:40',
    img: 'https://ai.ctyun.cn/static/frontend/imgs/electronic/178_1.jpg',
    locations: [
      {
        top: 40,
        left: 20,
        width: 100,
        height: 100,
        isMask: false
      },
      {
        top: 60,
        left: 60,
        width: 100,
        height: 100,
        isMask: true
      }
    ]
  }

  private onload() {
    const img: any = this.$refs.img
    const locations: any = this.alertItem.locations.map((location: any) => {
      location.ratio = img.clientWidth / img.naturalWidth
      location.clientTopPercent = location.top * location.ratio / img.clientHeight * 100
      location.clientLeftPercent = location.left * location.ratio / img.clientWidth * 100
      location.clientWidthPercent = location.width * location.ratio / img.clientWidth * 100
      location.clientHeightPercent = location.height * location.ratio / img.clientHeight * 100
      return location
    })
    this.$set(this.alertItem, 'locations', locations)
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
    width: 100%;

    &__level {
      &--warning {
        color: #F4C46C;
      }
      &--alert {
        color: #E56161;
      }
      margin-right: 10px;
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

    &__video {
      flex: 1;
    }
    &__image {
      flex: 1;
      position: relative;
      border: 1px solid #516F8D;
      border-left: 5px solid #648fb9;
      border-right: 5px solid #648fb9;
      padding: 20px;
      &__wrap {
        position: relative;
      }
      &__mask {
        position: absolute;
        border: 2px solid $dashboardGreen;
        &--warning {
          border-color: $red;
        }
      }
      // Decorator
      &__decorator--top,
      &__decorator--bottom {
        position: absolute;
        width: 100%;
        left: 0;
        &::before, &::after {
          position: absolute;
          display: block;
          content: ' ';
          width: 10px;
          border-top: 7px solid #648fb9;
        }
        &::before {
          left: 0;
        }
        &::after {
          right: 0;
        }
      }
      &__decorator--top {
        top: 0px;
      }
      &__decorator--bottom {
        bottom: 7px;
      }
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
