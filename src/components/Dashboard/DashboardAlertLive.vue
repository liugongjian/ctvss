<template>
  <DashboardContainer title="实时告警信息">
    <ul class="alert-list">
      <li v-for="item in filteredList" :key="item.id" :class="{'new-alert': item.isNew}" @click="openDialog(item)">
        <div class="alert-list__level" :class="`alert-list__level--${item.level}`">
          <svg-icon :name="item.level" />
          {{ typeDic[item.level] }}
        </div>
        <div class="alert-list__type">{{ item.type }}</div>
        <div class="alert-list__datetime">{{ item.datetime }}</div>
      </li>
    </ul>
    <DashboardAlertLiveDetailDialog v-if="dialog" @on-close="closeDialog" />
  </DashboardContainer>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import DashboardContainer from './DashboardContainer.vue'
import DashboardAlertLiveDetailDialog from './DashboardAlertLiveDetailDialog.vue'

@Component({
  name: 'DashboardAlertLive',
  components: {
    DashboardContainer,
    DashboardAlertLiveDetailDialog
  }
})
export default class extends Vue {
  private typeDic = {
    warning: '一般警告',
    alert: '严重警告'
  }
  private currentItem = null
  private dialog = false
  private id = 7
  private list: any = [
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
      id: 6,
      level: 'warning',
      type: '未带口罩',
      datetime: '2020-12-23 13:32:40'
    }
  ]

  private get filteredList() {
    return this.list.slice(0, 6)
  }

  private mounted() {
    setInterval(() => {
      this.id % 2 && this.list.unshift({
        id: this.id,
        level: 'alert',
        type: '人员聚集',
        datetime: '2020-12-23 13:32:40',
        isNew: true
      })
      !(this.id % 2) && this.list.unshift({
        id: this.id,
        level: 'warning',
        type: '未带口罩',
        datetime: '2020-12-23 13:32:40',
        isNew: true
      })
      this.id++
    }, 4000)
  }

  private openDialog(item: any) {
    this.dialog = true
    this.currentItem = item
  }

  private closeDialog() {
    this.dialog = false
  }
}
</script>
<style lang="scss" scoped>
  .alert-list {
    list-style: none;
    margin: 0 -0.5rem;
    padding: 0;
    li {
      display: flex;
      padding: 1rem 0.5rem;
      cursor: pointer;
      &:last-child {
        padding-bottom: 0;
      }
      &:hover {
        background: #374960;
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

    .new-alert {
      animation: shining 2s;
      border-radius: 5px;
    }
  }
</style>
