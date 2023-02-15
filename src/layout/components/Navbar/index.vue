<template>
  <div class="navbar" :class="isLight ? '' : `navbar--${routerName}`">
    <hamburger
      v-if="!casLogin"
      id="hamburger-container"
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />
    <el-select
      v-if="hasCustomTreeSelector"
      v-model="groupId"
      class="filter-group multi-group-selector"
      filterable
      placeholder="请选择业务组或自定义目录树"
      @change="changeGroup"
    >
      <el-option-group
        v-for="(group, index) in multiGroupList"
        :key="index"
        :label="group.label"
      >
        <el-option
          v-for="(item, itemIndex) in group.options"
          :key="itemIndex"
          :label="item.groupName"
          :value="item.groupId"
        >
          <span class="filter-group__label">{{ item.groupName }}</span>
          <span class="filter-group__in">{{ item.inProtocol }}</span>
        </el-option>
      </el-option-group>
    </el-select>
    <el-select
      v-if="!hasCustomTreeSelector && hasGroupSelector"
      v-model="groupId"
      v-el-select-loadmore="loadmore"
      class="filter-group"
      filterable
      placeholder="请选择业务组"
      @visible-change="visibleChange"
      @change="changeGroup"
    >
      <el-option
        v-for="(item, index) in groupList"
        :key="index"
        :label="item.groupName"
        :value="item.groupId"
      >
        <span class="filter-group__label">{{ item.groupName }}</span>
        <span class="filter-group__in">{{ item.inProtocol }}</span>
      </el-option>
      <el-option
        v-if="loading.group"
        class="loading-option"
        disabled
        value=""
      >
        加载中<i class="el-icon-loading" />
      </el-option>
    </el-select>
    <breadcrumb
      id="breadcrumb-container"
      class="breadcrumb-container"
    />
    <div class="right-menu">
      <!-- <template v-if="device!=='mobile'">
        <header-search class="right-menu-item" />
        <error-log class="errLog-container right-menu-item hover-effect" />
        <screenfull class="right-menu-item hover-effect" />
        <el-tooltip
          content="布局大小"
          effect="dark"
          placement="bottom"
        >
          <size-select class="right-menu-item hover-effect" />
        </el-tooltip>
      </template> -->
      <template v-if="(routerName === 'dashboardAI' && !isLight) || routerName === 'visualizationDashboard'">
        <div class="links">
          <a :class="{'actived': !queryAlertType}" @click="routeToHome()">可视化大屏</a>
          <!-- <div v-for="group in aiGroups" :key="group.name" class="dropdown">
            {{ group.name }} <svg-icon name="arrow-down2" width="8" height="8" />
             -->
          <template v-if="checkPermission(['DescribeAi'])">
            <div v-for="item in aiInfos" :key="item.name" class="dropdown" :style="{width: `${item.name.length * 16 + 56}px`}">
              {{ item.name }} <svg-icon name="arrow-down2" width="8" height="8" />
              <ul class="dropdown__menu" :style="{width: `${item.name.length * 16 + 56}px`}">
                <!-- <li v-for="aiType in group.children" :key="aiType" :class="{'actived': queryAlertType === aiType.toString()}" @click="routeToAI(aiType)">
                    {{ alertType[aiType] }}
                  </li> -->
                <li v-for="app in item.apps" :key="app.id" @click="goToApp(app.id)">
                  {{ app.name }}
                </li>
              </ul>
            </div>
          </template>
        </div>
      </template>
      <template v-else>
        <!-- 柳州版本暂时隐藏全局搜索入口 -->
        <!-- <div class="search-box">
          <div v-if="!isLight" class="search-box__form" @click.stop="focusSearch">
            <span class="search-box__placeholder">搜索设备</span>
            <span class="search-box__icon"><svg-icon name="search" width="15" height="15" /></span>
          </div>
          <div ref="searchBoxPopup" class="search-box__popup" @click.stop>
            <div class="search-box__popup__close" @click="closeSearchPopup">
              <svg-icon name="close" width="12" height="12" />
            </div>
            <div class="search-box__popup__types">搜索设备</div>
            <el-form class="search-box__popup__form" @submit.native.prevent>
              <el-input ref="searchBoxPopupInput" v-model="searchForm.deviceId" placeholder="请输入设备ID" />
              <el-button type="text" native-type="submit" @click="search">
                <svg-icon name="search" width="15" height="15" />
              </el-button>
            </el-form>
          </div>
        </div> -->
        <div :class="['links', casLogin ? 'ct-login' : '']">
          <a target="_blank" href="https://vcn.ctyun.cn/document/api/">API文档</a>
          <span v-if="!casLogin" class="links__split"> | </span>
        </div>
      </template>
      <div v-if="!casLogin" class="user-container">
        <div class="user-container__menu">
          <span class="user-container__name">{{ name }}</span>
          <svg-icon class="user-container__arrow" name="arrow-down" width="9" height="9" />
        </div>
        <div class="header-dropdown">
          <!-- <div v-if="isMainUser"> -->
          <router-link to="/changePassword"><i><svg-icon name="password" /></i> 修改密码</router-link>
          <div class="header-dropdown__divided" />
          <!-- </div> -->
          <el-button type="text" @click="logout"><i><svg-icon name="logout" /></i> 退出登录</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { getDevice } from '@/api/device'
