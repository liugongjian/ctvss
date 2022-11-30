<template>
  <div class="ai-attributes">
    <info-list label-width="100" title="人体属性">
      <info-list-item v-for="attribute in currentAttributes" :key="attribute.key" :label="aiAttribute[attribute.key]">{{ attribute.value }}</info-list-item>
    </info-list>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { AiAttribute } from '@vss/ai/dics/contants'

@Component({
  name: 'DashboardAIAttributes'
})
export default class extends Vue {
  @Prop()
  private img!: any
  @Prop()
  private type!: string
  @Prop({
    default: () => {
      return -1
    }
  })
  private attributesIndex!: number
  private currentAttributes: any = null
  private aiAttribute = AiAttribute

  @Watch('img', {
    immediate: true
  })
  private onImgChanged() {
    this.showAttribute()
  }

  @Watch('attributesIndex', {
    immediate: true
  })
  private onAttributesIndexChanged() {
    this.showAttribute()
  }

  private showAttribute() {
    if (this.img && this.img.locations && this.attributesIndex > -1) {
      this.currentAttributes = this.img.locations[this.attributesIndex].attributes
    }
  }
}
</script>
<style lang="scss" scoped>
  .ai-attributes {
    ::v-deep .info-list {
      .info-item {
        padding: 8px 0;
      }
    }
  }
</style>
