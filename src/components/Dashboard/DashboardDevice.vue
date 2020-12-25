<template>
  <DashboardContainer title="设备状态统计">
    <template v-slot:header>
      最近12小时
    </template>
    hsdjfhdsjf
  </DashboardContainer>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import DashboardContainer from './DashboardContainer.vue'

@Component({
  name: 'DashboardDevice',
  components: { DashboardContainer }
})
export default class extends Vue {
  @Prop() private title?: string
}
</script>
<style lang="scss" scoped>

</style>
