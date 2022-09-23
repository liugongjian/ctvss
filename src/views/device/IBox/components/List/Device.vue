<template>
  <div
    class="ibox-list"
    :class="{'of-hidden': ['ai-manage', 'app-list'].includes(activeName)}"
  >
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane
        v-for="(item, index) in infoList"
        :key="index"
        class="tab"
        :label="item.label"
        :name="item.name"
      />
    </el-tabs>

    <component :is="activeName" :key="activeName" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Provide } from 'vue-property-decorator'

import deviceList from '../Info/DeviceList.vue'
import aiManage from '../Info/AiManagement.vue'
import appList from '../Info/AiAppList.vue'

import iboxInfo from '../Info/IBoxInfo.vue'

@Component({
  name: 'Device',
  components: {
    deviceList,
    aiManage,
    iboxInfo,
    appList
  }
})
export default class IBoxList extends Vue {
  public infoList = [
    { label: '设备列表', name: 'device-list' },
    { label: '盒子信息', name: 'ibox-info' },
    { label: '算法管理', name: 'ai-manage' },
    { label: '人脸库管理', name: 'face-lib' },
    { label: 'AI应用', name: 'app-list' }
  ]

  public eventBus = new Vue()

  public activeName = 'device-list'

  public mounted() {
    this.eventBus.$on('update:submit', tabName => {
      this.activeName = tabName
    })
  }

  public handleClick(tab: any) {
    this.activeName = tab.name
  }

  @Provide('eventBust')
  public eventBust() {
    return {
      eventBus: this.eventBus
    }
  }
}
</script>
<style lang="scss" scoped>
.of-hidden {
  overflow: hidden;
}
</style>
