<template>
  <svg-icon class="additional-status" :class="`additional-status--${additionalStatus}`" :name="iconName" @click.stop="clickEvent" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  name: 'AdditionalStatus'
})
export default class extends Vue {
  @Prop() private recordStatus!: number
  @Prop() private alarmInfo!: number
  @Prop() private isBind!: number

  private get additionalStatus() {
    let status = 'free'
    // 判断是否告警
    if (this.alarmInfo === 0) {
      // 判断是否录制中
      if (this.recordStatus === 1) {
        status = 'working'
      } else if (this.isBind === 1) {
        status = 'pause'
      } else {
        status = 'free'
      }
    } else {
      // 判断是否录像告警
      if (this.alarmInfo === 2) {
        status = 'error'
      } else {
        status = 'warning'
      }
    }
    return status
  }

  private get iconName() {
    return this.additionalStatus === 'warning' ? 'alarm2' : 'record'
  }

  private clickEvent() {
    this.$emit('click')
  }
}
</script>

<style lang="scss" scoped>
  .additional-status {
    display: inline-block;
    width: 6px;
    height: 6px;
    vertical-align: middle;
    margin-right: 5px;
    opacity: 0.7;

    &:hover {
      opacity: 1;
    }

    &--free {
      display: none !important;
    }

    &--pause {
      color: $textGrey !important;
    }

    &--working {
      color: $success !important;
    }

    &--warning,
    &--error {
      color: $red !important;
    }
  }
</style>
