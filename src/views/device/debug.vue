<!-- 分屏预览 -->
<template>
  <div>
    <player ref="video" :type="videoCoding" :url="address.flvUrl" :auto-play="true" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Mixins } from 'vue-property-decorator'
import Player from './components/Player.vue'

@Component({
  name: 'Screen',
  components: {
    Player
  }
})
export default class extends Vue {

}
</script>
<style lang="scss" scoped>

</style>