import Breadcrumb from '@/components/Breadcrumb/index.vue'
import ErrorLog from '@/components/ErrorLog/index.vue'
import Hamburger from '@/components/Hamburger/index.vue'
import HeaderSearch from '@/components/HeaderSearch/index.vue'
import Screenfull from '@/components/Screenfull/index.vue'
import SizeSelect from '@/components/SizeSelect/index.vue'
import { AlertType } from '@/dics'
import * as loginService from '@/services/loginService'
import { AppModule } from '@/store/modules/app'
import { GroupModule } from '@/store/modules/group'
import { UserModule } from '@/store/modules/user'
import { Group } from '@/type/Group'
import TemplateBind from '@/views/components/TemplateBind.vue'
import { AiGroups } from '@/views/Dashboard/helper/aiGroups'
import DashboardMixin from '@/views/Dashboard/mixin/DashboardMixin'
import { trim } from 'lodash'
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { removeLocalStorage } from '@/utils/storage'

@Component({
  name: 'Navbar',
  components: {
    Breadcrumb,
    ErrorLog,
    Hamburger,
    HeaderSearch,
    Screenfull,
    SizeSelect,
    TemplateBind
  },
  directives: {
    'el-select-loadmore': {
      bind(el, binding) {
        const SELECTWRAP_DOM = el.querySelector('.filter-group .el-select-dropdown .el-select-dropdown__wrap')
        let beforeScrollTop = SELECTWRAP_DOM.scrollTop
        SELECTWRAP_DOM?.addEventListener('scroll', () => {
          // 判断为滚动条为下滑
          if (beforeScrollTop < SELECTWRAP_DOM.scrollTop) {
            const condition = SELECTWRAP_DOM.scrollHeight - SELECTWRAP_DOM.scrollTop <= SELECTWRAP_DOM.clientHeight + 2
            if (condition) {
              binding.value()
            }
          }
          beforeScrollTop = SELECTWRAP_DOM.scrollTop
        })
      }
    }
  }
})
export default class extends Mixins(DashboardMixin) {
  private lazyloadTimer = null
  private alertType = AlertType
  private aiGroups = AiGroups
  private aiInfos = []
  public searchForm = {
    deviceId: ''
  }

  public groupId: string | null = null
  public loading = {
    group: false
  }

  get casLogin() {
    return !!UserModule.casLoginId
  }

  get isMainUser() {
    return !UserModule.iamUserId
  }

  get sidebar() {
    return AppModule.sidebar
  }

  get device() {
    return AppModule.device.toString()
  }

  get name() {
    return UserModule.name
  }

  get currentGroup() {
    return GroupModule.group
  }

