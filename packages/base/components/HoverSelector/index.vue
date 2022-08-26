<template>
  <div>
    <div class="tooltip-wrapper" @click.stop>
      <slot name="tooltipBase" />
      <div class="pop-tooltip tree-node-popover el-tooltip__popper">
        <div class="tooltip-content">
          <slot name="tooltipContent" />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'HoverSelector'
})
export default class extends Vue {
}
</script>
<style lang="scss" scoped>
  .tooltip-wrapper {
    display: inline-block;
    margin-left: -0.4em;

    &:hover {
      .pop-tooltip {
        display: block;
      }
    }
  }

  .pop-tooltip {
    display: none;
    position: absolute;
    z-index: 2019;
    top: 14px;
    right: 0;
    background: $color-white;
  }

  .tree-node-popover {
    border: 1px solid $border-color-light-1 !important;
    box-shadow: $shadow-card;
    min-width: 0;
    padding: 0;
    margin: 0.3em 0 0 !important;

    .tooltip-content {
      display: flex;
      flex-direction: column;

      .el-button {
        margin: 0;
        padding: 0.8em 1.2em;
        color: $text-color-light-1;

        &:hover {
          background: $color-master-7;
        }
      }
    }
  }
</style>
