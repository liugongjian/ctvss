<template>
  <div class="screen-tools">
    <Polling />
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import Polling from './components/Polling.vue'

@Component({
  name: 'ScreenTools',
  components: {
    Polling
  }
})
export default class extends Vue {

}
</script>
