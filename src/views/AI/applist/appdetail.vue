<template>
  <div class="app-container">
    <el-card v-loading="isLoading">
      <el-tabs :value="this.$route.query.tabNum ? 'result' : 'basic'" type="border-card" @tab-click="handleTabClick">
        <el-tab-pane label="基本信息" name="basic">用户管理</el-tab-pane>
        <el-tab-pane label="分析结果" name="result">
          <div class="face-filter">
            <span>人脸库：</span>
            <el-select v-model="value" placeholder="请选择" @change="handleSelectFaceLib">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <div ref="faceoptions" class="face-options">
              <div v-for="(item, index) in faceInfos" :id="item.id" :key="index" class="option" @click="handleFaceSelect(item)">
                <el-image :src="item.url" />
                <div class="option-info">
                  <span>{{ item.name }}</span>
                  <input :id="item.id+'input'" type="checkbox">
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
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import PicCard from './component/PicCard.vue'
import PeopleTrendChart from './component/PeopleTrendChart.vue'
@Component({
  name: 'AppDetail',
  components: {
    PicCard,
    PeopleTrendChart
  }
})
export default class extends Vue {
    private appName: String = null
    private isExpand: boolean = false
    private value: String = 'all'
    private expandBtnVisible: boolean = null
    private faceSelected: any = []
    private faceInfos: any = [{
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      name: '高手高手',
      id: '1'
    }, {
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      name: '高手高手',
      id: '2'
    }, {
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      name: '高手高手',
      id: '3'
    }, {
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      name: '高手高手',
      id: '4'
    }, {
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      name: '高手高手',
      id: '5'
    }, {
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      name: '高手高手',
      id: '6'
    }, {
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      name: '高手高手',
      id: '7'
    }, {
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      name: '高手高手',
      id: '8'
    }, {
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      name: '高手高手',
      id: '9'
    }, {
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      name: '高手高手',
      id: '10'
    }, {
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      name: '高手高手',
      id: '11'
    }, {
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      name: '高手高手',
      id: '12'
    }, {
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      name: '高手高手',
      id: '13'
    }, {
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      name: '高手高手',
      id: '14'
    }, {
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      name: '高手高手',
      id: '15'
    }, {
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      name: '高手高手',
      id: '16'
    }]
    private isLoading: boolean = false
    private options: any = [{
      value: 'all',
      label: '全部人脸库'
    }, {
      value: 'lib1',
      label: '第一人脸库'
    }, {
      value: 'lib2',
      label: '第二人脸库'
    }]
    private radio2: String = '今天'
    private picinfos: any = [{
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

    @Watch('faceSelected')
    selectFace(newArr :any, oldArr :any) {
      let difference: any = newArr.concat(oldArr).filter((v: any) => !newArr.includes(v) || !oldArr.includes(v))
      if (newArr.length < oldArr.length) {
        document.getElementById(difference[0]).classList.remove('selected')
        document.getElementById(difference[0] + 'input').checked = false
      } else {
        newArr.forEach((element: any) => {
          document.getElementById(element).classList.add('selected')
          document.getElementById(element + 'input').checked = true
        })
      }
    }

    private getData() {

    }

    private mounted() {
      window.onload = function() {
        let expandDom: any = this.$refs.faceoptions
      }
    }

    private handleFaceSelect(option: any) {
      if (this.faceSelected.includes(option.id)) {
        this.faceSelected = this.faceSelected.filter((item: any) => item !== option.id)
      } else {
        this.faceSelected.push(option.id)
      }
      this.getData()
    }
    private handleTabClick() {
      const e = document.createEvent('Event')
      e.initEvent('resize', true, true)
      window.dispatchEvent(e)
    }
    private handleExpand() {
      let expandDom: any = this.$refs.faceoptions
      if (this.isExpand) {
        expandDom.style.height = '86px'
        expandDom.style.overflow = 'hidden'
        expandDom.scrollTop = 0
      } else {
        if (expandDom.scrollHeight > 220) {
          expandDom.style.overflowY = 'auto'
          expandDom.style.height = '225px'
        } else {
          expandDom.style.height = expandDom.scrollHeight
          expandDom.style.overflow = 'hidden'
        }
      }
      this.isExpand = !this.isExpand
    }
    private handleSelectFaceLib(val) {
      // 请求后端数据并赋值给this.faceInfos
      switch (val) {
        case 'all':
          break
        case 'lib1':
          break
        case 'lib2':
          break
      }
    }
}
</script>

<style lang='scss' scoped>

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
                width : 1px;  /*高宽分别对应横竖滚动条的尺寸*/
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
            .selected{
                border: rgba(250,131,52) solid 2px !important;
            }
            .option{
                cursor: pointer;
                display: inline-block;
                width: 15%;
                min-width: 167px;
                max-width: 222px;
                height: 54px;
                border: rgb(192,196,204) solid .5px;
                border-radius: 5px;
                margin:20px 20px 0 0;
                overflow: hidden;
                padding:0;
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
