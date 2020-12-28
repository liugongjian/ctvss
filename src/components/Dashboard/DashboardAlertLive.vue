<template>
  <DashboardContainer title="实时告警信息">
    <ul class="alert-list" :style="`height:${height}vh`">
      <li v-for="item in filteredList" :key="item.id" :class="{'new-alert': item.isNew}" @click="openDialog(item)">
        <div class="alert-list__level" :class="`alert-list__level--${item.level}`">
          <svg-icon :name="alertIcon[item.level]" />
          {{ alertLevel[item.level] }}
        </div>
        <div class="alert-list__type">{{ alertType[item.event] }}</div>
        <div class="alert-list__datetime">{{ item.timeStamp }}</div>
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
import { getAuditList } from '@/api/dashboard'

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
  private list: any = []

  private get filteredList() {
    return this.list.slice(0, 6)
  }

  private mounted() {
    this.updateAuditList()
    setInterval(() => {
      this.updateAuditList()
    }, 30000)
  }

  private updateAuditList() {
    getAuditList({
      limit: 6
    }).then((res) => {
      console.log(res)
      this.list.forEach((item: any) => {
        item.isNew = false
      })
      res.audit.reverse().forEach((item: any) => {
        if (this.list.length === 0 || (item.timeStamp >= this.list[0].timeStamp && item.event !== this.list[0].event)) {
          this.list.unshift({
            ...item,
            isNew: true,
            level: checkLevel(item)
          })
        }
      })
      this.list = this.list.slice(0, 6)
      function checkLevel(data: any) {
        if (data.event === '2' && JSON.parse(data.metaData).result.length <= 5) {
          return 'normal'
        } else {
          return 'serious'
        }
      }
    })
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
