<template>
  <div class="cutsom-point-box">
    <el-tabs v-model="activeTab" @tab-click="changeTab">
      <el-tab-pane v-for="item in tabsList" :key="item.name" :label="item.label" :name="item.name">
        <custom-list
          v-if="activeTab === item.name"
          :list-data="activeData"
          :active-info="item"
          :active-tab="activeTab"
          :custom-point-info="customPointInfo"
          @getPointsList="getPointsList"
          @closePointMark="closePointMark"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import CustomList from './CustomList.vue'
import { getInterestList } from '@/api/map'

@Component({
  name: 'CustomPoint',
  components: {
    CustomList
  }
})
export default class CustomPoint extends Vue {
  @Prop() private customPointInfo: any

  // 定义tabs相关字典
  private tabsList = [
    { name: 'HighLightArea', label: '高亮区域', sortName: '区域名称' },
    { name: 'InterestBuilding', label: '兴趣点建筑', sortName: '建筑名称' },
    { name: 'InterestPoint', label: '兴趣点', sortName: '兴趣点名称' }
  ]

  private activeTab = 'HighLightArea'
  private activeData = {}
  private customPoint: any

  private changeTab() {
    this.getPointsList()
  }

  private mounted() {
    this.getPointsList()
  }

  private getPointsList(pageNum: number = 1, pageSize: number = 20) {
    const { mapId } = this.customPointInfo
    const param = {
      mapId,
      type: this.activeTab,
      pageNum,
      pageSize
    }
    getInterestList(param).then(res => {
      if (res && res.tags && res.tags.length > 0) {
        this.activeData = res
      } else {
        this.activeData = {}
      }
    }).catch(err => console.log(err))
  }

  private closePointMark() {
    this.$emit('closeEditMark')
    this.$emit('chooseMap', this.customPointInfo)
  }
}
</script>

<style lang="scss" scoped>
.device-list__right {
  .cutsom-point-box {
    background-color: #fff;
    position: absolute;
    z-index: 200;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 20px;
  }
}
</style>
