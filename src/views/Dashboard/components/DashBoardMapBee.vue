<template>
  <div class="dashborad-map-bee">
    <img :src="bg">
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
@Component({
  name: 'DashboardMap'
})
export default class extends Vue {
  private bg: any = require('../images/beebg.jpg')
}
</script>
<style lang="scss" scoped>
  .dashborad-map-bee {
    height: 100%;
    text-align: center;

    img {
      height: 100%;
      padding-top: 80px;
    }
  }
</style>
