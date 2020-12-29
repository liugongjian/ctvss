<template>
  <DashboardContainer title="实时告警信息">
    <ul class="alert-list" :style="`height:${height}vh`">
      <li v-for="item in list" :key="item.id" :class="{'new-alert': item.isNew}" @click="openDialog(item)">
        <div class="alert-list__level" :class="`alert-list__level--${item.level}`">
          <svg-icon :name="alertIcon[item.level]" />
          {{ alertLevel[item.level] }}
        </div>
        <div class="alert-list__type">{{ alertType[item.event] }}</div>
        <div class="alert-list__datetime">{{ item.timeStamp }}</div>
      </li>
    </ul>
    <DashboardAlertLiveDetailDialog v-if="dialog" theme="dashboard-alert-live-dialog" :audit="currentItem" @on-close="closeDialog" />
  </DashboardContainer>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import DashboardMixin from './DashboardMixin'
import { AlertType, AlertLevel, AlertIcon } from '@/dics'
import DashboardContainer from './DashboardContainer.vue'
import { getAuditList } from '@/api/dashboard'
import DashboardAlertLiveDetailDialog from './DashboardAlertLiveDetailDialog.vue'

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
  private currentItem: any = null
  private dialog = false
  private list: any = []
  public intervalTime = 15 * 1000
  private lastTime: any = null

  private mounted() {
    this.setInterval(this.updateAuditList)
  }

  private updateAuditList() {
    getAuditList({
      limit: 6
    }).then((res) => {
      this.list = res.audit
      this.list.forEach((item:any) => {
        item.id = Math.random().toString(16).slice(-10)
        item.level = this.checkLevel(item)
        item.isNew = this.lastTime && (new Date(item.timeStamp).getTime() > this.lastTime)
      })
      if (this.list.length) {
        this.lastTime = new Date(this.list[0].timeStamp).getTime()
      }
    })
  }

  private checkLevel(data: any) {
    if (data.event === '2' && JSON.parse(data.metaData).result.length <= 5) {
      return 'normal'
    } else {
      return 'serious'
    }
  }

  private openDialog(item: any) {
    this.dialog = true
    this.currentItem = {
      event: item.event,
      streamName: item.streamName,
      timestamp: item.timeStamp
    }
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
    // justify-content: space-between;
    justify-content: flex-start;

    li {
      // flex: 1;
      height: 16.6%;
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
