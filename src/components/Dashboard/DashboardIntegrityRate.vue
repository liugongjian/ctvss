<template>
  <DashboardContainer title="录像完整率" class="container">
    <template v-slot:header>
      <el-select 
        v-model="selectValue"
        size="small"
        popper-class="dark-select" 
      >
        <el-option
          v-for="item in selectOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
    </template>
    <div v-if="selectValue === '0'" class="content">
      <div class="content__calendar">
        <el-tooltip placement="top" v-for="(item, index) in data" :key="index">
          <div slot="content">{{item.time}}<br/>{{`rate: ${parseFloat(item.rate * 100).toFixed(1)}%`}}</div>
          <div class="content__calendar__item" >
            <p :style="item.itemBgColor">
              <span>{{item.day === 30 ? '今': item.day}}</span>
            </p>
          </div>
        </el-tooltip>
      </div>
      <div class="content__process">
        <span class="content__process__span content__process__span--top">0%</span>
        <span class="content__process__span content__process__span--bottom">100%</span>
      </div>
    </div>
  </DashboardContainer>
</template>

<script lang="ts"> 
import { Component, Vue } from 'vue-property-decorator'
import DashboardContainer from './DashboardContainer.vue'

@Component({
  name: 'DashboardDevice',
  components: { DashboardContainer }
})
export default class extends Vue {
  private data: any = []
  private selectValue: string = '0'
  private selectOptions: any = [{
    value: '0',
    label: '最近30天'
  }, {
    value: '1',
    label: '表格'
  }]

  mounted() {
    for (let i=0; i<30; i++) {
      this.data.push({
        time: "2020年12月15日",
        day: i+1,
        rate: i/30,
      })
    }
    var gradient = {
      rgb_top: [124, 201, 111],
      rgb_bottom: [226, 97, 95]
    }
    var rgb = [
      gradient.rgb_top[0] - gradient.rgb_bottom[0],
      gradient.rgb_top[1] - gradient.rgb_bottom[1],
      gradient.rgb_top[2] - gradient.rgb_bottom[2],
    ]
    var content = document.getElementsByClassName('content__calendar')[0]
    content.innerHTML = ''
    for (let i=0; i<30; i++) {
      var rgb_temp = [
        gradient.rgb_bottom[0] + rgb[0] * this.data[i].rate,
        gradient.rgb_bottom[1] + rgb[1] * this.data[i].rate,
        gradient.rgb_bottom[2] + rgb[2] * this.data[i].rate
      ]
      this.data[i].itemBgColor = `background-color: rgb(${rgb_temp[0]},${rgb_temp[1]},${rgb_temp[2]})`
    }
  }
}
</script>
<style lang="scss" scoped>
  .content {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 20vh;

    &__calendar {
      display: flex;
      flex-wrap: wrap;
      width: 90%;
      height: 95%;
      margin-right: 3%;
      margin-left: -5%;

      &__item {
      display: flex;
      height: 33%;
      width: 10%; 
      justify-content: center;
      align-items: center;
      p {
        font-size: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #7CC96F;
        border-radius: 100%;
        width: 2rem;
        height: 2rem;
        color: white;
        span {
          -webkit-user-select:none;
          -moz-user-select:none;
          -ms-user-select:none;
          user-select:none;
        }
      }
    }
    }

    

    &__process {
      position: relative;
      top: 20%;
      /* (226, 97, 95), (124, 201, 111) */
      background-image: linear-gradient(#E2615F, #7CC96F);
      width: 5px;
      height: 40%;
      border-radius: 10px;

      &__span {
        position: absolute;
        left: 200%;

        &--top {
          top: 0;
          color: #E2615F;
        }

        &--bottom {
          top: 90%;
          color: #7CC96F;
        }
      }
    }

  }
</style>
