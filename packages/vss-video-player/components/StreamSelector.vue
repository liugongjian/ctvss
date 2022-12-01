<!-- 码流选择 -->
<template>
  <el-popover
    placement="top"
    trigger="hover"
    popper-class="player__popover"
    @after-enter="enterPopover"
    @after-leave="leavePopover"
  >
    <ul class="player__popover__panel stream-selector__panel">
      <li
        v-for="(stream, index) in subStreamList"
        :key="index"
        :class="{ 'selected': stream.streamNum === streamNum }"
        @click.stop.prevent="setStreamNum(stream.streamNum)"
      >
        <status-badge v-if="stream.streamStatus" :status="stream.streamStatus" />
        {{ stream.label }}
      </li>
    </ul>
    <div v-show="streamSize > 1" slot="reference" class="control__btn control__stream-selector" :stream-num="streamNum">
      <svg-icon name="branch" />
    </div>
  </el-popover>
</template>
<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator'
import ComponentMixin from './mixin'
import StatusBadge from '@vss/base/components/StatusBadge/index.vue'
import { Stream, StreamInfo } from '../types/VssPlayer'

@Component({
  name: 'StreamSelector',
  components: {
    StatusBadge
  }
})
export default class extends ComponentMixin {
  @Prop()
  private streamInfo: StreamInfo
  private streamNum: number = null
  private streamList: Stream[] = [
    {
      label: '主码流',
      streamNum: 1,
      streamStatus: 'off'
    }, {
      label: '第二码流',
      streamNum: 2,
      streamStatus: 'off'
    }, {
      label: '第三码流',
      streamNum: 3,
      streamStatus: 'off'
    }
  ]

  private get streams(): Stream[] {
    return this.streamInfo ? this.streamInfo.streams : []
  }

  private get streamSize(): number {
    return this.streamInfo ? this.streamInfo.streamSize : 1
  }

  private get subStreamList(): Stream[] {
    return this.streamList.slice(0, this.streamSize)
  }

  @Watch('streamInfo', {
    immediate: true,
    deep: true
  })
  private onStreamsChanged(val: StreamInfo) {
    this.streamNum = val ? val.streamNum : 1
    this.streams && this.streams.forEach((stream: any) => {
      this.streamList[stream.streamNum - 1].streamStatus = stream.streamStatus
    })
  }

  /**
   * 设置当前视频流
   * @param streamNum 视频流类型
   */
  private setStreamNum(streamNum: number) {
    this.$emit('dispatch', {
      eventType: 'streamNumChange',
      payload: streamNum
    })
  }
}
</script>
<style lang="scss" scoped>
  .stream-selector__panel {
    li {
      text-align: left;
    }
  }

  .control__stream-selector {
    &:after {
      content: attr(stream-num);
      position: absolute;
      bottom: 3px;
      right: 2px;
      font-size: 12px;
      transform: scale(0.7);
    }
  }
</style>