  get currentGroupId() {
    return GroupModule.group?.groupId
  }

  get hasGroupSelector() {
    return this.$route.meta.groupSelector
  }

  get hasCustomTreeSelector() {
    return this.$route.meta.customTreeSelector
  }

  get groupList() {
    return GroupModule.groups || []
  }

  get customTreeList() {
    return GroupModule.customTrees || []
  }

  get multiGroupList() {
    return [
      {
        label: '设备业务组',
        options: this.groupList
      },
      {
        label: '自定义目录树',
        options: this.customTreeList
      }
    ]
  }

  set groupListIndex(val: number) {
    GroupModule.SetGroupListIndex(val)
  }

  get groupListIndex() {
    return GroupModule.groupListIndex
  }

  private toggleSideBar() {
    AppModule.ToggleSideBar(false)
  }

  private checkRole() {
    this.$router.push({
      path: '/changeRole'
    })
  }

  get routerName() {
    if (this.$route.name?.startsWith('dashboardAI')) {
      return 'dashboardAI'
    } else if (this.$route.name?.startsWith('visualizationDashboard')) {
      return 'visualizationDashboard'
    } else {
      return this.$route.name
    }
  }

  get queryAlertType() {
    return this.$route.query.type
  }

  get isLight() {
    return this.$route.query.isLight
  }

  @Watch('currentGroupId', { immediate: true })
  private onCurrentGroupChange(groupId: string) {
    this.groupId = groupId
    removeLocalStorage('liveScreenCache')
    removeLocalStorage('replayScreenCache')
  }

  @Watch('hasCustomTreeSelector')
  private onHasCustomTreeSelectorChange(hasCustomTreeSelector: boolean) {
    let currentGroup
    if (hasCustomTreeSelector) {
      currentGroup = [...this.groupList, ...this.customTreeList].find((group: Group) => group.groupId === this.groupId)
    } else {
      currentGroup = [...this.groupList].find((group: Group) => group.groupId === this.groupId)
    }
    GroupModule.SetGroup(currentGroup || this.groupList[0])
  }

  private async mounted() {
    const liuzhouFlag = true
    if (liuzhouFlag) {
      GroupModule.GetMultiGroupList()
    } else {
      GroupModule.GetGroupList()
    }
    this.aiInfos = await this.getAiApps()

    // TODO: Hardcode 300015
    if (UserModule.mainUserID === '300015') {
      this.aiGroups = [
        {
          name: '人脸识别',
          children: [4]
        }, {
          name: '人体识别',
          children: [8]
        }, {
          name: '场景识别',
          children: [10, 17]
        }
      ]
    }
  }

  /**
   * 下拉框出现时刷新下拉列表
   */
  private visibleChange(val) {
    // 当条目数为20倍数时不需要首次加载
    if (this.groupList.length % 20 !== 0) {
      val && GroupModule.GetGroupList()
    }
  }

  /**
   * 懒加载顶部用户下拉框
   */
  private async loadmore() {
    // 当条目数不为20倍数时不需要懒加载
    if (this.groupList.length % 20 !== 0) return
    // 加宽下拉加载触发限制时，会触发多次，在这使用节流限制
    if (!this.loading.group && !this.lazyloadTimer) {
      this.loading.group = true
      await GroupModule.LoadmoreGroups()
      this.loading.group = false
      this.lazyloadTimer = setTimeout(() => {
        clearTimeout(this.lazyloadTimer)
        this.lazyloadTimer = null
      }, 1000)
    }
  }

  /**
   * 切换业务组
   */
  public async changeGroup() {
    const currentGroup = [...this.groupList, ...this.customTreeList].find((group: Group) => group.groupId === this.groupId)
    await GroupModule.SetGroup(currentGroup)
  }

  private async logout() {
    const data: any = await UserModule.LogOut()
    if (data.iamUserId) {
      this.$router.push(`${loginService.innerUrl.sub}?redirect=%2Fdashboard&mainUserID=${data.mainUserID}`)
    } else {
      this.$router.push(`${loginService.innerUrl.main}?redirect=%2Fdashboard`)
    }
  }

