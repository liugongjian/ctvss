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
      >
        {{ item.name }}
      </span>
    </div>
    <div class="tree-wrap">
      <el-tree
        ref="dirTree"
        v-loading="loading"
        node-key="id"
        highlight-current
        lazy
        :load="loadDirs"
        :props="treeProp"
        :expand-on-click-node="false"
        @node-click="selectDir"
      >
        <span slot-scope="{ node, data }" class="custom-tree-node">
          <span class="node-name">
            <svg-icon :name="data.type" color="#6e7c89" />
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
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getNodeInfo, getDirPath, bindDir } from '../api/dir'
import { DirectoryTypeEnum, DeviceEnum } from '@vss/device/enums/index'

@Component({
  name: 'MoveDir',
  components: {
  }
})
export default class extends Vue {
  @Prop()
  private device
  @Prop()
  private devices
  @Prop()
  private isBatch!: boolean

  private dialogVisible = true
  private loading = false
  private submitting = false
  private breadcrumb: Array<any> = []
  private currentDir: any = null
  private rootNode = {
    data: {
      name: '根目录',
      id: '',
      type: 'dir'
    }
  }

  private treeProp = {
    label: 'name',
    children: 'children',
    isLeaf: 'isLeaf'
  }

  private mounted() {
    this.$nextTick(() => {
      this.initTreeStatus()
    })
  }

  /**
   * 初始化目录状态
   */
  private async initTreeStatus() {
    this.loading = true
    const dirTree: any = this.$refs.dirTree
    const node = dirTree.getNode(this.rootNode.data.id)
    const dirs = await this.getChildren(node.data)
    dirTree.updateKeyChildren(node.data.id, dirs)
    node.expanded = true
    node.loaded = true
    this.loading = false
  }

  /**
   * 加载目录
   */
  private async loadDirs(node: any, resolve: Function) {
    if (node.level === 0) {
      return resolve(
        [this.rootNode.data]
      )
    }
    const dirs = await this.getChildren(node.data)
    resolve(dirs)
  }

  /**
   * 获取菜单树
   */
  private async getChildren(data: any) {
    try {
      const res = await getNodeInfo({
        id: data.id,
        type: data.type
      })
      const dirs = res.dirs.filter((dir: any) => {
        return dir.type === DirectoryTypeEnum.Dir
      })
      return dirs
    } catch (e) {
      return []
    }
  }

  private async selectDir(dir: any) {
    if (!dir.id) {
      this.breadcrumb = [{ id: '', name: '根目录', type: DirectoryTypeEnum.Dir }]
    } else {
      const res = await getDirPath({ id: dir.id, type: DirectoryTypeEnum.Dir })
      this.breadcrumb = [{ id: '', name: '根目录', type: DirectoryTypeEnum.Dir }, ...res.dirPathList]
    }
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
            this.devices.map(device => {
              return bindDir({
                [DeviceEnum.DirId]: this.currentDir.id,
                [DeviceEnum.DeviceId]: device[DeviceEnum.DeviceId]
              })
            })
          )
        } else {
          await bindDir({
            [DeviceEnum.DirId]: this.currentDir.id,
            [DeviceEnum.DeviceId]: this.device[DeviceEnum.DeviceId]
          })
        }
        this.$message.success('移动设备成功！')
      } catch (e) {
        console.log(e)
        this.$message.error(e && e.message)
      } finally {
        this.submitting = false
      }
      this.closeDialog(true)
    })
  }

  private closeDialog(isRefresh = false) {
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
