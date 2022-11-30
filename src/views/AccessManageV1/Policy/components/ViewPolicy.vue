<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-card>
      <el-tabs v-model="activeName" type="border-card">
        <el-tab-pane label="基本信息" name="policyInfo">
          基本信息
        </el-tab-pane>
        <el-tab-pane label="策略关联" name="policyBind">
          策略关联
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeName: 'policyInfo',
      breadCrumbContent: ''
    }
  },
  mounted() {
    this.breadCrumbContent = this.$route.meta.title
  },
  methods: {
    back() {
      this.$router.push('/access-manage/policy')
    }
  }
}
</script>

<style>
</style>
