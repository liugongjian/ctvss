<template>
  <div>
    <el-card>
      <div class="alarm-stats__title">今日AI告警</div>
      <div>
        <ul class="alarm-stats__list">
          <li v-for="item in alarmCounts" :key="item.type" class="alarm-stats__list__item">
            <div class="alarm-stats__list__item--1">{{ item.count }}</div>
            <div class="alarm-stats__list__item--2">{{ item.type }}</div>
          </li>
        </ul>
      </div>
    </el-card>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component({
  name: 'alarm-stats'
})
export default class extends Vue {

  private alarmCounts = [{ count: 10, type: '口罩检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }]
}

</script>
<style lang="scss" scoped>
.alarm-stats{
  &__title{
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  &__list {
    overflow-x: auto;
    white-space: nowrap;
    &::-webkit-scrollbar {
      display: none;
    }
    &__item{
      display: inline-block;
      width: 140px;
      height: 80px;
      background: #f2f2f2;
      margin-right: 10px;
      & > div {
        padding: 15px 0 0 25px;
        height: 50%;
        font-size: 12px;
        width: 100%;
      }
      &--1{
        font-weight: bold;
      }
    }
  }

}
</style>
