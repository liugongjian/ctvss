<template>
  <DashboardContainer title="今日告警信息">
    1111
  </DashboardContainer>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import DashboardContainer from './DashboardContainer.vue'

@Component({
  name: 'DashboardAlertToday',
  components: { DashboardContainer }
})
export default class extends Vue {
}
</script>
<style lang="scss" scoped>

</style>
