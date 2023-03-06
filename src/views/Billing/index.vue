<template>
  <div class="billing-container">
    <el-menu default-active="/billing/resource" class="el-menu-demo" mode="horizontal" router>
      <el-menu-item index="/billing/resource">资源包管理</el-menu-item>
      <el-menu-item index="/billing/ondemand">按需计费管理</el-menu-item>
    </el-menu>
    <div>
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'


@Component({
  name: 'Billing',
  components: {

  }
})
export default class extends Vue {
}
</script>
<style lang="scss" scoped>
.billing-container {
  z-index: 51;

  .el-menu {
    padding-left: 23px;

    .el-menu-item {
      color: #666;
    }

    .el-menu-item:hover {
      color: $primary;
    }

    .is-active {
      color: $primary;
    }
  }
}
</style>
