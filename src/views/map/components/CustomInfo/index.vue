<template>
  <div class="map-point">
    <base-info />
  </div>
</template>

<script  lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import BaseInfo from './BaseInfo.vue'

@Component({
  name: 'CustomInfo',
  components: {
    BaseInfo
  }
})
export default class CustomInfo extends Vue {

}
</script>

<style  lang="scss" scoped>
.map-point {
  ::v-deep .map-point-base-info {
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
        &__label {
          &:not(.is-bordered-label) {
            width: 60px;
            text-align: right;
          }
        }
      }
    }
  }
}

</style>
