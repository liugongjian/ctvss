<template>
  <div class="app-container">
    <el-card v-loading="isLoading">
      <el-tabs type="border-card" @tab-click="handleTabClick">
        <el-tab-pane label="基本信息">用户管理</el-tab-pane>
        <el-tab-pane label="分析结果">
          <div class="face-filter">
            <span>人脸库：</span>
            <el-select v-model="value" placeholder="请选择">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <div ref="faceoptions" class="face-options">
              <div v-for="item in faceInfos" :key="item.name" class="option">
                <el-image :src="item.url" />
                <div class="option-info">
                  <span>{{ item.name }}</span>
                  <input type="checkbox">
                </div>
              </div>
            </div>
            <div class="link-wrapper">
              <el-link type="warning" @click="handleExpand">{{ isExpand ? '- 收起' : '+ 展开' }}</el-link>
            </div>
          </div>
          <div class="query-wrapper">
            <span>设备：
              <el-select v-model="value" placeholder="请选择">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </span>
            <span>截图时间：
              <el-radio-group v-model="radio2" size="medium">
                <el-radio-button label="今天" />
                <el-radio-button label="近3天" />
                <el-radio-button label="自定义时间" />
              </el-radio-group>
            </span>
            <span>间隔频率：
              <el-select v-model="value" placeholder="请选择">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </span>
          </div>
          <div class="chart-wrapper">
            <div class="title">
              <div class="title-block" />
              <span>人员聚集趋势</span>
            </div>
            <PeopleTrendChart
              :height="34"
            />
          </div>

          <div class="pic-wrapper">
            <div class="title">
              <div class="title-block" />
              <span>视频截图</span>
            </div>
            <div class="card-wrapper">
              <PicCard v-for="(pic, index) in picinfos" :key="index" :pic="pic" />
            </div>
            <el-pagination
              :hide-on-single-page="false"
              :total="5"
              layout="prev, pager, next"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>
<script>
// @ts-ignore
import PicCard from './component/PicCard.vue'
import PeopleTrendChart from './component/PeopleTrendChart.vue'
import axios from 'axios'
export default {
  components: { PicCard, PeopleTrendChart },
  data() {
    return {
      appName: null,
      isExpand: false,
      faceInfos: [{
        url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
        name: '高手高手'
      }, {
        url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
        name: '高手高手'
      }, {
        url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
        name: '高手高手'
      }, {
        url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
        name: '高手高手'
      }, {
        url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
        name: '高手高手'
      }, {
        url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
        name: '高手高手'
      }, {
        url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
        name: '高手高手'
      }, {
        url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
        name: '高手高手'
      }, {
        url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
        name: '高手高手'
      }, {
        url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
        name: '高手高手'
      }, {
        url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
        name: '高手高手'
      }, {
        url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
        name: '高手高手'
      }, {
        url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
        name: '高手高手'
      }, {
        url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
        name: '高手高手'
      }, {
        url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
        name: '高手高手'
      }, {
        url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
        name: '高手高手'
      }],
      chartData: [{
        year: '1991',
        value: 3
      }, {
        year: '1992',
        value: 4
      }, {
        year: '1993',
        value: 3.5
      }, {
        year: '1994',
        value: 5
      }, {
        year: '1995',
        value: 4.9
      }, {
        year: '1996',
        value: 6
      }, {
        year: '1997',
        value: 7
      }, {
        year: '1998',
        value: 9
      }, {
        year: '1999',
        value: 13
      }],
      isLoading: false,
      chart: null,
      view1: null,
      view2: null,
      options: [{
        value: '选项1',
        label: '全部人脸库'
      }, {
        value: '选项2',
        label: '第一人脸库'
      }, {
        value: '选项3',
        label: '第二人脸库'
      }],
      radio2: '今天',
      picinfos: [{
        url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
        time: '2021-07-07 08:56:45',
        device: 'IPC球机',
        rate: 0.65
      }, {
        url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
        time: '2021-07-07 08:56:45',
        device: 'IPC球机',
        rate: 0.65
      }, {
        url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
        time: '2021-07-07 08:56:45',
        device: 'IPC球机',
        rate: 0.65
      }, {
        url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
        time: '2021-07-07 08:56:45',
        device: 'IPC球机',
        rate: 0.65
      }, {
        url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
        time: '2021-07-07 08:56:45',
        device: 'IPC球机',
        rate: 0.65
      }, {
        url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
        time: '2021-07-07 08:56:45',
        device: 'IPC球机',
        rate: 0.65
      }, {
        url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
        time: '2021-07-07 08:56:45',
        device: 'IPC球机',
        rate: 0.65
      }, {
        url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
        time: '2021-07-07 08:56:45',
        device: 'IPC球机',
        rate: 0.65
      }]
    }
  },
  created() {
  },
  async mounted() {
    await this.getChartData()
  },
  methods: {
    async getChartData() {
      await axios({
        url: 'https://gw.alipayobjects.com/os/antvdemo/assets/data/terrorism.json',
        method: 'get'
      })
    },
    handleTabClick() {
      const e = document.createEvent('Event')
      e.initEvent('resize', true, true)
      window.dispatchEvent(e)
    },
    handleExpand() {
      let expandDom = this.$refs.faceoptions
      if (this.isExpand) {
        expandDom.style.height = '86px'
        expandDom.style.overflow = 'hidden'
        expandDom.scrollTop = 0
      } else {
        if (this.faceInfos.length > 10) {
          expandDom.style.overflowY = 'auto'
          expandDom.style.height = '240px'
        } else {
          expandDom.style.height = '150px'
          expandDom.style.overflow = 'hidden'
        }
      }
      this.isExpand = !this.isExpand
    }
  }
}
</script>

