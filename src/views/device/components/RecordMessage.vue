<template>
  <svg-icon class="record-message" :class="`record-message--${recordStatus}`" :name="iconName" @click.stop="clickEvent" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  name: 'RecordMessage'
})
export default class extends Vue {
  @Prop() private status!: number

  private get recordStatus() {
    let recordStatus = 'free'
    switch (this.status) {
      case 0:
        recordStatus = 'free'
        break
      case 1:
        recordStatus = 'working'
        break
      case 2:
        recordStatus = 'warning'
        break
      case 3:
        recordStatus = 'error'
        break
    }
    return recordStatus
  }

  private get iconName() {
    return this.recordStatus === 'warning' ? 'alarm2' : 'record'
  }

  private clickEvent() {
    this.$emit('click')
  }
}
</script>

<style lang="scss" scoped>
  .record-message {
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
      display: none;
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
