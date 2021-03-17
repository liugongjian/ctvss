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
        <span slot-scope="{node, data}" class="custom-tree-node">
          <span class="node-name">
            <status-badge v-if="data.streamStatus" :status="data.streamStatus" />
            <svg-icon :name="data.type" color="#6e7c89" />
            {{ node.label }}
          </span>
        </span>
      </el-tree>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop, Inject } from 'vue-property-decorator'
import { GroupModule } from '@/store/modules/group'
import { Device } from '@/type/device'
import { getDeviceTree } from '@/api/device'
import StatusBadge from '@/components/StatusBadge/index.vue'

@Component({
  name: 'DeviceDir',
  components: {
    StatusBadge
  }
})
export default class extends Vue {
  @Inject('getDirPath') private getDirPath!: Function
  @Prop()
  private device!: Device
  private dialogVisible = true
  private submitting = false
  public dirList = []
  private currentDir: any = null
  public loading = {
    dir: false
  }

  private treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf'
  }

  /**
   * 当前业务组ID
   */
  private get groupId() {
    return GroupModule.group!.groupId
  }

  private async mounted() {
    await this.initDirs()
  }

  private async initDirs() {
    try {
      this.loading.dir = true
      const res = await getDeviceTree({
        groupId: this.groupId,
        id: 0
      })
      this.dirList = res.dirs
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
    const res = await getDeviceTree({
      groupId: this.groupId,
      id: node.data.id,
      type: node.data.type
    })
    resolve(res.dirs)
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
    }
  }
</style>
