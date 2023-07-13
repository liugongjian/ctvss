<template>
  <el-popover placement="top-start" trigger="hover" width="250">
    <div class="pop-container">
      <div class="pop-container_title">{{ '关联手机信息' }}</div>
      <div class="pop-container_phone">
        <span class="pop-container_phone-number">{{ "+86 " + detail.phone }}</span>
        <el-button v-if="detail.phoneVerified === 0" type="warning" size="mini">待验证</el-button>
        <el-button v-else-if="detail.phoneVerified === 1" type="success" size="mini">已验证</el-button>
        <el-button v-else-if="detail.phoneVerified === 2" type="danger" size="mini">验证失败</el-button>
      </div>
      <div class="pop-container_tips">
        <span
          v-if="detail.phoneVerified === 0"
          :class="['pop-container_tips-unknown', detail.secondCnt > 0 ? 'disabled' : '']"
          @click="verifyPhone"
        >
          {{ `重新发送验证${detail.secondCnt > 0 ? '(' + detail.secondCnt + ')': ''}` }}
        </span>
        <span v-else-if="detail.phoneVerified === 2" class="pop-container_tips-error">
          该手机号不正确
        </span>
      </div>
    </div>
    <template slot="reference">
      <svg-icon v-if="detail.phoneVerified === 0" name="mobile-unknown"></svg-icon>
      <svg-icon v-else-if="detail.phoneVerified === 1" name="mobile-success" style="color: #52c41a;"></svg-icon>
      <svg-icon v-else-if="detail.phoneVerified === 2" name="mobile-fail" style="color: #f5212d;"></svg-icon>
    </template>
  </el-popover>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { verifyPhone } from '@/api/accessManage'
import { generateTimer } from '@/utils/index'

@Component({
  name: 'PhoneInfo'
})
export default class extends Vue {
  @Prop() private detail: any

  private async verifyPhone() {
    const detail = this.detail
    if (!detail.secondCnt || detail.secondCnt <= 0) {
      try {
        await verifyPhone({
          iamUserId: detail.iamUserId
        })
        this.$message.success('验证短信发送成功!')
        generateTimer(detail, 60)
      } catch (err) {
        this.$message.error(err && err.message)
        if (err && err.code === 3) {
          const regResult = (err.message || '').match(/等待(\d+)/)
          const secondCnt = regResult && regResult[1]
          if (secondCnt > 0) {
            generateTimer(detail, secondCnt)
          }
        }
      }
    }
  }

  private beforeDestroy() {
    clearInterval(this.detail.secondCntTimer)
  }
}
</script>

<style lang="scss" scoped>
.pop-container {
  color: #000;

  &_title {
    margin-bottom: 10px;
  }

  &_phone {
    margin-bottom: 5px;

    &-number {
      margin-right: 5px;
    }
  }

  &_tips {
    &-unknown {
      color: $warning;
      cursor: pointer;
      text-decoration: underline;
    }

    &-unknown.disabled {
      color: $disabled-color;
      cursor: wait;
    }

    &-error {
      color: $danger;
    }
  }
}
</style>