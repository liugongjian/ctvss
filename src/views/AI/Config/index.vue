<template>
  <div class="app-container">
    <el-tabs v-model="activeName" type="border-card">
      <el-tab-pane label="群组" name="group">
        <GroupInfo />
      </el-tab-pane>
      <el-tab-pane label="人员" name="personal">
        <PersonalInfo />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import GroupInfo from './components/GroupInfo.vue'
import PersonalInfo from './components/PersonalInfo.vue'

@Component({
  name: 'FaceRecognation',
  components: {
    GroupInfo,
    PersonalInfo
  }
})
export default class extends Vue {
  private activeName = 'group'
}
</script>
<style lang="scss" scoped>

</style>
