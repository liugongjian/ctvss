
<template>
  <el-card>
    <div class="pic-wrapper">
      <el-image :src="pic.url" />
    </div>
    <div class="content-wrapper">
      <div class="info-left">
        <div>截图时间：</div>
        <div>设备名称：</div>
        <div>置信度：</div>
      </div>
      <div class="info-right">
        <div>{{ pic.time }}</div>
        <div>{{ pic.device }}</div>
        <div>{{ pic.rate }}</div>
      </div>
    </div>
  </el-card>
</template>
<script lang='ts'>
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({
  name: 'PicCard',
  components: {
  }
})
export default class extends Vue {
  @Prop() private pic!: any
}
</script>
<style lang='scss' scoped>
.el-card{
    width:400px;
    height:400px;
    min-width: 100px;
    margin-top: 2%;
    margin-right: 2%;
    display: inline-block;
    position: relative;
    .pic-wrapper{
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 70%;
        .el-image{
          width: 100%;
          height: 100%;
        }
    }
    .content-wrapper{
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 30%;
        padding-top: 5%;
        .info-left{
          float: left;
          width: 30%;
          height: 100%;
          &>div{
            float: right;
            margin-bottom: 15px;
          }
        }
        .info-right{
          float: left;
          width: 60%;
          height: 100%;
          &>div{
            margin-bottom: 15px;
          }
        }
    }
}
</style>
