<template>
  <el-dialog
    :visible="dialogVisible"
    title="直播地址"
    :close-on-click-modal="false"
    @close="closeDialog"
  >
    <el-row>
      <label>播流域名</label>
      <el-select
        v-model="pullStreamDomain"
        placeholder="请选择"
      >
        <el-option
          v-for="item in pullStreamDomainList"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
    </el-row>
    <el-row v-if="streamInfo.type===1">
      <label>转码模板</label>
      <el-select
        v-model="transcodeTemplate"
        value-key="transcodeTemplateName"
        placeholder="请选择"
      >
        <el-option
          v-for="item in transcodeTemplateList"
          :key="item.transcodeTemplateName"
          :label="item.transcodeTemplateName"
          :value="item"
        />
      </el-select>
    </el-row>
    <span>
      <el-row>
        <div class="text">RTMP:&nbsp;&nbsp;&nbsp;{{ transcodeTemplate.rtmp }}</div>
        <el-button
          type="text"
          @click="copyAddress(transcodeTemplate.rtmp)"
        >复制</el-button>
      </el-row>
      <el-row>
        <div class="text">FLV:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ transcodeTemplate.flv }}</div>
        <el-button
          type="text"
          @click="copyAddress(transcodeTemplate.flv)"
        >复制</el-button>
      </el-row>
      <el-row>
        <div class="text">HLS:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ transcodeTemplate.hls }}</div>
        <el-button
          type="text"
          @click="copyAddress(transcodeTemplate.hls)"
        >复制</el-button>
      </el-row>
    </span>
    <div
      slot="footer"
      class="dialog-footer"
      align="center"
    >
      <el-button
        type="primary"
        @click="closeDialog()"
      >
        确定
      </el-button>
      <el-button @click="closeDialog()">
        取消
      </el-button>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import copy from 'copy-to-clipboard'

@Component({
  name: 'DialogAddr'
})
export default class extends Vue {
    @Prop(Object) private streamInfo!: Object;
    private dialogVisible = true;
    private pullStreamDomainList = [];
    private pullStreamDomain = '';
    private transcodeTemplateList = [];
    private transcodeTemplate = '';

    private closeDialog() {
      this.dialogVisible = false
      this.$emit('on-close')
    }

    private copyAddress(text:string) {
      copy(text)
      this.$message({
        message: '复制成功',
        type: 'success'
      })
    }
}
</script>

<style lang="scss" scoped>
.copy-style{
  float: right;
  clear: both;
}
.el-row {
  margin-top: 10px;
  margin-bottom: 10px;
  display: flex;

  label{
    flex: 1;
    height: 36px;
    line-height: 36px;
  }
  .el-select {
  flex: 7;
}
.text{
  flex:7;
  word-break:break-all;
  height: 36px;
    line-height: 36px;
}
button{
  flex: 1;
}
}
.el-dialog {
    max-width: 800px;
    width: 60%;
}

</style>
