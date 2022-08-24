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

  public activeName = 'device-list'

  public handleClick(tab: any) {
    this.activeName = tab.name
  }
}
</script>
<style lang="scss" scoped>
.ibox-list {
  overflow: auto;
}

.ibox-list::-webkit-scrollbar {
  /* 滚动条整体样式 */
  width: 5px;  /* 高宽分别对应横竖滚动条的尺寸 */
  height: 10px;
}

.ibox-list::-webkit-scrollbar-thumb {
  /* 滚动条里面小方块 */
  border-radius: 10px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 20%);
  background: #ddd;
}

.ibox-list::-webkit-scrollbar-track {
  /* 滚动条里面轨道 */
  // box-shadow: inset 0 0 5px rgba(0, 0, 0, 20%);
  border-radius: 20px;
  background: transparent;
}
</style>