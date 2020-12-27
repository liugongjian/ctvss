<template>
  <div class="dashboard-wrap">
    <div class="ai-recognation">
      <div class="ai-recognation-video">
        <video src="" />
      </div>
      <div class="ai-recognation-img--abnormal">
        <div v-for="(src, index) in abnormalImageList" :key="index">
          <img :src="src">
        </div>
      </div>
      <div class="ai-recognation-img--normal">
        <div v-for="(src, index) in normalImageList" :key="index">
          <img :src="src">
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
@Component({
  name: 'DashboardAI'
})
export default class extends Vue {
  private type = ''
  private abnormalImageList = [
    'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1236258137,222312282&fm=26&gp=0.jpg',
    'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1236258137,222312282&fm=26&gp=0.jpg',
    'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1236258137,222312282&fm=26&gp=0.jpg',
    'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1236258137,222312282&fm=26&gp=0.jpg'
  ]
  private normalImageList = [
    'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1236258137,222312282&fm=26&gp=0.jpg',
    'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1236258137,222312282&fm=26&gp=0.jpg',
    'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1236258137,222312282&fm=26&gp=0.jpg',
    'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1236258137,222312282&fm=26&gp=0.jpg',
    'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1236258137,222312282&fm=26&gp=0.jpg',
    'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1236258137,222312282&fm=26&gp=0.jpg'
  ]

  private mounted() {
    let params: any = this.$route.params
    if (params.type) {
      this.type = params.type
    }
  }
}
</script>

<style lang="scss" scoped>
  .dashboard-wrap {
    position: relative;
    background-color: #232F3E;
    height: 100%;
    width: 100%;
    font-size: 16px;
    height: 100vh;
    overflow: auto;
  }
  .ai-recognation {
    border: 2px solid #516F8D;
    margin: 8vh 5vh;
  }
  img {
    width: 200px;
    height: 120px;
  }
</style>
