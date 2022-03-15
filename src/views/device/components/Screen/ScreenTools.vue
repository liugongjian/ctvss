<template>
  <div class="screen-tools">
    <div class="screen-tools__bar">
      <Polling />
    </div>
    <ReplayAxis />
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import ReplayAxis from '../ReplayPlayer/ReplayAxis.vue'
import Polling from './components/Polling.vue'

@Component({
  name: 'ScreenTools',
  components: {
    ReplayAxis,
    Polling
  }
})
export default class extends Vue {

}
</script>
