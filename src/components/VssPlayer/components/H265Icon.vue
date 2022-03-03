<!-- H265图标 -->
<template>
  <div v-if="codec === 'h265'" class="controls__h265">
    <svg-icon name="h265" width="40px" height="22px" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({
  name: 'H265Icon'
})
export default class extends Vue {
  @Prop()
  private codec
}
</script>
