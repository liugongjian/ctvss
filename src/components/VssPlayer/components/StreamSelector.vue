<!-- 码流选择 -->
<template>
  <div class="control__btn control__stream-selector" :stream-num="streamNum">
    <svg-icon
      name="branch"
      width="18px"
      height="18px"
    />
    <ul class="control__popup">
      <li
        v-for="stream in subStreamList"
        :key="stream.value"
        :class="{'selected': stream.value === streamNum}"
        @click.stop.prevent="setStreamNum(stream.value)"
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

@Component({
  name: 'StreamSelector',
  components: {
    StatusBadge
  }
})
export default class extends Vue {
  @Prop({
    default: 3
  })
  private streamSize?: number
  @Prop()
  private streams?: Array<any>
  private streamNum: number = 1
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
    return '主码流'
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
    this.streamNum = streamNum
    // this.$emit('onSetStreamNum', streamNum)
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
