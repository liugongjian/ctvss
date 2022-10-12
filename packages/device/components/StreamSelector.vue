<template>
  <el-popover
    v-if="streamSize && streamSize > 1"
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
        v-for="stream in subStreamList"
        :key="stream.value"
        :class="{'selected': stream.value === streamNum}"
        @click="setStreamNum(stream.value)"
      >
        <status-badge v-if="stream.streamStatus" :status="stream.streamStatus" />
        {{ stream.label }}
      </li>
    </ul>
    <i slot="reference" class="set-stream">
      <svg-icon
        name="branch"
        width="16px"
        height="16px"
      />
      <span>{{ streamName }}</span>
    </i>
  </el-popover>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

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
  @Prop()
  private streams?: Array<any>
  private streamList = [
    {
      label: '主码流',
      value: 1,
      streamStatus: 'off'
    }, {
      label: '第二码流',
      value: 2,
      streamStatus: 'off'
    }, {
      label: '第三码流',
      value: 3,
      streamStatus: 'off'
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

  @Watch('streams', {
    immediate: true
  })
  private onStreamsChanged() {
    this.streams && this.streams.forEach((stream: any) => {
      this.streamList[stream.streamNum - 1].streamStatus = stream.streamStatus
    })
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

      .status-badge--off,
      .status-badge--on,
      .status-badge--failed {
        display: inline-block;
      }
    }
  }
</style>
