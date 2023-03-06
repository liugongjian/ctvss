<template>
  <el-dialog
    title="移动至"
    :visible="dialogVisible"
    :close-on-click-modal="true"
    width="700px"
    center
    @close="closeDialog"
  >
    <div class="breadcrumb">
      <label>移动至:</label>
      <span
        v-for="item in breadcrumb"
        :key="item.id"
        class="breadcrumb__item"
        @click="deviceRouter(item)"
      >
        {{ item.label }}
      </span>
    </div>
    <div class="tree-wrap">
      <el-tree
        ref="dirTree"
        node-key="id"
        highlight-current
        lazy
        :load="loadDirs"
        :props="treeProp"
        @node-click="selectDir"
      >
        <span slot-scope="{node, data}" class="custom-tree-node">
          <span class="node-name">
            <svg-icon v-if="data.type !== 'dir' && data.type !== 'platformDir'" :name="data.type" width="15" height="15" />
            <span v-else class="node-dir">
              <svg-icon name="dir" width="15" height="15" />
              <svg-icon name="dir-close" width="15" height="15" />
            </span>
            {{ node.label }}
          </span>
        </span>
      </el-tree>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="submitting" @click="submit">确 定</el-button>
      <el-button @click="closeDialog">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop, Inject } from 'vue-property-decorator'
import { DeviceModule } from '@/store/modules/device'
import { GroupModule } from '@/store/modules/group'
import { Device } from '@/type/Device'
import { getDeviceTree } from '@/api/device'
import { bindDir } from '@/api/dir'

@Component({
  name: 'MoveDir',
  components: {
  }
})
export default class extends Vue {
  @Inject('initDirs') private initDirs!: Function
  @Inject('getDirPath') private getDirPath!: Function
  @Prop()
  private device!: Device
  @Prop()
  private devices!: Array<Device>
  @Prop()
  private isBatch!: boolean
  @Prop()
  private inProtocol!: string

  private dialogVisible = true
  private submitting = false
  private breadcrumb: Array<any> = []
  private currentDir: any = null

  private treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf'
  }

  private mounted() {
    this.$nextTick(() => {
      this.initTreeStatus()
    })
  }

  /**
   * 当前目录路径
   */
  private get dirPath() {
    return DeviceModule.breadcrumb
  }

  /**
   * 当前业务组ID
   */
  private get groupId() {
    return GroupModule.group!.groupId
  }

  /**
   * 初始化目录状态
   */
  private async initTreeStatus() {
    const dirTree: any = this.$refs.dirTree
    const root = [{
      id: '0'
    }]
    const dirPath = root.concat(this.dirPath)
    if (dirPath) {
      dirPath.forEach(async(dir: any) => {
        const node = dirTree.getNode(dir.id)
        if (node) {
          await this.loadDirChildren(dir.id, node)
        }
      })
    }
  }
  /**
   * 加载子目录
   */
  private async loadDirChildren(key: string, node: any) {
    const dirTree: any = this.$refs.dirTree
    let dirs = await this.getTree(node)
    dirTree.updateKeyChildren(key, dirs)
    node.expanded = true
    node.loaded = true
  }

  /**
   * 加载目录
   */
  private async loadDirs(node: any, resolve: Function) {
    if (node.level === 0) {
      return resolve(
        [{
          label: '根目录',
          id: '0',
          type: 'dir'
        }]
      )
    }
    const dirs = await this.getTree(node)
    resolve(dirs)
  }

  /**
   * 获取菜单树
   */
  private async getTree(node: any) {
    try {
      const res = await getDeviceTree({
        groupId: this.groupId,
        id: node.data.id,
        type: 'dir'
      })
      const dirs = res.dirs.filter((dir: any) => {
        return dir.type === 'dir'
      })
      return dirs
    } catch (e) {
      return []
    }
  }

  private selectDir(dir: any) {
    const dirTree: any = this.$refs.dirTree
    const node = dirTree.getNode(dir.id)
    this.breadcrumb = this.getDirPath(node).reverse()
    this.currentDir = dir
  }

  private async submit() {
    if (!this.currentDir) {
      this.$message.error('未选择目标目录')
      return
    }
    this.$confirm('移动此设备后，如果存在上级级联则需要重新添加。是否确定要移动此设备？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async() => {
      try {
        this.submitting = true
        if (this.isBatch) {
          await Promise.all(
            this.devices.map((device: Device) => {
              return bindDir({
                dirId: this.currentDir.id,
                deviceId: device.deviceId,
                inProtocol: this.inProtocol
              })
            })
          )
        } else {
          await bindDir({
            dirId: this.currentDir.id,
            deviceId: this.device.deviceId,
            inProtocol: this.inProtocol
          })
        }
        this.initDirs()
        this.$message.success('移动设备成功！')
      } catch (e) {
        this.$message.error(e && e.message)
      } finally {
        this.submitting = false
      }
      this.closeDialog(true)
    })
  }

  private closeDialog(isRefresh: boolean = false) {
    this.dialogVisible = false
    this.$emit('on-close', isRefresh)
  }
}
</script>
<style lang="scss" scoped>
  .tree-wrap {
    height: 300px;
    overflow: auto;
  }

  .breadcrumb {
    height: 50px;
    line-height: 50px;
    padding-left: 20px;
    border: 1px solid $primary;
    background: #f8f8f8;
    transition: padding-left 0.2s;
    margin-bottom: 10px;

    label {
      margin-right: 20px;
      color: $textGrey;
    }

    &__item {
      cursor: pointer;
    }

    &__item:after {
      content: '>';
      color: $textGrey;
      margin: 0 10px;
    }

    &__item:last-child:after {
      content: '';
    }
  }
</style>
