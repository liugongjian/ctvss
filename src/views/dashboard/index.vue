<template>
  <div class="dashboard-wrap">
    <DashboardDevice />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { UserModule } from '@/store/modules/user'
import DashboardDevice from '@/components/Dashboard/DashboardDevice.vue'

@Component({
  name: 'Dashboard',
  components: {
    DashboardDevice
  }
})
export default class extends Vue {
  private currentRole = 'admin-dashboard'

  get roles() {
    return UserModule.roles
  }

  created() {
    if (!this.roles.includes('admin')) {
      // do nothing
    }
  }
}
</script>

<style lang="scss" scoped>
  .dashboard-wrap {
    background: #232F3E;
    height: 100%;
    min-height: calc(100vh - 50px);
  }
</style>
