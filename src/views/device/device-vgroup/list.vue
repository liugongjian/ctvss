<template>
  <div ref="listWrap" class="device-list__container">
    <template v-if="!showRole && !showRealGroup">
      <component :is="realGroupInProtocol" ref="filterWrap" />
    </template>
    <template v-else-if="showRole">
      <el-table v-show="deviceList.length" key="show-role-table" :height="tableMaxHeight" :data="deviceList" empty-text="暂无授权角色" fit class="device-list__table" @row-click="rowClick">
        <el-table-column label="角色ID" prop="deviceId" />
        <el-table-column label="角色名" prop="deviceName" />
        <el-table-column label="角色描述" prop="description">
          <template slot-scope="row">
            {{ row.description || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="角色授权账号" prop="userName" />
        <el-table-column prop="createdTime" label="创建时间" align="center" />
      </el-table>
    </template>
    <template v-else-if="showRealGroup">
      <el-table v-show="deviceList.length" key="show-real-group-table" :height="tableMaxHeight" :data="deviceList" empty-text="暂无业务组" fit class="device-list__table" @row-click="rowClick">
        <el-table-column label="业务组ID/名称">
          <template slot-scope="{ row }">
            <div class="group-name">
              <div class="group-name__id">{{ row.deviceId }}</div>
              <div>
                {{ row.deviceName }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="业务组状态" align="center">
          <template slot-scope="{ row }">
            <status-badge :status="row.deviceEnabled ? 'on' : 'off'" />
            {{ groupStatus[row.deviceEnabled ? 'on' : 'off'] }}
          </template>
        </el-table-column>
        <el-table-column label="接入类型" align="center">
          <template slot-scope="{ row }">
            {{ inProtocolType[row.inProtocol] }}
          </template>
        </el-table-column>
        <el-table-column prop="devicePosition" label="接入区域" align="center" />
        <el-table-column prop="createdTime" label="创建时间" align="center" />
      </el-table>
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { GroupStatus, InProtocolType } from '@/dics'
import StatusBadge from '@/components/StatusBadge/index.vue'
import listMixin from '../mixin/listMixin'
import gb28181 from '../device-gb28181/list.vue'
import rtmp from '../device-rtmp/list.vue'
import rtsp from '../device-rtsp/list.vue'
import onvif from '../device-onvif/list.vue'
import ehome from '../device-ehome/list.vue'

@Component({
  name: 'DeviceVGroupList',
  components: {
    StatusBadge,
    gb28181,
    rtmp,
    rtsp,
    onvif,
    ehome
  }
})
export default class extends Mixins(listMixin) {
  private groupStatus = GroupStatus
  private inProtocolType = InProtocolType
  public get realGroupInProtocol() {
    return this.$route.query.realGroupInProtocol
  }
}
</script>
<style lang="scss" scoped>
.group-name {
  cursor: pointer;

  &__id {
    color: $primary;
  }
}
</style>
