
<template>
  <el-card shadow="hover">
    <div class="pic-wrapper">
      <el-image :src="require(`../../assets/icon/${prod.code}.svg`)" />
    </div>
    <div class="content-wrapper">
      <div class="prod__name">{{ prod.name }}</div>
      <div class="prod__desc">{{ prod.summary }}</div>
      <div class="prod__buttons">
        <el-button type="primary" class="prod__buttons--select" @click="onChooseProd">选择</el-button>
        <!-- <el-button type="text" class="ml10">查看算法介绍</el-button> -->
      </div>
    </div>
  </el-card>
</template>
<script lang='ts'>
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({
  name: 'ProdCard',
  components: {
  }
})
export default class extends Vue {
  @Prop() private prod!: any

  private onChooseProd() {
    this.$emit('changeStep', { step: 1, prod: this.prod })
  }
}
</script>
<style lang='scss' scoped>
.el-card {
  ::v-deep .el-card__body {
    height: 100%;
  }

  .pic-wrapper {
    width: 50px;
    height: 50px;
    float: left;
    border-radius: 50%;
    background-color: #f2f2f2;;
    margin-right: 3%;
    display: flex;
    justify-content: center;
    align-items: center;
    .el-image {
      width: 62%;
      height: 62%;
    }
  }
  .content-wrapper {
    display: inline-block;
    position: relative;
    width:80%;
    height: 100%;
    min-height: 150px;
    .prod__name {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .prod__desc {
      line-height: 150%;
      color: $textGrey;
      min-height: 50px;
    }
    .prod__buttons {
      position: absolute;
      bottom:-8px;
      &--select {
        padding: 10px 30px;
      }
    }
  }
}
</style>
