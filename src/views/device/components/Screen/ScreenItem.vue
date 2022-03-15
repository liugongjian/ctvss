<template>
  <div
    v-loading="screen.isLoading"
    class="screen-item"
  >
    <LivePlayer :screen="screen" />
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
// import { ScreenManager } from '@/views/device/models/Screen/ScreenManager'
import LivePlayer from '../LivePlayer.vue'

@Component({
  name: 'ScreenItem',
  components: {
    LivePlayer
  }
})
export default class extends Vue {
  @Prop()
  private screen
}
</script>
