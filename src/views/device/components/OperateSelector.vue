<template>
  <el-popover
    ref="popover"
    placement="bottom-end"
    trigger="hover"
    :visible-arrow="false"
    :offset="0"
    transition=""
    :open-delay="200"
    popper-class="operate-selector-popover"
  >
    <ul class="controls__popup">
      <li
        v-for="operate in operateList"
        :key="operate.value"
        @click="setOperateValue(operate.value)"
      >
        {{ operate.label }}
      </li>
    </ul>
    <i slot="reference" class="set-operate">
      <svg-icon
        name="more"
        width="16px"
        height="16px"
      />
    </i>
  </el-popover>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  name: 'OperateSelector'
})
export default class extends Vue {
  @Prop()
  private isLive

  private operateList = [
    {
      label: '轮巡',
      value: 'polling'
    }, {
      label: '一键播放',
      value: 'autoPlay'
    }
  ]

  private mounted() {
    if (!this.isLive) this.operateList.shift()
  }

  private setOperateValue(operateValue: string) {
    const popover: any = this.$refs.popover
    popover.doClose()
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
    text-align: center;

    .svg-icon {
      margin: 0;
    }
  }

  .controls__popup {
    padding: 0;
    margin: 0;

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
    }
  }
</style>
