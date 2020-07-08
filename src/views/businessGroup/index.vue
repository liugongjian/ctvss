<template>
  <div class="app-container expanded">
    <BusinessGroupList
      v-if="currentView === VIEW.LIST"
      @create-business-group="createBusinessGroup"
      @go-to-config="goToConfig"
    />
    <CreateBusinessGroup v-if="currentView === VIEW.CREATE" @back-to-list="backToList" />
    <BusinessGroupConfig v-if="currentView === VIEW.CONFIG" @back-to-list="backToList" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import CreateBusinessGroup from './components/createBusinessGroup.vue'
import BusinessGroupList from './components/businessGroupList.vue'
import BusinessGroupConfig from './components/businessGroupConfig.vue'

@Component({
  name: 'BusinessGroup',
  components: {
    CreateBusinessGroup,
    BusinessGroupList,
    BusinessGroupConfig
  }
})
export default class extends Vue {
  private VIEW = {
    LIST: 'LIST',
    CREATE: 'CREATE',
    CONFIG: 'CONFIG'
  }
  private currentView = this.VIEW.LIST

  private createBusinessGroup() {
    this.currentView = this.VIEW.CREATE
  }

  private backToList() {
    this.currentView = this.VIEW.LIST
  }

  private goToConfig() {
    this.currentView = this.VIEW.CONFIG
  }
}
</script>

<style lang="scss" scoped>
</style>
