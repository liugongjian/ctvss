
<template>
  <el-card>
    <div class="pic-wrapper">
      <el-image ref="img" :src="pic.image" @load="onload" />
      <Locations :type="type" :img="pic" />
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
          {{ Math.floor(pic.confidence * 100) }}%
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </el-card>
</template>
<script lang='ts'>
import { Component, Vue, Prop } from 'vue-property-decorator'
import { decodeBase64 } from '@/utils/base64'
import Locations from '@/views/dashboard/ai/components/Locations.vue'
import { parseMetaData, transformLocation } from '@/utils/ai'

@Component({
  name: 'PicCard',
  components: {
    Locations
  }
})
export default class extends Vue {
  @Prop() private pic!: any
  private picInfo = null
  private type = '4'
  private decodeBase64: Function = decodeBase64

  private onload() {
    console.log('onload')
    if (!this.pic || !this.pic.image) {
      return
    }
    const metaData = JSON.parse(this.pic.metadata)
    console.log('metaData:', metaData)
    const locations = parseMetaData(this.type, metaData)
    console.log('locations:', locations)
    const img = this.$refs.img
    this.picInfo = { ...this.pic, locations: transformLocation(locations, img) }
    console.log(this.picInfo)
  }
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
      height: 67%;
        .el-image{
          width: 100%;
          height: 100%;
        }
    }
    .content-wrapper{
        position: absolute;
        bottom: 0;
        left: 0;
        height: 33%;
        padding-top: 10px;
        ::v-deep .el-descriptions-item__container{
          display: grid;
          grid-template-columns: 40% 60%;
          .el-descriptions-item__label.has-colon{
            text-align: end;
          }
          .el-descriptions-item__label{
            min-width: 0 !important;
          }
        }
    }
}
</style>
