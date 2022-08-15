<template>
  <div class="app-container">
    <el-card>
      <div>
        自动拉流
        <el-popover
          placement="top-start"
          width="400"
          trigger="hover"
          :open-delay="300"
          content="请在iBox的接入配置里填写接入凭证码，盒子将自动接入当前登录账号下"
        >
          <svg-icon slot="reference" class="form-question" name="help" />
        </el-popover>
      </div>
    </el-card>
  </div>
</template>
<script>
export default {

}
</script>
<style lang="scss" scoped>

</style>
