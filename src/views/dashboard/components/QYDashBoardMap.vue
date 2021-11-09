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
  private bg: any = require('../images/qingyang.png')
}
</script>
<style lang="scss" scoped>
  .dashborad-map-bee {
    height: 100vh;
    text-align: center;
    img {
      padding-top: 90px;
      height: 65vh;
    }
  }
</style>
