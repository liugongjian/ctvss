<template>
  <div class="ibox-list">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane v-for="(item,index) in infoList" :key="index" :label="item.label" :name="item.name" />
    </el-tabs>

    <component :is="activeName" :key="activeName" />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import deviceList from '../Info/DeviceList.vue'
import aiManage from '../Info/AiManagement.vue'
import appList from '../Info/AiAppList.vue'

@Component({
  name: 'Device',
  components: {
    deviceList,
    aiManage,
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

  public activeName = 'device-list'

  public handleClick(tab: any) {
    this.activeName = tab.name
  }
}
</script>
