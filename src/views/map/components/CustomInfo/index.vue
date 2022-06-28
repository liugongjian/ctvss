<template>
  <div class="map-point">
    <component
      :is="showComponent"
      v-bind="$attrs"
      v-on="$listeners"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import PointInfo from './PointInfo.vue'
import MapInfo from './MapInfo.vue'
import Interest from './Interest.vue'
import Font from './Font.vue'
import Polygon from './Polygon.vue'

@Component({
  name: 'CustomInfo',
  components: {
    PointInfo,
    MapInfo,
    Interest,
    Font,
    'polygon-tool': Polygon
  }
})

export default class CustomInfo extends Vue {
  @Prop() private customInfoType: string
  private showComponent: string = ''

  private componentMap = {
    map: 'MapInfo',
    marker: 'PointInfo',
    polygon: 'polygon-tool',
    interest: 'Interest',
    font: 'Font'
  }

  private mounted() {
    this.showComponent = this.componentMap[this.customInfoType]
  }
}
</script>

<style lang="scss" scoped>
.map-point {
  ::v-deep .map-point-base-info {
    user-select: none;

    .el-descriptions {
      font-size: 14px;

      &__header {
        padding: 20px;
        border-bottom: 1px solid #d3d3d3;
      }

      &__title {
        font-weight: initial;
      }

      &__body {
        background: transparent;
        padding: 0 20px;
      }

      .el-descriptions-item {
        line-height: 30px;

        &__label {
          &:not(.is-bordered-label) {
            width: 66px;
            text-align: right;
          }
        }
      }
    }

    &__small-box {
      width: 134px;

      .el-input {
        width: 30%;
        margin-right: 5px;
      }
    }

    &__small {
      display: inline-block;
      width: 44px;
      height: 24px;
      margin-left: 10px;
    }

    &__textInfo {
      display: inline-block;
    }

    &__font {
      display: inline-block;
      vertical-align: middle;
      width: 24px;
      height: 24px;
      text-align: center;
      line-height: 24px;
      font-size: 16px;
      cursor: pointer;
    }

    &__font-weight {
      background: #d3d3d3;
      color: #333;
      font-weight: 500;
      cursor: pointer;
      border-radius: 2px;
      margin-left: 10px;
    }

    &__font-style {
      font-style: italic;
    }

    &__header {
      height: 38px;
      padding: 10px  20px;
      display: flex;
      background: #c7c7c7;
      opacity: 0.8;

      &__title {
        font-size: 16px;
        font-weight: 500;
      }

      &__icon {
        margin-left: auto;
      }
    }

    .vc-sketch {
      position: absolute;
      left: 12px;
      /* top: 70px; */
      z-index: 9;
    }

    &__color {
      display: inline-block;
      width: 18px;
      height: 18px;
      vertical-align: text-top;
      cursor: pointer;
    }

    .el-input .el-input__inner {
      height: 30px;
      border: 1px solid #d3d3d3;
      padding-left: 8px;
      background: #fff;
    }
  }
}

</style>
