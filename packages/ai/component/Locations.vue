<template>
  <div>
    <div
      v-for="(location, locationIndex) in img && img.locations"
      :key="locationIndex"
    >
      <div
        v-if="!location.zone"
        class="ai-recognation__images__item__mask"
        :class="[{ 'ai-recognation__images__item__mask--warning': location.isWarning, 'ai-recognation__images__item__clickable': clickable, 'ai-recognation__images__item__mask--selected': currentIndex === locationIndex, 'orange': location.isNoReflective }, `ai-recognation__images__item__mask--${type}`]"
        :style="`top:${location.clientTopPercent}%; left:${location.clientLeftPercent}%; width:${location.clientWidthPercent}%; height:${location.clientHeightPercent}%;`"
        @click="clickLocation(locationIndex)"
      >
        <div v-if="['4', '10001', '34', '10034','19','10016'].includes(type) && !!location.score" class="ai-recognation__images__item__mask__text" :class="{ 'ai-recognation__images__item__mask__text--warning': location.isWarning }">
          置信度:{{ location.score }}%<br>
          <span v-if="['4', '10001', '34', '10034','19','10016'].includes(type)">姓名:{{ location.name }}</span>
        </div>
        <div
          v-if="['29', '10026', '35', '10035'].includes(type) || (!isIndustrialDetection && ['37', '10037'].includes(type))"
          class="ai-recognation__images__item__mask__text dustbin"
          :class="{ 'ai-recognation__images__item__mask__text--warning': location.isWarning }"
        >
          {{ location.label }}
        </div>
        <div v-if="type === '17'|| type === '10014'" class="ai-recognation__images__item__mask__text" :class="{ 'ai-recognation__images__item__mask__text--warning': location.isWarning, 'ai-recognation__images__item__mask__text--top': location.clientTopPercent + location.clientHeightPercent > 80, 'ai-recognation__images__item__mask__text--left': location.clientLeftPercent + location.clientWidthPercent> 80 }">
          {{ location.text }}
        </div>
      </div>
      <div v-else class="ai-recognation__images__item__mask--zone">
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" :viewBox="`0 0 ${location.imgNaturalWidth} ${location.imgNaturalHeight}`" style="enable-background: new 0 0 100 50.5;" xml:space="preserve">
          <polygon :points="location.zoneSvg" />
        </svg>
      </div>
    </div>
    <div v-if="img.locations && img.locations.info" class="ai-recognation__images__item__count">
      <span v-for="(item,index) in img.locations.info" v-if="item" :key="index">
        {{ item }}
      </span>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { AnimalType, AiMaskType } from '@vss/ai/dics/contants'
import { UserModule } from '@/store/modules/user'

@Component({
  name: 'DashboardAILocation'
})
export default class extends Vue {
  @Prop()
  private img!: any
  @Prop()
  private type!: string
  @Prop()
  private clickable?: boolean
  private aiMaskType = AiMaskType
  private animalType = AnimalType
  private currentIndex = -1

  public get isIndustrialDetection() {
    return UserModule.tags && UserModule.tags.isIndustrialDetection && UserModule.tags.isIndustrialDetection === 'Y'
  }

  @Watch('img', {
    immediate: true
  })
  private onImgChanged(img: any) {
    // 默认选取人体属性的第一个位置
    if ((this.type === '12' || this.type === '10009') && this.clickable && img && img.locations && img.locations.length) {
      this.currentIndex = 0
      this.clickLocation(this.currentIndex)
    }
  }

  private clickLocation(locationIndex: number) {
    if (!this.clickable) return
    this.currentIndex = locationIndex
    this.$emit('click-location', locationIndex)
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
        bottom: -32px;
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
