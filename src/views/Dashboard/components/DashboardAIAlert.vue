<template>
  <div class="container">
    <div class="switch">
      <el-radio-group v-model="isLive" size="mini">
        <el-radio-button label="live">实时告警</el-radio-button>
        <el-radio-button label="stat">告警统计</el-radio-button>
      </el-radio-group>
    </div>
    <component :is="comp" :is-light="true" :height="19" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import DashboardMixin from '../mixin/DashboardMixin'
import DashboardAlertToday from '@/views/Dashboard/components/DashboardAlertToday.vue'
import DashboardAlertLiveNew from '@/views/Dashboard/components/DashboardAlertLiveNew.vue'


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
</style>
