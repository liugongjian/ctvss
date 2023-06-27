<template>
  <div>
    <div
      v-for="(location, locationIndex) in detectBoxes"
      :key="locationIndex"
    >
      <div
        class="ai-recognation__images__item__mask"
        :class="[{ 'ai-recognation__images__item__clickable': clickable, 'ai-recognation__images__item__mask--selected': currentIndex === locationIndex }]"
        :style="`top:${location.clientTopPercent}%; left:${location.clientLeftPercent}%; width:${location.clientWidthPercent}%; height:${location.clientHeightPercent}%;`"
        @click="clickLocation(locationIndex)"
      >
        <div class="ai-recognation__images__item__mask__text">
          {{ location.boxLabel }}
        </div>
      </div>
    </div>
    <div v-if="img.detectArea.length > 0" class="ai-recognation__images__item__mask--zone">
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" :viewBox="`0 0 ${ratio.imgNaturalWidth} ${ratio.imgNaturalHeight}`" style="enable-background: new 0 0 100 50.5;" xml:space="preserve">
        <polygon :points="detectArea" />
      </svg>
    </div>
    <div v-if="imageLabel.length > 0" class="ai-recognation__images__item__count">
      <span>
        {{ imageLabel }}
      </span>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { AnimalType, AiMaskType } from '@vss/ai/dics/contants'

@Component({
  name: 'DashboardAILocation'
})
export default class extends Vue {
  @Prop()
  private img!: any
  @Prop()
  private ratio!: any
  @Prop()
  private clickable?: boolean
  private aiMaskType = AiMaskType
  private animalType = AnimalType
  private currentIndex = -1
  private detectBoxes = []

  private detectArea = ''

  private imageLabel = ''

  private mounted(){
    this.getDetectBoxes(this.img)
    this.getImageLabel(this.img)
    this.getDetectArea(this.img)
    window.addEventListener('resize', ()=>this.getDetectBoxes(this.img))
  }

  private clickLocation(locationIndex: number) {
    if (!this.clickable) return
    this.currentIndex = locationIndex
    this.$emit('click-location', locationIndex)
  }

  private getImageLabel(img){
    Object.keys(img.imageLabel).forEach(k => { this.imageLabel = k + ':' + img.imageLabel[k] + '\n' })
  }


  private getDetectArea(img){
      let zoneSvg = ''
      const zoneBoxes = img.detectArea.map((point: number, index: number) => {
        if (index % 2) {
          return point * this.ratio.imgNaturalHeight / 100
        } else {
          return point * this.ratio.imgNaturalWidth / 100
        }
      })
      for (let i = 0; i < zoneBoxes.length; i += 2) {
        const sub = zoneBoxes.slice(i, i + 2)
        zoneSvg += (sub.join(',') + ' ')
      }
      this.detectArea = zoneSvg
  }

    // 处理DetectBoxes数据
  private getDetectBoxes(img){
    if (img.detectBoxes && img.detectBoxes.length > 0){
      const detectBoxes = []
       for (let i = 0; i < img.detectBoxes.length; i += 4) {
        const info = img.boxLabels[i / 4].info
        let infoStr = ''
        Object.keys(info).forEach(o => { infoStr = o + ':' + info[o] + '\n' })
        detectBoxes.push({
          top: img.detectBoxes[i + 1],
          left: img.detectBoxes[i],
          width: img.detectBoxes[i + 2],
          height: img.detectBoxes[i + 3],
          boxLabel: infoStr
        })
       }
       this.detectBoxes = detectBoxes.map(box => {
          const location = {
            clientTopPercent: box.top * this.ratio.ratioH / this.ratio.clientHeight * 100,
            clientLeftPercent: box.left * this.ratio.ratioW / this.ratio.clientWidth * 100,
            clientWidthPercent: box.width * this.ratio.ratioW / this.ratio.clientWidth * 100,
            clientHeightPercent: box.height * this.ratio.ratioH / this.ratio.clientHeight * 100
          }
          if (location.clientTopPercent + location.clientHeightPercent >= 100) {
            location.clientHeightPercent = 100 - location.clientTopPercent
          }
          if (location.clientWidthPercent + location.clientLeftPercent >= 100) {
            location.clientWidthPercent = 100 - location.clientLeftPercent
          }
          return { ...box, ...location }
       })
    }
  }
}
</script>
<style lang="scss" scoped>
  .dustbin {
    line-height: 100%;
    word-break: break-all !important;
    top: -1px;
    bottom: auto !important;
  }

  .orange {
    border: 2px solid $primary !important;
  }

  .ai-recognation__images__item {
    &__clickable {
      cursor: pointer;
    }

    &__mask {
      position: absolute;
      border: 2px solid $dashboardGreen;
      z-index: 1;

      &--warning {
        border-color: $red;
      }

      &--zone {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;

        svg {
          width: 100%;
          height: 100%;

          polygon {
            fill: none;
            stroke: #6bd174;
            stroke-width: 16px;
          }
        }
      }
      // 冲压机
      &--11 {
        border-width: 4px;
      }

      &__text {
        position: absolute;
        display: block;
        font-size: 11px;
        background: $dashboardGreen;
        color: #000;
        word-break: keep-all;
        bottom: -18px;
        left: -2px;
        padding: 2px;
        opacity: 0.8;

        &--warning {
          background: $white;
          white-space: nowrap;
        }

        &--top {
          top: -19px !important;
          bottom: auto;
        }

        &--left {
          right: -2px !important;
          left: auto;
        }
      }

      &--selected {
        border-color: $primary;
      }
    }

    &__count {
      position: absolute;
      top: 3px;
      left: 0;
      background: rgba(0, 0, 0, 60%);
      color: #fff;
      font-size: 11px;
      padding: 5px;

      &--warning {
        background: $red;
      }
    }
  }
</style>
