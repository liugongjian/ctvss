<template>
  <div class="navbar" :class="isLight ? '' : `navbar--${routerName}`">
    <hamburger
      v-if="!ctLogin"
      id="hamburger-container"
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />
    <el-select
      v-if="hasGroupSelector"
      v-model="groupId"
      class="filter-group"
      filterable
      placeholder="请选择业务组"
      @change="changeGroup"
    >
      <el-option
        v-for="item in groupList"
        :key="item.groupId"
        :label="item.groupName"
        :value="item.groupId"
      >
        <span class="filter-group__label">{{ item.groupName }}</span>
        <span class="filter-group__in">{{ item.inProtocol }}</span>
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
          <div v-for="group in alertTypeList" :key="group.name" class="dropdown">
            {{ group.name }} <svg-icon name="arrow-down2" width="8" height="8" />
            <ul class="dropdown__menu">
              <li v-for="type in group.list" :key="type.key" :class="{'actived': queryAlertType === type.key.toString()}" @click="routeToAI(type.key)">
                {{ type.value }}
              </li>
            </ul>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="search-box">
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
        </div>
        <div :class="['links', ctLogin ? 'ct-login' : '']">
          <a target="_blank" href="https://vcn.ctyun.cn/document/api/">API文档</a>
        </div>
      </template>
      <div v-if="!ctLogin" class="user-container">
        <div class="user-container__menu">
          <span class="user-container__name">{{ name }}</span>
          <svg-icon class="user-container__arrow" name="arrow-down" width="9" height="9" />
        </div>
        <div class="header-dropdown">
          <div v-if="isMainUser">
            <router-link to="/changePassword"><i><svg-icon name="password" /></i> 修改密码</router-link>
            <div class="header-dropdown__divided" />
          </div>
          <el-button type="text" @click="logout"><i><svg-icon name="logout" /></i> 退出登录</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from 'vue-property-decorator'
import { trim } from 'lodash'
import { AppModule } from '@/store/modules/app'
import { UserModule } from '@/store/modules/user'
import { GroupModule } from '@/store/modules/group'
import { getDevice } from '@/api/device'
import { Group } from '@/type/group'
import { AlertType } from '@/dics'
import Breadcrumb from '@/components/Breadcrumb/index.vue'
import ErrorLog from '@/components/ErrorLog/index.vue'
import Hamburger from '@/components/Hamburger/index.vue'
import HeaderSearch from '@/components/HeaderSearch/index.vue'
import Screenfull from '@/components/Screenfull/index.vue'
import SizeSelect from '@/components/SizeSelect/index.vue'
import TemplateBind from '@/views/components/templateBind.vue'
import { checkPermission } from '@/utils/permission'

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
  }
})
export default class extends Vue {
  private checkPermission = checkPermission
  private alertType = AlertType
  public searchForm = {
    deviceId: ''
  }
  public groupId: string | null = null
  public loading = {
    group: false
  }

  get ctLogin() {
    return !!UserModule.ctLoginId
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

  get avatar() {
    return UserModule.avatar
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

  get groupList() {
    return GroupModule.groups || []
  }

  private toggleSideBar() {
    AppModule.ToggleSideBar(false)
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

  get alertTypeList() {
    const list = []
    list.push({
      name: '人脸识别',
      list: [6, 4].map((id: number) => {
        return {
          key: id,
          value: this.alertType[id]
        }
      })
    })
    list.push({
      name: '人体识别',
      list: [8, 5, 7].map((id: number) => {
        return {
          key: id,
          value: this.alertType[id]
        }
      })
    })
    list.push({
      name: '安全生产',
      list: [9, 10, 11, 13].map((id: number) => {
        return {
          key: id,
          value: this.alertType[id]
        }
      })
    })
    return list
  }

  @Watch('currentGroupId', { immediate: true })
  private onCurrentGroupChange(groupId: string) {
    this.groupId = groupId
  }

  private mounted() {
    GroupModule.GetGroupList()
  }

  /**
   * 切换业务组
   */
  public async changeGroup() {
    const currentGroup = this.groupList.find((group: Group) => group.groupId === this.groupId)
    await GroupModule.SetGroup(currentGroup)
  }

  private async logout() {
    const data: any = await UserModule.LogOut()
    if (data.iamUserId) {
      this.$router.push(`/login/subAccount?redirect=%2Fdashboard&mainUserID=${data.mainUserID}`)
    } else {
      this.$router.push(`/login?redirect=%2Fdashboard`)
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
            inProtocol: res.inProtocol
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
.navbar {
  height: 50px;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    padding: 0 15px;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
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
      padding: 0 20px;
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
        z-index: 10;
        top: 50px;
        right: 0;
        width: 180px;
        background: #fff;
        border: 1px solid $borderGrey;
        line-height: 32px;
        padding: 5px 0;
        animation-duration: .5s;

        a, .el-button--text {
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
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -15px;
          top: 19px;
          font-size: 12px;
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
      box-shadow: 2px 2px 5px rgba(0, 0, 0, .15);
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

  &--visualizationDashboard, &--dashboardAI {
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
      a, .el-button--text {
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
        color: #7BB3E5;
      }
    }
    .app-breadcrumb {
      display: none;
    }
    .right-menu {
      margin-right: 2em;
      line-height: 40px;

      .links a, .links .dropdown {
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
        &.actived, &:hover {
          background-image: linear-gradient(#00B3E9, #002DC1);
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
            &.actived, &:hover {
              background: #00B3E9;
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
      a, button {
        font-size: 14px;
      }
    }

    @media screen and (max-height: 1100px) {
      .hamburger-container {
        line-height: 40px;
        ::v-deep svg {
          width: 15px!important;
          height: 15px!important;
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
          top: 29px!important;
        }
      }
    }
  }
}
</style>
