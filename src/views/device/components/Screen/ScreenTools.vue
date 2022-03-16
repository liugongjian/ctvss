<template>
  <div class="screen-tools">
    <QueueExecutor />
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import QueueExecutor from './components/QueueExecutor.vue'

@Component({
  name: 'ScreenTools',
  components: {
    QueueExecutor
  }
})
export default class extends Vue {

}
</script>
