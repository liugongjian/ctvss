<template>
  <div>
    <el-row>
      <el-button @click="handleButtonClick('off')">停用</el-button>
      <el-button @click="handleButtonClick('edit')">编辑</el-button>
      <el-button @click="handleButtonClick('del')">删除</el-button>
    </el-row>
    <el-row>
      <div class="title">
        <div class="title-block" />
        <span>人员聚集趋势</span>
      </div>
      <div>
        <span>应用状态：</span>
        <span>{{ appInfo.status }}</span>
      </div>
    </el-row>
    <el-row>
      <div class="title">
        <div class="title-block" />
        <span>人员聚集趋势</span>
      </div>
      <div class="content-wrapper">
        <div class="left">
          <div>
            <span>算法类型：</span>
            <span>{{ appInfo.status }}</span>
          </div>
          <div>
            <span>截帧频率：</span>
            <span>{{ appInfo.status }}</span>
          </div>
          <div>
            <span>存储周期：</span>
            <span>{{ appInfo.status }}</span>
          </div>
          <div>
            <span>描述：</span>
            <span>{{ appInfo.status }}</span>
          </div>
        </div>
        <div class="right">
          <div>
            <span>应用名称：</span>
            <span>{{ appInfo.status }}</span>
          </div>
          <div>
            <span>生效时段：</span>
            <span>{{ appInfo.status }}</span>
          </div>
          <div>
            <span>人脸库：</span>
            <span>{{ appInfo.status }}</span>
          </div>
        </div>
      </div>
    </el-row>
    <el-dialog
      :title="dialogTitle"
      :visible="dialogVisible"
      :close-on-click-modal="false"
      center
      width="500px"
      @close="closeDialog"
    >
      <span>您确定要{{ dialogTitle }}吗？</span>
      <div slot="footer" align="center">
        <el-button type="primary" @click="handleConfirm">{{ '确定' }}</el-button>
        <el-button @click="closeDialog">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
@Component({
  name: 'BasicAppInfo',
  components: {
  }
})
export default class extends Vue {
    private appName: String = null
    private dialogVisible: boolean = false
    private dialogTitle: String = ''
    private appInfo: any = {
      date: '人员布控03',
      name: '人员聚集',
      address: '分钟级',
      description: 'xxxxxxxxxxx',
      device: '3',
      status: '-1'
    }
    private getAppInfo(appname) {
      console.log(appname)
    }

    private mounted() {
      this.getAppInfo(this.$route.query.appname)
    }
    private handleButtonClick(option) {
      switch (option) {
        case 'on':
          this.dialogVisible = true
          this.dialogTitle = '启用该应用'
          break
        case 'off':
          this.dialogVisible = true
          this.dialogTitle = '停用该应用'
          break
        case 'edit':
          this.$router.push({
            name: `AI-EditApp`,
            query: {
              appinfo: this.appInfo
            }
          })
          break
        case 'del':
          this.dialogVisible = true
          this.dialogTitle = '删除该应用'
          break
      }
    }
    private closeDialog() {
      this.dialogVisible = false
    }
}
</script>

<style lang='scss' scoped>
.el-row{
    padding-left: 20px;
}
.title{
    margin-top: 30px;
    height: 50px;
    vertical-align: middle;
    &>div{
        // display: inline-block;
        padding-top: 5px;
    }
    .title-block{
        width: 7px;
        height: 15px;
        background-color: rgba(250, 131, 52, 1);
        border: none;
        margin-top: 2px;
        margin-right: 5px;
        display: inline-block;
    }
    span {
        font-weight: bold;
    }
    }
.content-wrapper{
    display: flex;
    align-items: flex-start;
    height: 200px;
    .left,.right{
        width:40%;
        display: flex;
        justify-content: flex-start;
        flex-direction: column;
        height: 100%;
        &>div{
            margin-bottom: 5%;
        }
    }
}
::v-deep .el-dialog__body{
    text-align: center;
    margin-bottom: 30px;
}
</style>
