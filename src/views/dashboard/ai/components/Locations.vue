<template>
  <div>
    <div
      v-for="(location, locationIndex) in img && img.locations"
      :key="locationIndex"
      class="ai-recognation__images__item__mask"
      :class="{'ai-recognation__images__item__mask--warning': location.isWarning, 'ai-recognation__images__item__mask--zone': location.isZone}"
      :style="`top:${location.clientTopPercent}%; left:${location.clientLeftPercent}%; width:${location.clientWidthPercent}%; height:${location.clientHeightPercent}%;`"
    >
      <div v-if="type === '6'" class="ai-recognation__images__item__mask__text" :class="{'ai-recognation__images__item__mask__text--warning': location.isWarning}">
        {{ aiMaskType[location.type] }}
      </div>
      <div v-if="type === '4'" class="ai-recognation__images__item__mask__text" :class="{'ai-recognation__images__item__mask__text--warning': location.isWarning}">
        匹配度:{{ location.score }}%
      </div>
      <!-- <div v-if="type === '3'" class="ai-recognation__images__item__mask__text ai-recognation__images__item__mask__text--warning">
        {{ location.label }}
      </div> -->
    </div>
    <div v-if="type === '8' && img" class="ai-recognation__images__item__count" :class="{'ai-recognation__images__item__count--warning': img && img.locations && img.locations.length > 10}">聚集人数: {{ img && img.locations && img.locations.length || '-' }}</div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({
  name: 'DashboardAILocation'
})
export default class extends Vue {
  @Prop()
  private img!: any
  @Prop()
  private type!: string
}
</script>
<style lang="scss" scoped>
  .ai-recognation__images__item {
    &__mask {
      position: absolute;
      border: 2px solid $dashboardGreen;
      &--warning {
        border-color: $red;
      }
      &--zone {
        border-color: #f3ef7c;
      }
      &__text {
        position: absolute;
        display: block;
        font-size: 11px;
        background: $dashboardGreen;
        color: #000;
        word-break: keep-all;
        bottom: -19px;
        left: -2px;
        padding: 2px;
        opacity: 0.8;
        &--warning {
          background: $white;
        }
      }
    }
  }
</style>
