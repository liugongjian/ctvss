<template>
  <DashboardContainer title="实时告警信息">
    <ul class="alert-list">
      <li>
        <div class="alert-list__level">
          <svg-icon name="warning" />
        </div>
        <div class="alert-list__type">未带口罩</div>
        <div class="alert-list__datetime">2020-12-23 13:32:40</div>
      </li>
    </ul>
  </DashboardContainer>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import DashboardContainer from './DashboardContainer.vue'

@Component({
  name: 'DashboardAlertLive',
  components: { DashboardContainer }
})
export default class extends Vue {
  private list = [
    {
      level: 'warning',
      type: '未带口罩',
      datetime: '2020-12-23 13:32:40'
    },
    {
      level: 'warning',
      type: '未带口罩',
      datetime: '2020-12-23 13:32:40'
    },
    {
      level: 'warning',
      type: '未带口罩',
      datetime: '2020-12-23 13:32:40'
    }
  ]
}
</script>
<style lang="scss" scoped>
  .alert-list {
    li {
      display: flex;
    }

  }
</style>
