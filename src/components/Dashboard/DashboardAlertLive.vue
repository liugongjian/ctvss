<template>
  <DashboardContainer title="实时告警信息">
    <ul class="alert-list" :style="`height:${height}vh`">
      <li v-for="item in filteredList" :key="item.id" :class="{'new-alert': item.isNew}" @click="openDialog(item)">
        <div class="alert-list__level" :class="`alert-list__level--${item.level}`">
          <svg-icon :name="alertIcon[item.level]" />
          {{ alertLevel[item.level] }}
        </div>
        <div class="alert-list__type">{{ alertType[item.type] }}</div>
        <div class="alert-list__datetime">{{ item.datetime }}</div>
      </li>
    </ul>
    <DashboardAlertLiveDetailDialog v-if="dialog" theme="dashboard-alert-live-dialog" @on-close="closeDialog" />
  </DashboardContainer>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import DashboardMixin from './DashboardMixin'
import { AlertType, AlertLevel, AlertIcon } from '@/dics'
import DashboardContainer from './DashboardContainer.vue'
import DashboardAlertLiveDetailDialog from '@/views/AI/maskRecognation/components/DetailDialog.vue'

@Component({
  name: 'DashboardAlertLive',
  components: {
    DashboardContainer,
    DashboardAlertLiveDetailDialog
  }
})
export default class extends Mixins(DashboardMixin) {
  private alertType = AlertType
  private alertLevel = AlertLevel
  private alertIcon = AlertIcon
  private currentItem = null
  private dialog = false
  private id = 7
  private list: any = [
    {
      id: 1,
      level: 'normal',
      type: 1,
      datetime: '2020-12-23 13:32:40'
    },
    {
      id: 2,
      level: 'serious',
      type: 2,
      datetime: '2020-12-23 13:32:40'
    },
    {
      id: 3,
      level: 'serious',
      type: 3,
      datetime: '2020-12-23 13:32:40'
    },
    {
      id: 4,
      level: 'serious',
      type: 1,
      datetime: '2020-12-23 13:32:40'
    },
    {
      id: 5,
      level: 'normal',
      type: 2,
      datetime: '2020-12-23 13:32:40'
    },
    {
      id: 6,
      level: 'normal',
      type: 3,
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
        level: 'normal',
        type: 1,
        datetime: '2020-12-23 13:32:40',
        isNew: true
      })
      !(this.id % 2) && this.list.unshift({
        id: this.id,
        level: 'serious',
        type: 2,
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
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    li {
      flex: 1;
      display: flex;
      align-items: center;
      padding: .4rem;
      cursor: pointer;
      &:hover {
        background: #374960;
      }
    }
    &__level {
      width: 30%;
      &--normal {
        color: #F4C46C;
      }
      &--serious {
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