<style lang='scss' scoped>
.app-container{
}
.el-card{
    .face-filter{
        margin-bottom: 20px;
        .face-options{
            width: 88%;
            height: 86px;
            margin-left: 56px;
            overflow: hidden;
            transition: height .2s;
            &::-webkit-scrollbar {
                /*滚动条整体样式*/
                width : 10px;  /*高宽分别对应横竖滚动条的尺寸*/
                height: 1px;
            }
            &::-webkit-scrollbar-thumb {
                /*滚动条里面小方块*/
                border-radius   : 10px;
                background-color: #fff;
            }
            &::-webkit-scrollbar-track {
            /*滚动条里面轨道*/
                background   : #fff;
                border-radius: 10px;
            }
            // border: orange solid 1px;
            .option{
                display: inline-block;
                width: 15%;
                min-width: 167px;
                max-width: 222px;
                height: 54px;
                border: red solid 1px;
                margin:20px 20px 0 0;
                .el-image{
                    display: inline-block;
                    height: 100%;
                    width: 40%;
                    min-width: 65px;
                    max-width: 70px;
                }
                .option-info{
                    float: right;
                    display: flex;
                    line-height: 54px;
                    width: 60%;
                    justify-content: space-around;
                    align-items: center;
                }
            }
        }
        .link-wrapper{
            margin-top: 10px;
            text-align: center;
        }
    }
    .query-wrapper{
        margin-bottom: 20px;
        padding-left: 10px;
        &>span{
            margin-right: 20px;
        }
    }
    .pic-wrapper{
        .card-wrapper{
            height: 40vh;
            overflow-y: scroll;
        }
    }
    .title{
            height: 50px;
            vertical-align: middle;
            &>div{
                // display: inline-block;
                padding-top: 5px;
            }
            .title-block{
                width: 7px;
                height: 15px;
                background-color: rgba(250, 131, 52, 1);
                border: none;
                margin-top: 2px;
                margin-right: 5px;
                display: inline-block;
            }
            span {
                font-weight: bold;
            }
        }
}
</style>
