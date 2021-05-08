<template>
  <i v-if="streamSize && streamSize > 1" class="set-stream">
    <svg-icon
      name="branch"
      width="16px"
      height="16px"
    />
    <span v-if="isShowLabel">{{ streamName }}</span>
    <ul class="controls__popup">
      <li
        v-for="stream in subStreamList"
        :key="stream.value"
        :class="{'selected': stream.value === streamNum}"
        @click="setStreamNum(stream.value)"
      >
        {{ stream.label }}
      </li>
    </ul>
  </i>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({
  name: 'StreamSelector'
})
export default class extends Vue {
  @Prop({
    default: false
  })
  private isShowLabel?: boolean
  @Prop({
    default: 1
  })
  private streamSize?: number
  @Prop()
  private streamNum?: number
  private streamList = [
    {
      label: '主码流',
      value: 1
    }, {
      label: '第二码流',
      value: 2
    }, {
      label: '第三码流',
      value: 3
    }
  ]

  private get subStreamList() {
    return this.streamList.slice(0, this.streamSize)
  }

  private get streamName() {
    if (this.streamNum) {
      return this.streamList[this.streamNum - 1].label
    }
    return ''
  }

  private setStreamNum(streamNum: number) {
    this.$emit('onSetStreamNum', streamNum)
  }
}
</script>
<style lang="scss" scoped>
  .set-stream {
    position: relative;
    padding: 4px;
    cursor: pointer;
    font-style: normal;
    .controls__popup {
      position: absolute;
      display: none;
      width: 100px;
      left: -40px;
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
        text-align: center;
        color: $text;
        cursor: pointer;
        &:hover {
          background: #eee;
        }
        &.selected {
          color: $primary;
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
