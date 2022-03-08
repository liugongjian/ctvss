<!-- 码流选择 -->
<template>
  <div v-if="streamSize > 1" class="control__btn control__stream-selector" :stream-num="streamNum">
    <svg-icon
      name="branch"
      width="18px"
      height="18px"
    />
    <ul class="control__popup">
      <li
        v-for="(stream, index) in subStreamList"
        :key="index"
        :class="{'selected': stream.streamNum === streamNum}"
        @click.stop.prevent="setStreamNum(stream.streamNum)"
      >
        <status-badge v-if="stream.streamStatus" :status="stream.streamStatus" />
        {{ stream.label }}
      </li>
    </ul>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import StatusBadge from '@/components/StatusBadge/index.vue'
import { Stream, StreamInfo } from '@/components/VssPlayer/models/VssPlayer.d'

@Component({
  name: 'StreamSelector',
  components: {
    StatusBadge
  }
})
export default class extends Vue {
  @Prop()
  private streamInfo: StreamInfo
  private streamNum: number
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
    return this.streamInfo ? this.streamInfo.streamSize : 3
  }

  private get subStreamList(): Stream[] {
    return this.streamList.slice(0, this.streamSize)
  }

  @Watch('streamInfo', {
    immediate: true
  })
  private onStreamsChanged(val: StreamInfo) {
    this.streamNum = val ? val.streamNum : 1
    this.streams && this.streams.forEach((stream: any) => {
      this.streamList[stream.streamNum - 1].streamStatus = stream.streamStatus
    })
  }

  /**
   * 设置当前视频流
   * @streamNum 视频流类型
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
  .control__stream-selector {
    .control__popup {
      width: 95px;
      left: -36px;
      text-align: center;
    }

    &:after {
      content: attr(stream-num);
      position: absolute;
      bottom: 3px;
      right: 2px;
    }
  }
</style>
