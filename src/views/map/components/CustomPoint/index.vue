<template>
  <div class="cutsom-point-box">
    <el-tabs v-model="activeTab" @tab-click="changeTab">
      <el-tab-pane v-for="item in tabsList" :key="item.name" :label="item.label" :name="item.name">
        <custom-list
          v-if="activeTab === item.name"
          :list-data="activeData"
          :active-info="item"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import CustomList from './CustomList.vue'
@Component({
  name: 'CustomPoint',
  components: {
    CustomList
  }
})
export default class CustomPoint extends Vue {
  // 定义tabs相关字典
  private tabsList = [
    { name: 'highlight', label: '高亮区域', sortName: '区域名称' },
    { name: 'build', label: '兴趣点建筑', sortName: '建筑名称' },
    { name: 'point', label: '兴趣点', sortName: '兴趣点名称' }
  ]

  private activeTab = 'highlight'
  private activeData = []

  private changeTab(tab: any) {
    const { label } = tab
    this.activeLabel = label
  }

  private mounted() {
    this.activeData = [{
      name: '王小虎',
      remarks: '上海市普陀区金沙江路 1518 弄'
    }, {
      name: '王小虎',
      remarks: '上海市普陀区金沙江路 1517 弄'
    }, {
      date: '2016-05-01',
      name: '王小虎',
      remarks: '上海市普陀区金沙江路 1519 弄'
    }, {
      date: '2016-05-03',
      name: '王小虎',
      remarks: '上海市普陀区金沙江路 1516 弄'
    }]
  }
}
</script>

<style lang="scss" scoped>
.device-list__right {
  .cutsom-point-box {
    background-color: #fff;
    position: absolute;
    z-index: 2003;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 20px;
  }
}
</style>
