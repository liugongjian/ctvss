<template>
  <span>
    <i class="set-operate">
      <svg-icon
        name="more"
        width="16px"
        height="16px"
      />
      <ul class="controls__popup">
        <li
          v-for="operate in operateList"
          :key="operate.value"
          @click="setOperateValue(operate.value)"
        >
          {{ operate.label }}
        </li>
      </ul>
    </i>
  </span>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

@Component({
  name: 'OperateSelector'
})
export default class extends Vue {
  private operateList = [
    {
      label: '轮巡',
      value: 'polling'
    }, {
      label: '一键播放',
      value: 'autoPlay'
    }
  ]

  private setOperateValue(operateValue: string) {
    this.$emit('onSetOperateValue', operateValue)
  }
}
</script>
<style lang="scss" scoped>
  .set-operate {
    position: relative;
    padding: 4px;
    cursor: pointer;
    font-style: normal;
    .controls__popup {
      position: absolute;
      display: none;
      width: 105px;
      left: -80px;
      top: 25px;
      z-index: 10;
      background: #fff;
      border: 1px solid #ddd;
      list-style: none;
      margin: 0;
      padding: 0;
      border-radius: 4px;
      box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
      li {
        margin: 0;
        padding: 5px 15px;
        list-style: none;
        font-style: normal;
        color: $text;
        cursor: pointer;
        &:hover {
          background: #eee;
        }
        &.selected {
          color: $primary;
        }
        .status-badge {
          position: relative;
          top: 0;
          left: 0;
          width: 6px;
          height: 6px;
        }
        .status-badge--off {
          display: inline-block;
        }
      }
    }
    &:hover {
      .controls__popup {
        display: block;
      }
    }
  }
</style>
