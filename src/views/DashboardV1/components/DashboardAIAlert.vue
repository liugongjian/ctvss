<template>
  <div class="container">
    <div class="switch">
      <el-radio-group v-model="isLive" size="mini">
        <el-radio-button label="live">实时告警</el-radio-button>
        <el-radio-button label="stat">告警统计</el-radio-button>
      </el-radio-group>
    </div>
    <component :is="comp" :is-light="true" :height="19">
      <template #footer>
        <div class="footer" :class="isLive === 'live' ? 'bottom' : ''"><el-button type="text" @click="goRouter">AI告警 >></el-button></div>
      </template>
    </component>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import DashboardMixin from '../mixin/DashboardMixin'
import DashboardAlertToday from '@/views/DashboardV1/components/DashboardAlertToday.vue'
import DashboardAlertLiveNew from '@/views/DashboardV1/components/DashboardAlertLiveNew.vue'


@Component({
  name: 'DashboardAIAlert',
  components: {
    DashboardAlertToday,
    DashboardAlertLiveNew
  }
})
export default class extends Mixins(DashboardMixin) {

  private isLive = 'live'

  private get comp() {

    return this.isLive === 'live' ? 'DashboardAlertLiveNew' : 'DashboardAlertToday'
  }

  private goRouter(){
    this.$router.push({
      name: 'AIAlarmList',
      query: {
        deviceId: ''
      }
    })
  }
}
</script>
<style lang="scss" scoped>
.container {
  position: relative;
  .switch{
    position: absolute;
    right: 32px;
    top: 22px;
  }
}
.footer{
  display: flex;
  justify-content: flex-end;
}
.stats-container{
  position:relative;
  margin-bottom: 18px;
}
.bottom{
  position:absolute;
  bottom: 5px;
  right: 30px;
}
</style>
