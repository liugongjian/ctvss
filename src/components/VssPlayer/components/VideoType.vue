<!-- 截图 -->
<template>
  <div class="controls__btn controls__video-type">
    {{ types[type] }}
    <ul class="controls__popup">
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
  name: 'VideoType'
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
    this.$emit('change', type)
  }
}
</script>
<style lang="scss" scoped>
  .video-type .controls__popup {
    width: 78px;
    left: -26px;
    text-align: center;
  }
</style>
