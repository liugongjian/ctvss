<template>
  <div v-if="status" class="status-badge" :class="`status-badge--${status}`" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  name: 'StatusBadge'
})
export default class extends Vue {
  @Prop() private status!: string
}
</script>

<style lang="scss" scoped>
  .status-badge {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 100px;
    vertical-align: middle;
    margin-right: 5px;
    background-color: $color-table-status-info;

    &--on {
      background-color: $color-table-status-success;
    }

    &--warning {
      background-color: $color-table-status-warning;
    }

    &--red,
    &--failed,
    &--error {
      background-color: $color-table-status-info;
    }
  }
</style>
