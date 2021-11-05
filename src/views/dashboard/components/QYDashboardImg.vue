<template>
  <DashboardContainer title="告警处理">
    <div class="images" :style="`height:${height}vh`">
      <a v-for="img in imageList" :key="img.timestamp" target="_blank" href="https://console.vcn.ctyun.cn/vss/dashboard/ai?type=15">
        <img :src="img.url">
      </a>
    </div>
    <div class="buttons">
      <el-button type="success">正常确认</el-button>
      <el-button type="danger">异常挂起</el-button>
    </div>
  </DashboardContainer>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import DashboardMixin from '../mixin/DashboardMixin'
import DashboardContainer from './DashboardContainer.vue'
import { getRecordAuditEvents } from '@/api/dashboard'

declare module 'vue/types/vue' {
    interface Vue {
        [key: string]: any,
    }
}

@Component({
  name: 'DashboardWeeklyTrend',
  components: { DashboardContainer }
})
export default class extends Mixins(DashboardMixin) {
  private imageList = []
  private mounted() {
    this.getRecordAuditEvents()
  }

  private async getRecordAuditEvents() {
    try {
      const res = await getRecordAuditEvents({
        event: 15,
        pageSize: 12,
        pageNum: 1
      })
      this.imageList = res.imgs
      console.log(this.imageList)
    } catch (e) {
      console.log(e)
    }
  }
}
</script>
<style lang="scss" scoped>
  .images {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding-bottom: 50px;
    a {
      width: 30%;
      display: block;
    }
    img {
      width: 100%;
      display: block;
    }
  }
  .buttons {
    position: absolute;
    bottom: 112px;
    right: 78px;
    text-align: center;
  }
</style>