  private focusSearch() {
    const searchBoxPopup: any = this.$refs.searchBoxPopup
    searchBoxPopup.style.display = 'block'
    document.body.addEventListener('click', this.closeSearchPopup)
    const searchBoxPopupInput: any = this.$refs.searchBoxPopupInput
    searchBoxPopupInput.focus()
  }

  private closeSearchPopup() {
    const searchBoxPopup: any = this.$refs.searchBoxPopup
    searchBoxPopup.style.display = 'none'
  }

  private async search() {
    try {
      const deviceId = trim(this.searchForm.deviceId)
      const res = await getDevice({
        deviceId: deviceId
      })
      if (res.groupId !== this.groupId) {
        this.groupId = res.groupId
        await this.changeGroup()
      }
      this.$nextTick(() => {
        this.$router.push({
          name: 'device-detail',
          query: {
            type: 'detail',
            deviceId: deviceId,
            groupId: res.groupId,
            inProtocol: res.inProtocol,
            isSearch: '1'
          }
        })
      })
    } catch (e) {
      this.$message.error(`未搜索到设备ID:"${this.searchForm.deviceId}"`)
    }
  }

  private routeToAI(type: string) {
    this.$router.push({
      path: '/dashboard/ai',
      query: {
        type
      }
    })
  }

  private routeToHome() {
    this.$router.push({
      path: '/dashboard/visualization-dashboard'
    })
  }
}
</script>

<style lang="scss" scoped>
// multiGroupSelector 样式
.multi-group-selector {
  ::v-deep {
    .el-select-group__wrap {
      display: none !important;
    }
  }
}

