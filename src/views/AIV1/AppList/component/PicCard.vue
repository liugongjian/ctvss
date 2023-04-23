
<template>
  <el-card @click.native="viewDetail">
    <div class="pic-wrapper">
      <img ref="img" :src="pic.image" @load="onload" @error="nopic">
      <Locations v-if="picInfo && isPicLoaded" :type="type" :img="picInfo" />
    </div>
    <div class="content-wrapper">
      <el-descriptions :column="1">
        <el-descriptions-item label="截图时间">
          {{ pic.time }}
        </el-descriptions-item>

        <el-descriptions-item label="设备名称">
          <el-tooltip class="item" effect="dark" :content="pic.deviceName" placement="bottom">
            <span>{{ (pic.deviceName && pic.deviceName.length > 10) ? pic.deviceName.slice(0,10) + '...' : pic.deviceName }}</span>
          </el-tooltip>
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
import Locations from '@/views/Dashboard/AI/components/Locations.vue'
import Attributes from '@/views/Dashboard/AI/components/Attributes.vue'
import { parseMetaData, transformLocationAi } from '@/utils/ai'

@Component({
  name: 'PicCard',
  components: {
    Locations,
    Attributes
  }
})
export default class extends Vue {
  @Prop() private pic!: any
  @Prop() private type!: any
  private picInfo = null
  private isPicLoaded = true
  private decodeBase64: Function = decodeBase64

  private onload() {
    if (!this.pic || !this.pic.image) {
      return
    }

    const metaData = JSON.parse(this.pic.metadata)
    const locations = parseMetaData(this.type, metaData)
    const img = this.$refs.img
    this.picInfo = { ...this.pic, locations: transformLocationAi(locations, img) }
  }
  private nopic() {
    const img: any = this.$refs.img
    this.isPicLoaded = false
    img.src = require('@/assets/dashboard/image-placeholder.png')
    img.onerror = null // 防止闪图
  }
  private viewDetail() {
    this.$emit('showDialogue', this.pic)
  }
}
</script>
<style lang='scss' scoped>
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
