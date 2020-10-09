<template>
  <div class="navbar">
    <hamburger
      id="hamburger-container"
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />
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
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { AppModule } from '@/store/modules/app'
import { UserModule } from '@/store/modules/user'
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

  private toggleSideBar() {
    AppModule.ToggleSideBar(false)
  }

  private async logout() {
    await UserModule.LogOut()
    this.$router.push(`/login?redirect=${this.$route.fullPath}`)
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
}
</style>
