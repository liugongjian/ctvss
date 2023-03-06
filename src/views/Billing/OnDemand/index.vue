<template>
  <div class="app-container">
    <el-card>
      <div class="title">
        <div class="title-block" />
        <span>已开通计费项</span>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'


@Component({
  name: 'OnDemand',
  components: {

  }
})
export default class extends Vue {
}
</script>
<style lang="scss" scoped>
.title {
  height: 50px;
  vertical-align: middle;

  & > div {
    // display: inline-block;
    padding-top: 5px;
  }

  .title-block {
    width: 7px;
    height: 15px;
    background-color: $primary;
    border: none;
    margin-top: 2px;
    margin-right: 5px;
    display: inline-block;
  }

  span {
    font-weight: bold;
  }
}
</style>
