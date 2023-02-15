<template>
  <div class="app-container">
    <el-page-header content="业务组管理" @back="back" />
    <el-tabs v-model="activeName" type="border-card" @tab-click="switchTab">
      <el-tab-pane label="基本信息" name="info">
        <el-button v-permission="['*']" class="info-edit" @click="editForm"><svg-icon name="edit" /> 编辑</el-button>
        <info-list label-width="150">
          <info-list-item label="业务组ID:">{{ form.groupId }}</info-list-item>
          <info-list-item label="业务组名称:">{{ form.groupName }}</info-list-item>
          <info-list-item label="业务组描述:">{{ form.description }}</info-list-item>
          <info-list-item v-if="form.inProtocol !== 'vgroup'" label="设备地址:">{{ deviceAddress || '-' }}</info-list-item>
          <info-list-item v-if="form.industryCode" label="所属行业:">{{ industryMap[form.industryCode] }}</info-list-item>
          <info-list-item v-if="form.networkCode && networkFlag" label="网络标识:">{{ networkMap[form.networkCode] }}</info-list-item>
          <template v-if="!isVGroup">
            <info-list-item label="接入区域:">{{ form.regionName }}</info-list-item>
            <info-list-item label="接入类型:">{{ InProtocolType[form.inProtocol] }}</info-list-item>
            <info-list-item label="播放类型:">
              {{ form.outProtocol.map(item => OutProtocolType[item]).join(',') }}
            </info-list-item>
          </template>
          <!-- 以下字段仅在国标业务组中显示 -->
          <template v-if="form.inProtocol === 'gb28181'">
            <info-list-item label="自动拉流:">{{ PullType[form.pullType] }}</info-list-item>
            <info-list-item label="SIP服务器ID:">{{ form.sipId }}</info-list-item>
            <info-list-item label="SIP服务器域:">{{ sipDomain }}</info-list-item>
            <info-list-item label="SIP服务器地址:">{{ form.sipIp }}</info-list-item>
            <info-list-item label="SIP服务器TCP端口:">{{ form.sipTcpPort }}</info-list-item>
            <info-list-item label="SIP服务器UDP端口:">{{ form.sipUdpPort }}</info-list-item>
          </template>
          <!-- 以下字段仅在EHOME业务组中显示 -->
          <template v-if="form.inProtocol === 'ehome'">
            <info-list-item label="自动拉流:">{{ PullType[form.pullType] }}</info-list-item>
            <!-- <info-list-item label="EHOME服务器ID:">{{ form.sipId }}</info-list-item> -->
            <info-list-item label="EHOME服务器地址:">{{ form.sipIp }}</info-list-item>
            <info-list-item label="EHOME服务器TCP端口:">{{ form.sipTcpPort }}</info-list-item>
            <info-list-item label="EHOME服务器UDP端口:">{{ form.sipUdpPort }}</info-list-item>
          </template>
          <!-- 以下字段仅在RTMP/RTSP业务组中显示 -->
          <template v-if="form.inProtocol === 'rtsp' || form.inProtocol === 'rtmp'">
            <info-list-item label="自动拉流:">{{ PullType[form.pullType] }}</info-list-item>
            <info-list-item label="自动激活推流地址:">{{ PushType[form.pushType] }}</info-list-item>
          </template>
          <info-list-item label="接入网络:">
            {{ form.inNetworkType === 'private' ? '专线网络' : '互联网' }}
          </info-list-item>
          <info-list-item label="播放网络:">
            {{ form.outNetworkType === 'private' ? '专线网络' : '互联网' }}
          </info-list-item>
        </info-list>
      </el-tab-pane>
      <el-tab-pane v-if="!isVGroup" label="模板配置" name="template">
        <template-bind v-if="activeName==='template'" :group-id="form.groupId" :in-protocol="form.inProtocol" :disable-record-template="true" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Group } from '@/type/Group'
import { OutProtocolType, InProtocolType, PullType, PushType } from '@/dics'
import { queryGroup } from '@/api/group'
import { formatSeconds } from '@/utils/interval'
import { industryMap } from '@/assets/region/industry'
import { networkMap } from '@/assets/region/network'
import TemplateBind from '../components/TemplateBind.vue'

@Component({
  name: 'GroupConfig',
  components: {
    TemplateBind
  }
})
export default class extends Vue {
  private industryMap = industryMap
  private networkMap = networkMap
  private activeName = 'info'
  private InProtocolType = InProtocolType
  private OutProtocolType = OutProtocolType
  private PullType = PullType
  private PushType = PushType
  private form: Group = {
    groupId: '',
    groupName: '',
    description: '',
    inProtocol: '',
    outProtocol: [],
    region: '',
    sipId: undefined,
    sipIp: '',
    sipTcpPort: undefined,
    sipUdpPort: undefined,
    gbRegionNames: [],
    gbId: '',
    gbRegion: '',
    industryCode: '',
    networkCode: ''
  }
  private loading = false

  private formatSeconds = formatSeconds

  /**
   * SIP Domain
   */
  private get sipDomain() {
    return this.form.sipId && this.form.sipId.toString().substr(0, 10)
  }

  /**
   * 是否为虚拟组
   */
  private get isVGroup() {
    return this.form.inProtocol === '' || this.form.inProtocol === 'vgroup'
  }

  /**
   * 针对网络标识
   */
  private get networkFlag() {
    return this.$store.state.user.tags.isNeedDeviceNetworkCode === true
  }

  /**
   * 显示设备地址
   */
  private get deviceAddress() {
    return this.form.gbRegionNames && this.form.gbRegionNames.reverse().join('/')
  }

  private async mounted() {
    let query: any = this.$route.query
    if (query.groupId) {
      this.$set(this.form, 'groupId', query.groupId)
      try {
        const res = await queryGroup({ groupId: this.form.groupId })
        res.outProtocol = res.outProtocol.split(',')
        this.form = res
      } catch (e) {
        this.$message.error(e && e.message)
      }
    }
  }

  /**
   * 返回上页
   */
  private back() {
    this.$router.push('/group')
  }

  /**
   * 切换页面Tab
   */
  private async switchTab(tab: any) {
    this.activeName = tab.name
  }

  /**
   * 提交表单
   */
  private editForm() {
    this.$router.push({
      path: '/group/update',
      query: {
        groupId: this.form.groupId!.toString()
      }
    })
  }
}
</script>
<style lang="scss" scoped>
.template-edit {
  display: flex;

  &--value {
    min-width: 100px;
  }

  &--seperator {
    display: inline-block;
    width: 20px;
    text-align: center;
    color: $borderGrey;
  }
}

.info-edit {
  position: absolute;
  right: 20px;
  z-index: 10;
}

.template-edit {
  float: right;
  padding: 0;
  margin: 0;
}

.el-input,
.el-select,
.el-textarea {
  width: 400px;
}

.el-table {
  margin: 10px 0;
}
</style>
