<template>
  <hover-selector v-if="streamSize && streamSize > 1">
    <template slot="tooltipBase">
      <el-button type="text"><svg-icon name="branch" /></el-button>
    </template>
    <template slot="tooltipContent">
      <el-button
        v-for="stream in subStreamList"
        :key="stream.value"
        size="mini"
        type="text"
        :class="{ 'selected': stream.value === streamNum }"
        @click.stop="setStreamNum(stream.value)"
      >
        <status-badge v-if="stream.streamStatus" :status="stream.streamStatus" />
        {{ stream.label }}
      </el-button>
    </template>
  </hover-selector>
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
  .el-button {
    &.selected {
      color: $primary;
    }
  }
</style>
