<template>
  <div class="app-container expanded">
    <stream-list
      v-if="currentView === VIEW.LIST"
      @show-stream-detail="showStreamDetail"
    />
    <stream-detail
      v-if="currentView === VIEW.DETAIL"
      @back="back"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import StreamDetail from './components/StreamDetail.vue'
import StreamList from './components/StreamList.vue'

@Component({
  components: {
    StreamDetail,
    StreamList
  }
})
export default class extends Vue {
  private VIEW = {
    LIST: 'LIST',
    DETAIL: 'DETAIL'
  };

  private currentView = this.VIEW.LIST;

  private showStreamDetail() {
    this.currentView = this.VIEW.DETAIL
  }

  private back() {
    this.currentView = this.VIEW.LIST
  }
}
</script>

<style lang="scss" scoped>
.app-container.expanded {
  .node-list {
    @media screen and (max-width: 1900px) {
      &__item {
        flex: 0 0 25%;
        max-width: 25%;
      }
    }

    @media screen and (max-width: 1600px) {
      &__item {
        flex: 0 0 33.33%;
        max-width: 33.33%;
      }
    }

    @media screen and (max-width: 1400px) {
      &__item {
        flex: 0 0 50%;
        max-width: 50%;
      }
    }

    @media screen and (max-width: 900px) {
      &__item {
        flex: 0 0 100%;
        max-width: 100%;
      }
    }
  }
  @media screen and (max-width: 1500px) {
    .filter-bar {
      .pull-right {
        float: none;
      }
    }
  }
}
</style>
