<!-- 截图 -->
<template>
  <el-popover
    placement="top"
    trigger="hover"
    popper-class="player__popover"
    @after-enter="enterPopover"
    @after-leave="leavePopover"
  >
    <ul class="player__popover__panel">
      <li
        v-for="(label, key) in types"
        :key="key"
        :class="{ 'selected': type === key }"
        @click.stop.prevent="changeType(key)"
      >
        {{ label }}
      </li>
    </ul>
    <div slot="reference" class="control__btn control__video-type">
      <span class="label">{{ types[type] }}</span>
    </div>
  </el-popover>
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'TypeSelector'
})
export default class extends ComponentMixin {
  @Prop()
  private type: string

  private types = {
    'flv': 'FLV',
    'rtc': 'RTC'
  }

  /**
   * 切换视频格式
   */
  private changeType(type: string) {
    this.$emit('dispatch', {
      eventType: 'typeChange',
      payload: type
    })
    this.$emit('dispatch', {
      eventType: 'enableZoom'
    })
  }
}
</script>
