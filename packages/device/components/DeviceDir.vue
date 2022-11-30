<template>
  <el-dialog
    title="选择设备"
    :visible="dialogVisible"
    :append-to-body="true"
    :close-on-click-modal="true"
    width="400px"
    center
    @close="closeDialog"
  >
    <div class="tree-wrap">
      <simple-device-tree
        ref="deviceTree"
        :device-in-type="deviceInTypeEnum.Video"
        @handle-node="selectDevice"
      />
      <!-- <el-tree
        v-if="!outerSearch.revertSearchFlag"
        key="device-dir-el-tree-original"
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
          slot-scope="{ node, data }"
          class="custom-tree-node"
          :class="{ 'online': data.deviceStatus === 'on' }"
        >
          <span class="node-name">
            <status-badge v-if="data.type === 'ipc'" :status="data.streamStatus" />
            <svg-icon :name="data.type" />
            {{ node.label }}
            <span class="sum-icon">{{ getSums(data) }}</span>
          </span>
        </span>
      </el-tree>
      <el-tree
        v-else
        key="device-dir-el-tree-filter"
        ref="dirTree"
        node-key="id"
        highlight-current
        :data="dirList"
        :props="treeProp"
        default-expand-all
        @node-click="selectDevice"
      >
        <span
          slot-scope="{ node, data }"
          class="custom-tree-node"
          :class="{ 'online': data.deviceStatus === 'on' }"
        >
          <span class="node-name">
            <status-badge v-if="data.type === 'ipc'" :status="data.streamStatus" />
            <svg-icon :name="data.type" />
            {{ node.label }}
            <span class="sum-icon">{{ getSums(data) }}</span>
          </span>
        </span>
      </el-tree> -->
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import SimpleDeviceTree from '@vss/device/components/Tree/SimpleDeviceTree.vue'
import { DirectoryTypeEnum, DeviceInTypeEnum } from '@vss/device/enums/index'

@Component({
  name: 'DeviceDir',
  components: {
    SimpleDeviceTree
  }
})
export default class extends Vue {
  private deviceInTypeEnum = DeviceInTypeEnum
  private dialogVisible = true
  private selectDevice(dir: any) {
    if (dir.type === DirectoryTypeEnum.Ipc) {
      this.closeDialog(dir)
    }
  }

  private closeDialog(device) {
    this.dialogVisible = false
    this.$emit('on-close', device)
  }
}
</script>
<style lang="scss" scoped>
  .tree-wrap {
    height: 300px;
    overflow: auto;
    display: flex;
  }
</style>
