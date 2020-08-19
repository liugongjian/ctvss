<template>
  <div v-loading="loading.group" class="app-container">
    <div class="filter-container">
      <el-select
        v-model="groupId"
        class="filter-group"
        placeholder="请选择业务组"
        @change="changeGroup"
      >
        <el-option
          v-for="item in groupList"
          :key="item.groupId"
          :label="item.groupName"
          :value="item.groupId"
        />
      </el-select>
    </div>
    <el-card ref="deviceWrap" class="device-list-wrap">
      <div class="device-list" :class="{'device-list--collapsed': !isExpanded, 'device-list--dragging': dirDrag.isDragging}">
        <el-button class="device-list__expand" @click="toggledirList">
          <svg-icon name="hamburger" />
        </el-button>
        <div
          class="device-list__handle"
          :style="`left: ${dirDrag.width}px`"
          @mousedown="changeWidthStart($event)"
        />
        <div ref="dirList" class="device-list__left" :style="`width: ${dirDrag.width}px`">
          <div class="dir-list" :style="`width: ${dirDrag.width}px`">
            <div class="dir-list__tools">
              <el-tooltip class="item" effect="dark" content="添加目录" placement="top" :open-delay="300">
                <el-button type="text" @click="openDialog('createDir')"><i class="el-icon-plus" /></el-button>
              </el-tooltip>
              <el-tooltip v-if="false" class="item" effect="dark" content="目录设置" placement="top" :open-delay="300">
                <el-button type="text"><i class="el-icon-setting" /></el-button>
              </el-tooltip>
            </div>
            <div v-loading="loading.dir" class="dir-list__tree device-list__max-height" :style="{height: `${maxHeight}px`}">
              <div class="dir-list__root" @click="gotoRoot"><svg-icon name="back" />返回根目录</div>
              <el-tree
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
                <span slot-scope="{node, data}" class="custom-tree-node">
                  <span class="node-name">
                    <svg-icon :name="data.type" color="#6e7c89" />
                    <status-badge v-if="data.streamStatus" :status="data.streamStatus" />
                    {{ node.label }}
                  </span>
                  <div v-if="data.type === 'dir'" class="tools" :style="`left: ${dirDrag.width - 80}px`">
                    <el-tooltip class="item" effect="dark" content="添加子目录" placement="top" :open-delay="300">
                      <el-button type="text" @click.stop="openDialog('createDir', data)"><i class="el-icon-plus" /></el-button>
                    </el-tooltip>
                    <el-tooltip class="item" effect="dark" content="编辑目录" placement="top" :open-delay="300">
                      <el-button type="text" @click.stop="openDialog('updateDir', data)"><i class="el-icon-edit" /></el-button>
                    </el-tooltip>
                    <el-tooltip class="item" effect="dark" content="删除目录" placement="top" :open-delay="300">
                      <el-button type="text" @click.stop="deleteDir(data)"><i class="el-icon-delete" /></el-button>
                    </el-tooltip>
                  </div>
                </span>
              </el-tree>
            </div>
          </div>
        </div>
        <div class="device-list__right">
          <div class="breadcrumb">
            <span
              v-for="item in breadcrumb"
              :key="item.id"
              class="breadcrumb__item"
              @click="deviceRouter(item)"
            >
              {{ item.label }}
            </span>
          </div>
          <div class="device-list__max-height" :style="{height: `${maxHeight}px`}">
            <router-view />
          </div>
        </div>
      </div>
    </el-card>
    <create-dir v-if="dialog.createDir" :parent-dir="parentDir" :current-dir="currentDir" :group-id="currentGroupId" @on-close="closeDialog('createDir', ...arguments)" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Mixins } from 'vue-property-decorator'
import DeviceMixin from './mixin'
import { DeviceModule } from '@/store/modules/device'
import { getGroups } from '@/api/group'
import { Group } from '@/type/group'
import CreateDir from './components/dialogs/CreateDir.vue'
import StatusBadge from '@/components/StatusBadge/index.vue'
import { deleteDir } from '@/api/dir'

@Component({
  name: 'Device',
  components: {
    CreateDir,
    StatusBadge
  }
})
export default class extends Mixins(DeviceMixin) {
  private parentDir = null
  private currentDir = null
  private dialog = {
    createDir: false
  }

  private get defaultKey() {
    const id = this.$route.query.deviceId || this.$route.query.dirId
    if (!id) {
      return null
    }
    return id
  }

  private mounted() {
    this.getGroupList()
    this.calMaxHeight()
    window.addEventListener('resize', this.calMaxHeight)
  }

  private destroyed() {
    window.removeEventListener('resize', this.calMaxHeight)
  }

  @Watch('$route.query')
  private onRouterChange() {
    if (!this.$route.query.groupId) {
      this.getGroupList()
    }
  }

  /**
   * 获取组列表
   */
  public async getGroupList() {
    this.loading.group = true
    let params = {
      pageSize: 1000
    }
    const res = await getGroups(params)
    this.groupList = res.groups
    if (this.groupList.length) {
      if (!this.$route.query.groupId) {
        await DeviceModule.SetGroup(this.groupList[0])
        this.$router.push({
          name: 'device-list',
          query: {
            groupId: this.currentGroupId,
            inProtocol: this.currentGroup!.inProtocol
          }
        })
      } else {
        const currentGroup = this.groupList.find((group: Group) => group.groupId === this.$route.query.groupId)
        await DeviceModule.SetGroup(currentGroup)
      }
      await this.initDirs()
    }
    this.loading.group = false
  }

