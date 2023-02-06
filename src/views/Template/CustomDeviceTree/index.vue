<template>
  <div v-loading="loading" class="app-container">
    <el-card ref="deviceWrap" class="device-list-wrap">
        <div ref="dirList" class="device-list__left" :style="`width: ${dirDrag.width}px`">
          <div class="dir-list" :style="`width: ${dirDrag.width}px`">
            <div class="dir-list__tools">
              <el-tooltip v-if="!isVGroup && checkPermission(['AdminDevice'], {id: currentGroupId}) && !advancedSearchForm.revertSearchFlag" class="item" effect="dark" content="子目录排序" placement="top" :open-delay="300">
                <el-button type="text" @click.stop="openDialog('sortChildren', {id: '0'})"><svg-icon name="sort" /></el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="刷新目录" placement="top" :open-delay="300">
                <el-button type="text" @click="initDirs"><svg-icon name="refresh" /></el-button>
              </el-tooltip>
              <el-tooltip v-if="!isVGroup && checkPermission(['AdminDevice'], {id: currentGroupId}) && !advancedSearchForm.revertSearchFlag" class="item" effect="dark" content="添加目录" placement="top" :open-delay="300">
                <el-button type="text" @click="openDialog('createDir')"><svg-icon name="plus" /></el-button>
              </el-tooltip>
              <el-tooltip v-if="false" class="item" effect="dark" content="目录设置" placement="top" :open-delay="300">
                <el-button type="text"><i class="el-icon-setting" /></el-button>
              </el-tooltip>
            </div>
            <div v-loading="loading.dir" class="dir-list__tree device-list__max-height">
              <div class="dir-list__tree--root" :class="{'actived': isRootDir}" @click="gotoRoot">
                <svg-icon name="component" width="12px" />
                根目录
                <span class="sum-icon">{{ `(${rootSums.online}/${rootSums.total})` }}</span>
                <el-tooltip v-if="currentGroup.inProtocol === 'gb28181'" class="item" effect="dark" content="导出全部搜索结果" placement="top" :open-delay="300">
                  <el-button type="text" style="float: right; padding-top: 0; padding-bottom: 0;" :disabled="!advancedSearchForm.revertSearchFlag" @click.stop="exportSearchResult"><svg-icon :class="{export: !!advancedSearchForm.revertSearchFlag}" name="export" /></el-button>
                </el-tooltip>
              </div>
              <el-tree
                v-if="!advancedSearchForm.revertSearchFlag"
                key="device-el-tree-original"
                ref="dirTree"
                empty-text="暂无目录或设备"
                :data="dirList"
                node-key="id"
                highlight-current
                lazy
                :load="loadDirs"
                :props="treeProp"
                :current-node-key="defaultKey"
                @node-click="deviceRouter"
              >
                <span
                  slot-scope="{node, data}"
                  class="custom-tree-node"
                  :class="{'online': data.deviceStatus === 'on'}"
                >
                  <span class="node-name">
                    <svg-icon v-if="data.type !== 'dir' && data.type !== 'platformDir'" :name="data.type" width="15" height="15" />
                    <span v-else class="node-dir">
                      <svg-icon name="dir" width="15" height="15" />
                      <svg-icon name="dir-close" width="15" height="15" />
                    </span>
                    <status-badge v-if="data.type === 'ipc'" :status="data.streamStatus" />
                    <additional-status v-if="data.type === 'ipc'" :record-status="data.recordStatus" :alarm-info="data.alarmInfo" />
                    {{ node.label }}
                    <span class="sum-icon">{{ getSums(data) }}</span>
                    <span class="alert-type">{{ renderAlertType(data) }}</span>
                  </span>
                  <div v-if="!isVGroup && checkPermission(['AdminDevice'], data)" class="tools">
                    <template v-if="data.type !== 'ipc'">
                      <el-tooltip class="item" effect="dark" content="子目录排序" placement="top" :open-delay="300">
                        <el-button type="text" @click.stop="openDialog('sortChildren', data, node)"><svg-icon name="sort" /></el-button>
                      </el-tooltip>
                    </template>
                    <template v-if="data.type === 'dir' && !isVGroup && checkPermission(['AdminDevice'])">
                      <el-tooltip class="item" effect="dark" content="添加子目录" placement="top" :open-delay="300">
                        <el-button type="text" @click.stop="openDialog('createDir', data)"><svg-icon name="plus" /></el-button>
                      </el-tooltip>
                      <el-tooltip class="item" effect="dark" content="编辑目录" placement="top" :open-delay="300">
                        <el-button type="text" @click.stop="openDialog('updateDir', data)"><svg-icon name="edit" /></el-button>
                      </el-tooltip>
                      <el-tooltip class="item" effect="dark" content="删除目录" placement="top" :open-delay="300">
                        <el-button type="text" @click.stop="deleteDir(data)"><svg-icon name="trash" /></el-button>
                      </el-tooltip>
                    </template>
                  </div>
                </span>
              </el-tree>
              <el-tree
                v-else
                key="device-el-tree-filter"
                ref="dirTree"
                empty-text="暂无目录或设备"
                :data="dirList"
                node-key="id"
                highlight-current
                :props="treeProp"
                :current-node-key="defaultKey"
                default-expand-all
                @node-click="deviceRouter"
              >
                <span
                  slot-scope="{node, data}"
                  class="custom-tree-node"
                  :class="{'online': data.deviceStatus === 'on'}"
                >
                  <span class="node-name">
                    <svg-icon v-if="data.type !== 'dir' && data.type !== 'platformDir'" :name="data.type" width="15" height="15" />
                    <span v-else class="node-dir">
                      <svg-icon name="dir" width="15" height="15" />
                      <svg-icon name="dir-close" width="15" height="15" />
                    </span>
                    <status-badge v-if="data.type === 'ipc'" :status="data.streamStatus" />
                    <additional-status v-if="data.type === 'ipc'" :record-status="data.recordStatus" :alarm-info="data.alarmInfo" />
                    {{ node.label }}
                    <span class="sum-icon">{{ getSums(data) }}</span>
                    <span class="alert-type">{{ renderAlertType(data) }}</span>
                  </span>
                  <div v-if="!isVGroup && checkPermission(['AdminDevice'], data)" class="tools">
                    <template v-if="data.type === 'dir' && !isVGroup && checkPermission(['AdminDevice'])">
                      <el-tooltip class="item" effect="dark" content="编辑目录" placement="top" :open-delay="300">
                        <el-button type="text" @click.stop="openDialog('updateDir', data)"><svg-icon name="edit" /></el-button>
                      </el-tooltip>
                    </template>
                  </div>
                </span>
              </el-tree>
            </div>
        </div>
    </el-card>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Mixins, Provide } from 'vue-property-decorator'

@Component({
  name: 'CustomDeviceTree'
})
export default class extends Vue {
  
}
</script>
