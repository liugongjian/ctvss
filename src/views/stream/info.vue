<template>
  <div>
    <el-page-header content="流列表" @back="back" />
    <el-tabs v-model="activeName" type="border-card" @tab-click="handleClick">
      <el-tab-pane label="详细信息" name="info">
        <info-list label-width="100" title="基本信息">
          <info-list-item label="流名称:">{{ form.streamName || '-' }}</info-list-item>
          <info-list-item label="流ID:">{{ form.deviceId || '-' }}</info-list-item>
          <info-list-item label="视频编码:">{{ form.video && form.video.codec || '-' }}</info-list-item>
          <info-list-item label="开始推流时间:">{{ form.createTime || '-' }}</info-list-item>
          <info-list-item label="过期时间:">{{ form.expires || '-' }}</info-list-item>
          <info-list-item label="流状态:">{{ form.status === 'off' ? '下线' : '在线' }}</info-list-item>
        </info-list>
        <info-list label-width="100" title="推流地址" class="address">
          <info-list-item label="RTMP:">{{ form.pushUrl || '-' }}</info-list-item>
        </info-list>
        <info-list label-width="100" title="播放地址" class="address">
          <info-list-item label="RTMP:">{{ form.playUrl || '-' }}</info-list-item>
        </info-list>
      </el-tab-pane>
      <el-tab-pane label="模板管理" name="template">
        <template-bind v-if="activeName==='template'" :stream-id="form.deviceId" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Stream } from '@/type/stream'
import { getStream } from '@/api/stream'
import TemplateBind from '../components/templateBind.vue'
import copy from 'copy-to-clipboard'
import { pick } from 'lodash'

@Component({
  name: 'StreamInfo',
  components: {
    TemplateBind
  }
})
export default class extends Vue {
  private activeName = 'info'
  private groupId = ''
  private form: Stream = {
    deviceId: ''
  }
  private async mounted() {
    let query: any = this.$route.query
    if (query.deviceId) {
      this.$set(this.form, 'deviceId', query.deviceId)
      this.groupId = query.groupId
      try {
        const res = await getStream({ deviceId: this.form.deviceId })
        this.form = res
      } catch (e) {
        this.$message.error(e && e.message)
      }
    }
  }
  private copyUrl(text: string) {
    copy(text)
    this.$message.success('复制成功')
  }
  private async handleClick(tab: any, event: any) {
    this.activeName = tab.name
  }
  private back() {
    this.$router.push({
      path: '/stream/list',
      query: {
        groupId: this.groupId
      }
    })
  }
}
</script>
<style lang="scss" scoped>
.title {
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(227, 227, 227, 1);
}
.address {
    margin-top: 20px;
    ::v-deep .info-item {
      padding: 15px 0 5px 0;
    }
    ::v-deep .info-item--val {
      overflow: hidden;
      text-overflow:ellipsis;
      white-space: nowrap;
      position: relative;
      padding-right: 20px;

      .el-button--text {
        position: absolute;
        padding: 0;
        right: 0;
      }
    }
  }
</style>
