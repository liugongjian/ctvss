<template>
  <div class="ai-attributes">
    <info-list label-width="100" title="人体属性">
      <info-list-item v-for="(attr,index) in currentAttributes" :key="index" :label="attr.Name">{{ attr.Score }}</info-list-item>
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
    immediate: true,
    deep: true
  })
  private onImgChanged() {
    debugger
    this.showAttribute()
  }

  @Watch('attributesIndex', {
    immediate: true,
    deep: true
  })
  private onAttributesIndexChanged() {
    this.showAttribute()
  }

  private showAttribute() {
    console.log('this.img.attributesLabel:', JSON.parse(this.img.attributesLabel[this.attributesIndex]))
    if (this.img && this.img.attributesLabel && this.attributesIndex > -1) {
      this.currentAttributes = JSON.parse(this.img.attributesLabel[this.attributesIndex])
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
  .info-list{
    margin-top:146px;
  }
</style>
