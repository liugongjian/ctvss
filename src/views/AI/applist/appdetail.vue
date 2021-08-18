<template>
  <div class="app-container">
    <el-card v-loading="isLoading">
      <el-tabs type="border-card">
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
          </div>
          <div class="query-wrapper">
            <span>设备：</span>
            <el-select v-model="value" placeholder="请选择">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <span>截图时间：</span>
            <el-radio-group v-model="radio2" size="medium">
              <el-radio-button label="今天" />
              <el-radio-button label="近3天" />
              <el-radio-button label="自定义时间" />
            </el-radio-group>
            <span>间隔频率：</span>
            <el-select v-model="value" placeholder="请选择">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div class="chart-wrapper">
            <div class="title">
              <div class="title-block" />
              <span>人员聚集趋势</span>
            </div>
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
export default {
  components: { PicCard },
  data() {
    return {
      appName: null,
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
        url: '',
        time: '2021-07-07 08:56:45',
        device: 'IPC球机',
        rate: 0.65
      }, {
        url: '',
        time: '2021-07-07 08:56:45',
        device: 'IPC球机',
        rate: 0.65
      }, {
        url: '',
        time: '2021-07-07 08:56:45',
        device: 'IPC球机',
        rate: 0.65
      }, {
        url: '',
        time: '2021-07-07 08:56:45',
        device: 'IPC球机',
        rate: 0.65
      }, {
        url: '',
        time: '2021-07-07 08:56:45',
        device: 'IPC球机',
        rate: 0.65
      }, {
        url: '',
        time: '2021-07-07 08:56:45',
        device: 'IPC球机',
        rate: 0.65
      }, {
        url: '',
        time: '2021-07-07 08:56:45',
        device: 'IPC球机',
        rate: 0.65
      }, {
        url: '',
        time: '2021-07-07 08:56:45',
        device: 'IPC球机',
        rate: 0.65
      }]
    }
  },
  created() {
    this.appName = this.$route.query.appname
    console.log(this.$route.query)
  },
  methods: {
  }
}
</script>

<style lang='scss' scoped>
.el-card{
    .pic-wrapper{
        .card-wrapper{
            height: 40vh;
            overflow: scroll;
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
                display: inline-block;
            }
            span {
                font-weight: 200;
            }
        }
}
</style>
