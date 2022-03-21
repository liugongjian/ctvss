<!-- 截图 -->
<template>
  <div class="control__btn control__video-type">
    {{ types[type] }}
    <ul class="control__popup">
      <li
        v-for="(label, key) in types"
        :key="key"
        :class="{'selected': type === key}"
        @click.stop.prevent="changeType(key)"
      >
        {{ label }}
      </li>
    </ul>
  </div>
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
  }
}
</script>
<style lang="scss" scoped>
  .video-type .control__popup {
    width: 78px;
    left: -26px;
    text-align: center;
  }
</style>
