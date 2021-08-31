
<template>
  <el-card shadow="hover">
    <div class="pic-wrapper">
      <el-image src="static/svg/u1851.svg" />
    </div>
    <div class="content-wrapper">
      <div class="prod-name">{{ prod.name }}</div>
      <div class="prod-desc">{{ prod.detail }}</div>
      <div class="oprator">
        <el-button type="warning" size="small" @click="onChooseProd">选择</el-button>
        <el-link type="warning">查看算法介绍</el-link>
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
.el-card{
    width:30%;
    height:40%;
    min-width: 100px;
    min-height: 240px;
    margin-top: 2%;
    margin-right: 2%;
    ::v-deep .el-card__body{
        height: 100%;
    }
    .pic-wrapper{
        width: 50px;
        height: 50px;
        // display: inline-block;
        float: left;
        border-radius: 50%;
        background-color: #f2f2f2;;
        position: relative;
        margin-right: 3%;
        .el-image{
            width:70%;
            height: 70%;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%,-50%);
        }

    }
    .content-wrapper{
        display: inline-block;
        width:80%;
        height: 100%;
        position: relative;
        .prod-name{
            font-weight: bold;
            font-size: 20px;
            margin-bottom: 15px;
        }
        .prod-desc{
            font-size: 23px;
            line-height: 35px;
        }
        .oprator{
            position: absolute;
            bottom: 2%;
            width: 100%;
            .el-button{
                margin-bottom: 2%;
                margin-right: 14%;
                width: 100px;
                height: 30px;
                padding: 4px 9px;
            }
        }

    }
}
</style>
