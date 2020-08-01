<template>
  <div class="app-container">
    <el-page-header content="业务组配置" @back="back" />
    <el-tabs v-model="activeName" type="border-card" @tab-click="handleClick">
      <el-tab-pane label="基本信息" name="info">
        <!-- <el-button type="text" class="info-edit" @click="editForm">编辑</el-button> -->
        <info-list label-width="150">
          <info-list-item label="业务组ID:">{{ form.groupId }}</info-list-item>
          <info-list-item label="业务组名称:">{{ form.groupName }}</info-list-item>
          <info-list-item label="业务组描述:">{{ form.description }}</info-list-item>
          <info-list-item label="服务区域:">{{ form.region }}</info-list-item>
          <info-list-item label="接入类型:">{{ InProtocolType[form.inProtocol] }}</info-list-item>
          <info-list-item
            label="播放类型:"
          >
            {{ form.outProtocol.map(item => OutProtocolType[item]).join(',') }}
          </info-list-item>
          <info-list-item label="SIP服务器ID:">{{ form.sipId }}</info-list-item>
          <info-list-item label="SIP服务器地址:">{{ form.sipIp }}</info-list-item>
          <info-list-item label="SIP服务器TCP端口:">{{ form.sipTcpPort }}</info-list-item>
          <info-list-item label="SIP服务器UDP端口:">{{ form.sipUdpPort }}</info-list-item>
        </info-list>
      </el-tab-pane>
      <el-tab-pane v-if="false" label="模板配置" name="template">
        <div>
          <el-button type="text" class="template-edit" @click="setRecordTemplate">编辑</el-button>
          <info-list title="录制模板">
            <el-table :data="template.recordTemplate" fit>
              <el-table-column prop="templateName" label="模板名称" />
              <el-table-column prop="interval" label="周期时长" :formatter="formatSeconds" />
              <el-table-column prop="storeType" label="录制格式">
                <template slot-scope="{row}">
                  {{ row.storeType.join(',') }}
                </template>
              </el-table-column>
            </el-table>
          </info-list>
        </div>
        <div>
          <el-button type="text" class="template-edit" @click="setSnapshotTemplate">编辑</el-button>
          <info-list title="截图模板">
            <el-table :data="template.snapshotTemplate" fit>
              <el-table-column prop="templateName" label="模板名称" />
              <el-table-column prop="interval" label="周期时长" :formatter="formatSeconds" />
              <el-table-column prop="storeType" label="录制格式">
                <template slot-scope="{row}">
                  {{ row.storeType.join(',') }}
                </template>
              </el-table-column>
            </el-table>
          </info-list>
        </div>
      </el-tab-pane>
    </el-tabs>

    <SetRecordTemplate
      v-if="setRecordTemplateDialog"
      :group-id="form.groupId"
      :selected-list="template.recordTemplate"
      @on-close="closeSetRecordTemplateDialog"
    />
    <SetSnapshotTemplate
      v-if="setSnapshotTemplateDialog"
      :group-id="form.groupId"
      :selected-list="template.snapshotTemplate"
      @on-close="closeSetSnapshotTemplateDialog"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Group } from '@/type/group'
import { OutProtocolType, InProtocolType } from '@/dics'
import SetRecordTemplate from '../components/dialogs/SetRecordTemplate.vue'
import SetSnapshotTemplate from '../components/dialogs/SetSnapshotTemplate.vue'
import { queryGroup, getGroupTemplate } from '@/api/group'
import { formatSeconds } from '@/utils/interval'

@Component({
  name: 'GroupConfig',
  components: {
    SetRecordTemplate,
    SetSnapshotTemplate
  }
})
export default class extends Vue {
  private activeName = 'info'
  private InProtocolType = InProtocolType
  private OutProtocolType = OutProtocolType
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
    sipUdpPort: undefined
  }
  private template = {
    snapshotTemplate: [],
    recordTemplate: []
  }
  private setRecordTemplateDialog = false
  private setSnapshotTemplateDialog = false

  private formatSeconds = formatSeconds
  private back() {
    this.$router.push('/group')
  }

  private async handleClick(tab: any, event: any) {
    this.activeName = tab.name
    if (this.activeName === 'template') {
      try {
        const res = await getGroupTemplate({ groupId: this.form.groupId })
        this.template.recordTemplate = res.recordTemplate
        this.template.snapshotTemplate = res.snapshotTemplate
      } catch (e) {
        this.$message.error(e)
      }
    }
  }

  private editForm() {
    this.$router.push({
      path: '/group/update',
      query: {
        groupId: this.form.groupId!.toString()
      }
    })
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
        this.$message.error(e)
      }
    }
  }

  private setRecordTemplate() {
    this.setRecordTemplateDialog = true
  }

  private setSnapshotTemplate() {
    this.setSnapshotTemplateDialog = true
  }

  private closeSetRecordTemplateDialog() {
    this.setRecordTemplateDialog = false
  }

  private closeSetSnapshotTemplateDialog() {
    this.setSnapshotTemplateDialog = false
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
  right: 40px;
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
