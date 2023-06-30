<template>
  <el-card @click.native="viewDetail">
    <div class="pic-wrapper">
      <img ref="img" :src="pic.image" @error="nopic" @load="onload">
      <!-- <Locations v-if="picInfo && isPicLoaded" :type="type" :img="picInfo" /> -->
      <LocationsNew v-if="picRatio.ratioW && pic" :img="pic" :ratio="picRatio" />
    </div>
    <div class="content-wrapper">
      <el-descriptions :column="1">
        <el-descriptions-item label="应用名称">
          {{ pic.appName }}
        </el-descriptions-item>

        <el-descriptions-item label="算法类型">
          {{ pic.algoName }}
        </el-descriptions-item>


        <el-descriptions-item label="设备名称">
          <el-tooltip
            class="item"
            effect="dark"
            :content="pic.deviceName"
            placement="bottom"
          >
            <span>{{
              pic.deviceName && pic.deviceName.length > 10
                ? pic.deviceName.slice(0, 10) + '...'
                : pic.deviceName
            }}</span>
          </el-tooltip>
        </el-descriptions-item>
        <el-descriptions-item label="告警时间">
          {{ format(fromUnixTime(pic.captureTime), 'yyyy-MM-dd HH:mm:ss') }}
        </el-descriptions-item>

        <el-descriptions-item label="置信度">
          {{ Math.floor(pic.confidence * 100) }}%
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </el-card>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { decodeBase64 } from '@vss/ai/util/base64'
import LocationsNew from '@vss/ai/component/LocationsNew.vue'
import { format, fromUnixTime } from 'date-fns'

@Component({
  name: 'PicCardNew',
  components: {
    LocationsNew
  }
})
export default class extends Vue {
  @Prop() private pic!: any
  @Prop() private type!: any
  private picInfo = null
  private isPicLoaded = true
  private decodeBase64: Function = decodeBase64

  private picRatio: any = {}

  private format = format
  private fromUnixTime = fromUnixTime

  private nopic() {
    const img: any = this.$refs.img
    this.isPicLoaded = false
    img.src = require('@vss/ai/assets/image-placeholder.png')
    img.onerror = null // 防止闪图
  }
  private viewDetail() {
    this.$emit('showDialogue', this.pic)
  }
  private onload(){
    const imgEle: any = this.$refs.img
    this.picRatio = {}
    this.$nextTick(() => {
      this.picRatio = {
              imgNaturalWidth: imgEle.naturalWidth,
              imgNaturalHeight: imgEle.naturalHeight,
              clientHeight: imgEle.clientHeight,
              clientWidth: imgEle.clientWidth,
              ratioW: imgEle.clientWidth / imgEle.naturalWidth,
              ratioH: imgEle.clientHeight / imgEle.naturalHeight
            }
    })

  }
}
</script>
<style lang="scss" scoped>
.el-card {
  // width:400px;
  cursor: pointer;
  // height:400px;
  // min-width: 100px;
  // margin-top: 2% !important;
  // margin-right: 2% !important;
  // display: inline-block;
  ::v-deep &__body {
    padding: 0 !important;
  }

  .pic-wrapper {
    position: relative;
    // line-height: 0;

    img {
      width: 100%;
      // height: 100%;
      max-height: 320px;
    }
  }

  .content-wrapper {
    // position: absolute;
    // bottom: 0;
    // left: 0;
    // height: 33%;
    padding: 10px 0;

    ::v-deep .el-descriptions-item__container {
      display: grid;
      grid-template-columns: 35% 65%;

      .el-descriptions-item__label.has-colon {
        text-align: end;
      }

      .el-descriptions-item__label {
        min-width: 0 !important;
      }
    }
  }
}
</style>
