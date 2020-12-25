<template>
  <div class="dashboard-container">
    <div class="dashboard-container__decorator--top" />
    <div class="dashboard-container__decorator--bottom" />
    <div class="dashboard-container__header">
      <div class="dashboard-container__header__slot">
        <slot name="header" />
      </div>
      <div class="dashboard-container__header__title">
        {{ title }}
      </div>
    </div>
    <div class="dashboard-container__body">
      <slot />
    </div>
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
  .dashboard-container {
    position: relative;
    border: 1px solid #3D536A;
    color: #fff;
    min-height: 100px;
    padding: 1rem;

    // Decorator
    &__decorator--top,
    &__decorator--bottom {
      position: absolute;
      left: -1px;
      width: 100%;
      &::before, &::after {
        position: absolute;
        display: block;
        content: ' ';
        width: 40px;
        height: 40px;
        border: 3px solid #516F8D;
      }
      &::before {
        left: -1px;
      }
      &::after {
        right: -1px;
      }
    }
    &__decorator--top {
      top: -1px;
      &::before {
        border-right: 0;
        border-bottom: 0;
      }
      &::after {
        right: -1px;
        border-left: 0;
        border-bottom: 0;
      }
    }
    &__decorator--bottom {
      bottom: -1px;
      &::before, &::after {
        bottom: -1px;
      }
      &::before {
        border-right: 0;
        border-top: 0;
      }
      &::after {
        right: -1px;
        border-left: 0;
        border-top: 0;
      }
    }

    // Header
    &__header {
      background: linear-gradient(90deg, rgba(128, 173, 212, 0), rgba(128, 173, 212, 1) 100%);
      height: 45px;
      line-height: 45px;
      border-left: 5px solid #7BB3E5;

      &__title {
        font-size: 1.2rem;
        color: #98CFFF;
        margin-left: 1rem;
      }
      &__slot {
        float: right;
        margin-right: 1rem;
      }
    }

    // Body
    &__body {
      padding: 1rem .5rem;
    }
  }

</style>
