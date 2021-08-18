
<template>
  <el-card>
    <div class="pic-wrapper">
      <el-image src="static/svg/u1851.svg" />
    </div>
    <div class="content-wrapper">
      <div class="prod-name">{{ pic.time }}</div>
      <div class="prod-desc">{{ pic.device }}</div>
      <div class="prod-desc">{{ pic.rate }}</div>
    </div>
  </el-card>
</template>
<script>
/* eslint-disable vue/require-prop-types */
export default {
  props: ['pic'],
  data() {
    return {
    }
  },
  methods: {
  }
}
</script>
<style lang='scss' scoped>
.el-card{
    width:30%;
    height:40%;
    min-width: 100px;
    margin-top: 2%;
    display: inline-block;
    ::v-deep .el-card__body{
        height: 100%;
    }
    .pic-wrapper{
        width: 50px;
        height: 50px;
        display: inline-block;
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
            margin-bottom: 15px;
        }
        .prod-desc{
            font-size: 14px;
        }
        .oprator{
            position: absolute;
            bottom: 2%;
            width: 100%;
            .el-button{
                margin-bottom: 2%;
                margin-right: 14%;
                width: 90px;
                height: 25px;
                padding: 4px 9px;
            }
        }

    }
}
</style>
