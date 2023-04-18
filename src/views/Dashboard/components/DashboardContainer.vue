<template>
  <div class="dashboard-container" :class="lessPadding ? 'less-padding' : ''">
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
  @Prop() private lessPadding?: boolean
}
</script>
<style lang="scss" scoped>
  .dashboard-container.less-padding {
    padding: 2.7vh 3vw 4vh;
  }

  .dashboard-container {
    position: relative;
    color: #fff;
    padding: 2.7vh 4vw 4vh;
    background: url('../images/box.png') no-repeat;
    background-size: 100% 100%;

    // Header
    &__header {
      background: linear-gradient(90deg, rgba(0, 46, 218, 0%), rgba(0, 46, 218, 100%) 50%, rgba(0, 46, 218, 0%) 100%);
      height: 4vh;
      line-height: 4vh;

      &__title {
        font-size: 1.2em;
        font-weight: bold;
        color: #fff;
        text-align: center;
      }

      &__slot {
        position: absolute;
        z-index: 100;
        top: 6.5vh;
        left: 5.5vh;
      }
    }

    // Body
    &__body {
      padding: 1vh 0.5em;
    }
  }

</style>
