<template>
  <div class="status-badge" :class="`status-badge--${status}`" />
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
    background-color: #ccc;

    &--on {
      background-color: $success;
    }

    &--warning {
      background-color: $primary;
    }

    &--red,
    &--failed,
    &--error {
      background-color: #ccc;
    }
  }
</style>
