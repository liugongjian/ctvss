<template>
  <el-dialog
    title="子目录排序"
    :visible="dialogVisible"
    :close-on-click-modal="true"
    width="700px"
    center
    @close="closeDialog"
  >
    <div class="sort-tip">提示：仅支持对目录或NVR下同级设备进行拖拽排序</div>
    <div v-loading="loading.dialog" class="tree-container">
      <el-tree
        ref="dirTree"
        node-key="id"
        highlight-current
        draggable
        :data="dirData"
        :props="treeProp"
        :allow-drag="allowDrag"
        :allow-drop="allowDrop"
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
      <el-button type="primary" :loading="loading.submitting" @click="submit">确 定</el-button>
      <el-button @click="closeDialog">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { GroupModule } from '@/store/modules/group'
import { getDeviceTree, sortDeviceTree } from '@/api/device'

@Component({
  name: 'SortChildren',
  components: {
  }
})
export default class extends Vue {
  @Prop()
  private currentDir!: any
  @Prop()
  private inProtocol!: any

  private dialogVisible = true
  private loading: any = {
    dialog: false,
    submitting: false
  }
  private dirData: any = []

  private treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf'
  }

  private mounted() {
    this.initTreeStatus(this.currentDir)
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
  private async initTreeStatus(currentDir: any) {
    try {
      this.loading.dialog = true
      let res = await getDeviceTree({
        groupId: this.groupId,
        id: currentDir.id,
        type: currentDir.type
      })
      this.dirData = res.dirs
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading.dialog = false
    }
  }

  private allowDrag() {
    return true
  }

  private allowDrop(draggingNode: any, dropNode: any, type: any) {
    return type !== 'inner'
  }

  private async submit() {
    try {
      this.loading.submitting = true
      let sortArr = this.dirData.map((item: any, index: any) => {
        return {
          id: item.id,
          type: item.type,
          inProtocol: this.inProtocol,
          parentDeviceId: this.currentDir.type === 'nvr' ? this.currentDir.id : '',
          orderSequence: index
        }
      })
      if (sortArr.length === 0) {
        this.closeDialog()
        return
      }
      let params = { orderDevices: sortArr }
      await sortDeviceTree(params)
      this.$message.success('排序保存成功！')
      this.closeDialog(true)
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading.submitting = false
    }
  }

  private closeDialog(isRefresh: boolean = false) {
    this.dialogVisible = false
    this.$emit('on-close', isRefresh)
  }
}
</script>
<style lang="scss" scoped>
  .tree-container {
    overflow: auto;
    height: 40vh;
    text-align: center;
    border: 1px solid #ccc;
    background: #fff;
    padding: 15px 0;
    margin-bottom: 10px;
    border-radius: 5px;

    ::v-deep .custom-tree-node {
      cursor: move;
    }
  }

  .sort-tip {
    margin-bottom: 10px;
    color: $textGrey;
  }
</style>
