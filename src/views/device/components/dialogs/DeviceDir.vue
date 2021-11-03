<template>
  <el-dialog
    title="选择设备"
    :visible="dialogVisible"
    :close-on-click-modal="true"
    width="400px"
    center
    @close="closeDialog"
  >
    <div v-loading="loading.dir" class="tree-wrap">
      <el-tree
        ref="dirTree"
        node-key="id"
        highlight-current
        lazy
        :data="dirList"
        :load="loadDirs"
        :props="treeProp"
        @node-click="selectDevice"
      >
        <span
          slot-scope="{node, data}"
          class="custom-tree-node"
          :class="{'online': data.deviceStatus === 'on'}"
        >
          <span class="node-name">
            <status-badge v-if="data.type === 'ipc'" :status="data.streamStatus" />
            <svg-icon :name="data.type" />
            {{ node.label }}
          </span>
        </span>
      </el-tree>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import DeviceMixin from '../../mixin/deviceMixin'
import { GroupModule } from '@/store/modules/group'
import { Device } from '@/type/device'
import { getDeviceTree } from '@/api/device'
import { VGroupModule } from '@/store/modules/vgroup'
import StatusBadge from '@/components/StatusBadge/index.vue'

@Component({
  name: 'DeviceDir',
  components: {
    StatusBadge
  }
})
export default class extends Mixins(DeviceMixin) {
  @Prop()
  private device!: Device
  private dialogVisible = true
  private submitting = false
  public dirList = []
  private currentDir: any = null

  /**
   * 当前业务组ID
   */
  private get groupId() {
    return GroupModule.group!.groupId
  }

  private async mounted() {
    await this.initDirs()
  }

  public async initDirs() {
    try {
      VGroupModule.resetVGroupInfo()
      this.loading.dir = true
      const res = await getDeviceTree({
        groupId: this.currentGroupId,
        id: 0
      })
      this.dirList = this.setDirsStreamStatus(res.dirs)
    } catch (e) {
      this.dirList = []
      console.log(e)
    } finally {
      this.loading.dir = false
    }
  }

  /**
   * 加载目录
   */
  private async loadDirs(node: any, resolve: Function) {
    if (node.level === 0) return resolve([])

    if (node.data.type === 'role') {
      node.data.roleId = node.data.id
    } else if (node.data.type === 'group') {
      node.data.realGroupId = node.data.id
      node.data.realGroupInProtocol = node.data.inProtocol
    }
    VGroupModule.SetRoleID(node.data.roleId || '')
    VGroupModule.SetRealGroupId(node.data.realGroupId || '')
    VGroupModule.SetRealGroupInProtocol(node.data.realGroupInProtocol || '')

    try {
      const res = await getDeviceTree({
        groupId: this.groupId,
        id: node.data.id,
        type: node.data.type
      })
      res.dirs.forEach((dir: any) => {
        dir.roleId = node.data.roleId || ''
        dir.realGroupId = node.data.realGroupId || ''
        dir.realGroupInProtocol = node.data.realGroupInProtocol || ''
      })
      res.dirs = this.setDirsStreamStatus(res.dirs)
      resolve(res.dirs)
    } catch (e) {
      resolve([])
    }
  }

  /**
   * 设置目录树设备流状态
   */
  private setDirsStreamStatus(dirs: any) {
    return dirs.map((dir: any) => {
      if (!dir.streamStatus && dir.deviceStreams && dir.deviceStreams.length > 0) {
        const hasOnline = dir.deviceStreams.some((stream: any) => {
          return stream.streamStatus === 'on'
        })
        if (hasOnline) {
          dir.streamStatus = 'on'
        }
      }
      return dir
    })
  }

  private selectDevice(dir: any) {
    if (dir.type === 'ipc') {
      this.closeDialog(dir)
    }
  }

  private closeDialog(device: Device) {
    this.dialogVisible = false
    this.$emit('on-close', device)
  }
}
</script>
<style lang="scss" scoped>
  .tree-wrap {
    height: 300px;
    overflow: auto;
    .svg-icon {
      margin-right: 5px;
      color: #6e7c89;
    }
    .custom-tree-node.online .node-name {
      .svg-icon {
        color: #65c465;
      }
    }
    .node-name {
      position: relative;
    }
    .status-badge {
      position: absolute;
      top: -1px;
      left: -3px;
      width: 6px;
      height: 6px;
      opacity: 0.7;
      display: none;
      &--on {
        display: block;
      }
    }
  }
</style>
