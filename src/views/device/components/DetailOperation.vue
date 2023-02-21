<template>
  <div class="detail__buttons">
    <el-button v-if="!isSearch" size="small" @click="goSuperior"><svg-icon name="superior" /> 返回上级</el-button>
    <el-button v-if="info.deviceType === 'nvr'" size="small" @click="goToChannels"><svg-icon name="list" /> 查看通道</el-button>
    <el-button v-if="!isVgroup && !disableResourceTab && checkPermission(['AdminDevice'])" size="small" @click="changeResourceDialog">配置资源包</el-button>
    <el-button v-if="!isVgroup && checkPermission(['AdminDevice'])" size="small" @click="edit"><svg-icon name="edit" /> 编辑</el-button>
    <el-dropdown v-if="!isVgroup" @command="handleMore">
      <el-button size="small">更多<i class="el-icon-arrow-down" /></el-button>
      <el-dropdown-menu slot="dropdown">
        <template v-if="info && !isNvr && !isPlatform">
          <template v-if="inProtocol === 'ehome'">
            <div v-for="num in info.multiStreamSize" :key="num">
              <el-dropdown-item v-if="getStreamStatus(info.deviceStreams, num) === 'on' && checkPermission(['AdminDevice'])" :command="{type: 'stopDevice', num}">{{ `停用${autoStreamNumObj[num]}` }}</el-dropdown-item>
              <el-dropdown-item v-else-if="checkPermission(['AdminDevice'])" :command="{type: 'startDevice', num}">{{ `启用${autoStreamNumObj[num]}` }}</el-dropdown-item>
            </div>
          </template>
          <template v-else>
            <el-dropdown-item v-if="info.streamStatus === 'on' && checkPermission(['AdminDevice'])" :command="{type: 'stopDevice'}">停用流</el-dropdown-item>
            <el-dropdown-item v-else-if="checkPermission(['AdminDevice'])" :command="{type: 'startDevice'}">启用流</el-dropdown-item>
          </template>
          <el-dropdown-item v-if="[1, 2].includes(info.recordStatus) && checkPermission(['AdminDevice'])" :command="{type: 'stopRecord', device: info}">停止录像</el-dropdown-item>
          <el-dropdown-item v-else-if="checkPermission(['AdminDevice'])" :command="{type: 'startRecord', device: info}">开始录像</el-dropdown-item>
        </template>
        <el-dropdown-item v-if="(!isNvr && info.parentDeviceId === '-1') && checkPermission(['AdminDevice'])" :command="{type: 'move'}">移动至</el-dropdown-item>
        <el-dropdown-item v-if="!isAutoCreated && checkPermission(['AdminDevice'])" :command="{type: 'delete'}">删除</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <el-button size="small" @click="detailInit"><svg-icon name="refresh" /></el-button>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator'
import { checkPermission } from '@/utils/permission'
import { UserModule } from '@/store/modules/user'

@Component({
  name: 'DetailOperation'
})
export default class extends Vue {
  private autoStreamNumObj = {
    1: '主码流',
    2: '子码流',
    3: '第三码流'
  }

  private get isPlatform() {
    return this.info.deviceType === 'platform'
  }

  @Prop()
  private inProtocol?: boolean

  @Prop()
  private info?: any

  @Prop()
  private isVgroup?: boolean

  @Prop()
  private isNvr?: boolean

  @Prop()
  private isAutoCreated?: boolean

  @Inject('goSuperior')
  private goSuperior?: Function

  @Inject('goToChannels')
  private goToChannels?: Function

  @Inject('moveDir')
  private moveDir?: Function

  @Inject('changeResourceDialog')
  private changeResourceDialog?: Function

  @Inject('edit')
  private edit?: Function

  @Inject('deleteDevice')
  private deleteDevice?: Function

  @Inject('getStreamStatus')
  private getStreamStatus?: Function

  @Inject('detailInit')
  private detailInit?: Function

  @Inject('detailOperate')
  private detailOperate?: Function

  private checkPermission = checkPermission

  private get isSearch() {
    return this.$route.query.isSearch
  }

  // 隐藏资源包配置
  public get disableResourceTab() {
    return UserModule.tags && UserModule.tags.privateUser && UserModule.tags.privateUser === 'liuzhou'
  }

  /**
   * 更多菜单
   */
  public handleMore(command: any) {
    switch (command.type) {
      case 'startDevice':
        this.detailOperate('startDevice', command.num)
        break
      case 'stopDevice':
        this.detailOperate('stopDevice', command.num)
        break
      case 'startRecord':
        this.detailOperate('startRecord')
        break
      case 'stopRecord':
        this.detailOperate('stopRecord')
        break
      case 'move':
        this.moveDir()
        break
      case 'delete':
        this.deleteDevice(this.info)
        break
    }
  }
}
</script>
