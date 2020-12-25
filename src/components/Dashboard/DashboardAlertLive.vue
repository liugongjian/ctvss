<template>
  <DashboardContainer title="实时告警信息">
    <ul class="alert-list">
      <li v-for="item in filteredList" :key="item.id">
        <div class="alert-list__level" :class="`alert-list__level--${item.level}`">
          <svg-icon :name="item.level" />
          {{ typeDic[item.level] }}
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
  private typeDic = {
    warning: '一般警告',
    alert: '严重警告'
  }
  private list = [
    {
      id: 1,
      level: 'warning',
      type: '未带口罩',
      datetime: '2020-12-23 13:32:40'
    },
    {
      id: 2,
      level: 'warning',
      type: '未带口罩',
      datetime: '2020-12-23 13:32:40'
    },
    {
      id: 3,
      level: 'warning',
      type: '未带口罩',
      datetime: '2020-12-23 13:32:40'
    },
    {
      id: 4,
      level: 'alert',
      type: '人员聚集',
      datetime: '2020-12-23 13:32:40'
    },
    {
      id: 5,
      level: 'alert',
      type: '人员聚集',
      datetime: '2020-12-23 13:32:40'
    },
    {
      id: 2,
      level: 'warning',
      type: '未带口罩',
      datetime: '2020-12-23 13:32:40'
    }
  ]
  private get filteredList() {
    return this.list.slice(0, 6)
  }
}
</script>
<style lang="scss" scoped>
  .alert-list {
    list-style: none;
    margin: 0;
    padding: 0;
    li {
      display: flex;
      margin: 1rem 0;
      &:last-child {
        margin: 0;
      }
    }
    &__level {
      width: 30%;
      &--warning {
        color: #F4C46C;
      }
      &--alert {
        color: #E56161;
      }
    }
    &__datetime {
      flex: 1;
      text-align: right;
    }
  }
</style>
