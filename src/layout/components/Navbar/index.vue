<template>
  <div class="navbar" :class="`navbar--${routerName}`">
    <hamburger
      id="hamburger-container"
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />
    <el-select
      v-if="hasGroupSelector"
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
      <template v-if="routerName === 'AI' || routerName === 'dashboard'">
        <div class="user-container">
          <div class="user-container__menu">
            {{ "安全管理" }}
          </div>
          <div class="header-dropdown">
            <router-link to="/secretManage"><i><svg-icon name="key" /></i> API密钥管理</router-link>
            <div class="header-dropdown__divided" />
            <el-button type="text" @click="logout"><i><svg-icon name="logout" /></i> 退出登录</el-button>
          </div>
        </div>
        <div class="user-container">
          <div class="user-container__menu">
            {{ "人员管理" }}
          </div>
          <div class="header-dropdown">
            <router-link to="/secretManage"><i><svg-icon name="key" /></i> API密钥管理</router-link>
            <div class="header-dropdown__divided" />
            <el-button type="text" @click="logout"><i><svg-icon name="logout" /></i> 退出登录</el-button>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="search-box">
          <div class="search-box__form" @click.stop="focusSearch">
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
        <div class="links">
          <a target="_blank" href="/document/api/">API文档</a>
        </div>
        <div class="user-container">
          <div class="user-container__menu">
            {{ name }}
            <svg-icon class="user-container__arrow" name="arrow-down" width="9" height="9" />
          </div>
          <div class="header-dropdown">
            <router-link to="/secretManage"><i><svg-icon name="key" /></i> API密钥管理</router-link>
            <div class="header-dropdown__divided" />
            <el-button type="text" @click="logout"><i><svg-icon name="logout" /></i> 退出登录</el-button>
          </div>
        </div>
      </template>
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
import Breadcrumb from '@/components/Breadcrumb/index.vue'
import ErrorLog from '@/components/ErrorLog/index.vue'
import Hamburger from '@/components/Hamburger/index.vue'
import HeaderSearch from '@/components/HeaderSearch/index.vue'
import Screenfull from '@/components/Screenfull/index.vue'
import SizeSelect from '@/components/SizeSelect/index.vue'

@Component({
  name: 'Navbar',
  components: {
    Breadcrumb,
    ErrorLog,
    Hamburger,
    HeaderSearch,
    Screenfull,
    SizeSelect
  }
})
export default class extends Vue {
  public searchForm = {
    deviceId: ''
  }
  public groupId: string | null = null
  public loading = {
    group: false
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
    return this.$route.name?.startsWith('AI-') ? 'AI' : this.$route.name
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
    await UserModule.LogOut()
    this.$router.push(`/login?redirect=${this.$route.fullPath}`)
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
      this.$router.push({
        name: 'device-detail',
        query: {
          type: 'detail',
          deviceId: deviceId,
          groupId: res.groupId,
          inProtocol: res.inProtocol
        }
      })
    } catch (e) {
      this.$message.error(`未搜索到设备ID:"${this.searchForm.deviceId}"`)
    }
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

      &__arrow {
        vertical-align: middle;
        transition: transform 0.2s;
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

  &--dashboard, &--AI {
    background: #131a23;
    color: #eee;
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
          background: #243243;
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
  }
}
</style>
