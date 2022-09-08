<template>
  <div class="ibox-list-box">
    <!-- 使用v-if解决 vuex赋值，取值延迟问题 -->
    <component :is="componentKind" v-if="IBoxModule.iboxList" />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { IBoxModule } from '@/store/modules/ibox'
import rootlist from './components/List/Root.vue'
import device from './components/List/Device.vue'
import nvrlist from './components/List/Nvr.vue'

@Component({
  name: 'IBoxList',
  components: {
    rootlist,
    device,
    nvrlist
  }
})

export default class IBoxList extends Vue {
  public IBoxModule = IBoxModule
  public get componentKind() {
    return IBoxModule.iboxList.type
  }
}
</script>
<style lang="scss" scoped>
.ibox-list-box {
  width: 100%;
  height: calc(100% - 20px);
  padding: 20px;

  ::v-deep .ibox-list {
    height: 100%;

    &__btn-box {
      margin-bottom: 10px;
    }
  }
}
</style>