.navbar {
  position: relative;
  z-index: 50;
  height: 50px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 8%);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    padding: 0 15px;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 2.5%);
    }
  }

  .role-link {
    margin-left: 50%;
    position: absolute;
    line-height: 50px;
    height: 100%;
    font-weight: bold;
    font-size: 15px;
    width: 400px;
    left: -200px;
    color: #4a89dc;
  }

  .filter-group {
    float: left;
    margin-top: 7px;
    margin-right: 10px;
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .links {
    a {
      color: $text;
    }

    a:hover {
      color: $primary;
    }

    &__split {
      color: $borderGrey2;
      padding: 0 10px;
    }
  }

  .links.ct-login {
    margin-right: 10px;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    display: flex;

    &:focus {
      outline: none;
    }

    .user-container {
      position: relative;
      padding: 0 20px 0 5px;
      color: $text;

      &__menu {
        display: flex;
        align-items: center;
      }

      &__arrow {
        vertical-align: middle;
        transition: transform 0.2s;
        margin-left: 4px;
      }

      &__name {
        max-width: 60px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .header-dropdown {
        display: none;
        position: absolute;
        z-index: 20;
        top: 50px;
        right: 0;
        width: 180px;
        background: #fff;
        border: 1px solid $borderGrey;
        line-height: 32px;
        padding: 5px 0;
        animation-duration: 0.5s;

        a,
        .el-button--text {
          display: block;
          color: $text;
          padding: 0 15px;
          line-height: 32px;
          width: 100%;
          text-align: left;
          cursor: pointer;

          &:hover {
            background: #f3f3f3;
          }
        }

        i {
          display: inline-block;
          width: 22px;
          color: $textGrey;
        }

        &__divided {
          border-top: 1px solid $borderGrey;
          margin: 5px 0;
        }
      }

      &:hover {
        .header-dropdown {
          animation-name: slideInDown;
          display: block;
        }

        .user-container__arrow {
          transform: rotate(-180deg);
        }
      }
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      color: $text;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 2.5%);
        }
      }
    }
  }

  .search-box {
    position: relative;
    margin-right: 20px;

    &__form {
      display: flex;
      justify-content: space-between;
      width: 150px;
      padding: 0 10px;
      border: 1px solid $borderGrey;
      border-top: none;
      border-bottom: none;
      height: 50px;
      line-height: 50px;
      color: $textGrey;
      background: #fff;
      cursor: pointer;
      transition: background-color 100ms;

      &:hover {
        background: #f4f4f4;
        color: $text;

        .search-box__icon {
          color: $primary;
        }
      }
    }

    &__popup {
      display: none;
      position: absolute;
      background: #fff;
      width: 400px;
      top: 0;
      right: 0;
      padding: 15px;
      z-index: 10;
      line-height: 100%;
      color: $text;
      border-radius: 2px;
      box-shadow: 2px 2px 5px rgba(0, 0, 0, 15%);
      transition: all 2000ms;

      &__close {
        position: absolute;
        right: 10px;
        top: 10px;
        cursor: pointer;
        transition: color 100ms;

        &:hover {
          color: $primary;
        }
      }

      &__types {
        margin-bottom: 10px;
      }

      &__form {
        display: flex;

        .el-button {
          color: $text;
          margin-left: 10px;
        }
      }
    }
  }

  &--visualizationDashboard,
  &--dashboardAI {
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 11;
    background: transparent;
    color: #eee;
    height: auto;

    .links a,
    .right-menu .user-container {
      color: #eee;
    }

    .right-menu .user-container .header-dropdown {
      background: #131a23;
      border-color: #131a23;

      i {
        color: #aaa;
      }

      a,
      .el-button--text {
        color: #eee;

        &:hover {
          background: #242c43;
        }
      }

      .header-dropdown__divided {
        border-color: #243243;
      }
    }

    .search-box__form {
      color: #eee;
      background: #243243;
      border-color: #131a23;

      &:hover {
        background: #2c3c51;
        color: #eee;
      }
    }

    .hamburger-container {
      line-height: 40px;
      background: #2c3c51;
      padding: 0 10px;
      border-radius: 0;

      ::v-deep svg {
        color: #7bb3e5;
      }
    }

    .app-breadcrumb {
      display: none;
    }

    .right-menu {
      margin-right: 2em;
      line-height: 40px;

      .links a,
      .links .dropdown {
        display: inline-block;
        cursor: pointer;
        padding: 0 20px;
        margin-right: 10px;
        font-weight: bold;
        background: #06266f;
        border-radius: 0 0 4px 4px;
        border: 1px solid #2c4e9b;
        border-top: 0;
        font-size: 16px;

        &:last-child {
          margin: 0;
        }

        &.actived,
        &:hover {
          background-image: linear-gradient(#00b3e9, #002dc1);
          color: #fff;
        }
      }

      .dropdown {
        position: relative;

        svg {
          vertical-align: middle;
        }

        &__menu {
          display: none;
          position: absolute;
          right: -1px;
          top: 39px;
          width: 180px;
          background: #06266f;
          border: 1px solid #2c4e9b;
          list-style: none;
          margin: 0;
          padding: 10px;

          li {
            text-align: center;

            &.actived,
            &:hover {
              background: #00b3e9;
            }
          }
        }

        &:hover .dropdown__menu {
          display: block;
        }
      }
    }

    .user-container .header-dropdown {
      top: 40px !important;

      a,
      button {
        font-size: 14px;
      }
    }

    @media screen and (max-height: 1100px) {
      .hamburger-container {
        line-height: 40px;

        ::v-deep svg {
          width: 15px !important;
          height: 15px !important;
        }
      }

      .right-menu {
        line-height: 40px;

        a {
          font-size: 16px;
          padding: 0 20px;
        }

        .dropdown {
          &__menu {
            top: 39px;
          }
        }
      }
    }

    @media screen and (max-height: 800px) {
      .hamburger-container {
        line-height: 30px;
      }

      .right-menu {
        line-height: 30px;

        a {
          font-size: 14px;
          padding: 0 15px;
        }

        .dropdown {
          &__menu {
            top: 29px;
          }
        }

        .user-container .header-dropdown {
          top: 29px !important;
        }
      }
    }
  }
}
</style>
