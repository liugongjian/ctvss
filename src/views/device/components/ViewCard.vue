<template>
  <el-card @click.native="viewDetail">
    <div class="pic-wrapper">
      <img ref="img" :src="pic.image" @error="nopic">
    </div>
    <div class="content-wrapper">
      <el-descriptions :column="1" :colon="false">
        <el-descriptions-item>
          {{ pic.id }}
        </el-descriptions-item>

        <el-descriptions-item>
          {{ pic.time }}
        </el-descriptions-item>
      </el-descriptions>
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
  @Prop() private id!: any
  private picInfo = null
  private isPicLoaded: boolean = true
  private decodeBase64: Function = decodeBase64

  private nopic() {
    const img: any = this.$refs.img
    this.isPicLoaded = false
    img.src = require('@/assets/dashboard/image-placeholder.png')
    img.onerror = null // 防止闪图
  }
  private viewDetail() {
    this.$emit('showDialogue', this.pic, this.id)
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
      height: auto;
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
