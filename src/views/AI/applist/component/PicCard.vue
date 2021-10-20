
<template>
  <el-card>
    <div class="pic-wrapper">
      <el-image :src="pic.image" />
    </div>
    <div class="content-wrapper">
      <el-descriptions :column="1">
        <el-descriptions-item label="截图时间">
          {{ pic.time }}
        </el-descriptions-item>
        <el-descriptions-item label="设备名称">
          {{ pic.deviceName }}
        </el-descriptions-item>
        <el-descriptions-item label="置信度">
          {{ pic.confidence * 100 }}%
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </el-card>
</template>
<script lang='ts'>
import { Component, Vue, Prop } from 'vue-property-decorator'
import { decodeBase64 } from '@/utils/base64'

@Component({
  name: 'PicCard',
  components: {
  }
})
export default class extends Vue {
  @Prop() private pic!: any
  private decodeBase64: Function = decodeBase64
}
</script>
<style lang='scss' scoped>
.el-card{
    // width:400px;
    height:400px;
    min-width: 100px;
    margin-top: 2% !important;
    margin-right: 2% !important;
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
        height: 30%;
        display: flex;
        justify-content: center;
        align-items: center;
        .el-descriptions{
          width: 80%;
        }
    }
}
</style>
