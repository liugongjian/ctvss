<template>
  <div>
    <slot />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  name: 'DashboardContainer'
})
export default class extends Vue {
  @Prop() private title?: string
}
</script>
