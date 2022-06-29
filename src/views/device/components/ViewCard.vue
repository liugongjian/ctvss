<template>
  <el-card @click.native="viewDetail">
    <div class="pic-wrapper">
      <img ref="img" :src="pic.imagePath" @error="nopic">
    </div>
    <div class="content-wrapper">
      <div>
        {{ `${id}id:` }}{{ pic.sourceId }}
      </div>
      <div>
        {{ pic.recordTime }}
      </div>
    </div>
  </el-card>
</template>
<script lang='ts'>
import { Component, Vue, Prop } from 'vue-property-decorator'
import { decodeBase64 } from '@/utils/base64'

@Component({
  name: 'ViewCard'
})
export default class extends Vue {
  @Prop() private pic!: any
  private picInfo: any = null
  private isPicLoaded: boolean = true
  private decodeBase64: Function = decodeBase64

  private get id() {
    switch (this.pic.type) {
      case 0:
        return '全部'
      case 1:
        return '人员'
      case 2:
        return '人脸'
      case 3:
        return '机动车'
      case 4:
        return '非机动车'
      default:
        return ''
    }
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
    line-height: 0;

    img {
      width: 100%;
      // height: 100%;
      height: 272px;
    }
  }

  .content-wrapper {
    // position: absolute;
    // bottom: 0;
    // left: 0;
    // height: 33%;
    padding: 10px 0;

    & > div {
      height: 50px;
      font-size: 12px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