  /**
   * 切换业务组
   */
  public async changeGroup() {
    const currentGroup = this.groupList.find((group: Group) => group.groupId === this.groupId)
    await DeviceModule.SetGroup(currentGroup)
    this.$router.push({
      name: 'device-list',
      query: {
        groupId: this.currentGroupId,
        inProtocol: this.currentGroup!.inProtocol
      }
    })
    await this.initDirs()
  }

  /**
   * 删除目录
   */
  private deleteDir(dir: any) {
    this.$alertDelete({
      type: '目录',
      msg: `是否确认删除目录"${dir.label}"`,
      method: deleteDir,
      payload: { dirId: dir.id },
      onSuccess: this.initDirs
    })
  }

  /**
   * 打开对话框
   */
  private openDialog(type: string, payload: any) {
    switch (type) {
      case 'createDir':
        if (payload) {
          this.parentDir = payload
        }
        this.dialog.createDir = true
        break
      case 'updateDir':
        if (payload) {
          this.currentDir = payload
        }
        this.dialog.createDir = true
        break
    }
  }

  /**
   * 关闭对话框
   */
  private closeDialog(type: string, payload: any) {
    // @ts-ignore
    this.dialog[type] = false
    switch (type) {
      case 'createDir':
      case 'updateDir':
        this.currentDir = null
        this.parentDir = null
        if (payload) {
          this.initDirs()
        }
    }
  }

  /**
   * 返回根目录
   */
  private async gotoRoot() {
    const dirTree: any = this.$refs.dirTree
    dirTree.setCurrentKey(null)
    await DeviceModule.ResetBreadcrumb()
    this.deviceRouter({
      id: '0',
      type: 'dir'
    })
  }
}
</script>
<style lang="scss" scoped>
  .filter-group {
    width: 300px;
    ::v-deep .el-input--medium .el-input__inner {
      height: 50px;
      line-height: 50px;
      font-size: 18px;
    }
  }
  .device-list-wrap {
    ::v-deep .el-card__body {
      padding: 0;
    }
  }
  .device-list {
    position: relative;
    display: flex;

    &__handle {
      position: absolute;
      top: 0;
      margin-left: -8px;
      z-index: 100;
      height: 100%;
      width: 8px;
      border-right: 1px solid $borderGrey;
      transition: border .1s;
      cursor: ew-resize;

      &:hover {
        border-right-color: #ccc;
      }
    }

    &__left {
      overflow: hidden;
      transition: width .2s;

      .dir-list {
        height: 100%;
        display: flex;
        flex-direction: column;
        &__tools {
          height: 40px;
          border-bottom: 1px solid $borderGrey;
          text-align: right;
          padding-right: 5px;
          background: #f8f8f8;
          .el-button--text {
            margin: 0;
            padding: 12px 5px;
            color: $text;
            font-size: 16px;
          }
        }
        &__root {
          border-bottom: 1px solid $borderGrey;
          margin: 0 -10px 5px -10px;
          padding: 0 15px 10px 15px;
          cursor: pointer;
          .svg-icon {
            color: #C0C4CC;
            margin-right: 10px !important;
          }
        }
        &__tree {
          padding: 10px;

          ::v-deep .el-tree-node__content {
            position: relative;
            &:hover {
              .tools {
                display: block;
              }
            }
          }

          .svg-icon {
            margin-right: 5px;
          }

          .custom-tree-node {
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
            .tools {
              position: absolute;
              top: 0;
              display: none;
              background: #F5F7FA;
              .el-button {
                color: $text;
                padding: 5px 0;
              }
              .el-button + .el-button {
                margin-left: 5px;
              }
            }
          }
        }
      }
      .el-tree {
        flex: 1;
        background: none;
      }
    }
    &__right {
      flex: 1;
      overflow: hidden;
      .filter-container__search-group {
        margin-right: 10px;
      }
    }
    &__container {
      padding: 15px;
    }

    &__expand {
      position: absolute;
      border: none;
      border-radius: 0;
      left: 0;
      top: 0;
      z-index: 11;
      height: 39px;
      border-right: 1px solid $borderGrey;
      font-size: 18px;
      padding: 10px 15px;
      background: #f8f8f8;
    }

    .breadcrumb {
      height: 40px;
      line-height: 40px;
      padding-left: 15px;
      border-bottom: 1px solid $borderGrey;
      background: #f8f8f8;
      transition: padding-left .2s;
      &__item {
        cursor: pointer;
      }
      &__item:after {
        content: '/';
        color: $textGrey;
        margin: 0 10px;
      }
      &__item:last-child:after {
        content: '';
      }
    }

    &--dragging {
      cursor: ew-resize;

      .device-list__left {
        transition: none;
      }
      * {
        user-select:none;
      }
    }

    &--collapsed {
      .device-list__handle {
        display: none;
      }
      .device-list__left {
        width: 0px!important;
      }
      .breadcrumb {
        padding-left: 70px;
      }
      .device-list__expand {
        left: 1px;
        i {
          transform: rotate(180deg);
        }
      }
    }
    .device-list__max-height {
      overflow: auto;
    }
  }
</style>
