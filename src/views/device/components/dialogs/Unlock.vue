<template>
  <el-dialog
    title="录像解锁"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="900px"
    :append-to-body="true"
    center
    @close="closeDialog"
  >
    <div v-if="!multiple" v-loading="ischecking">
      <div class="unlock">
        <div class="label"><span>设备名: </span></div>
        <div><span>{{ deviceName }}</span></div>
        <div class="label"><span>录像时段: </span></div>
        <div>
          <el-date-picker
            v-model="lockTime"
            type="datetimerange"
            value-format="timestamp"
            disabled
          />
        </div>
      </div>
      <div v-if="isExpired" class="unlock-tip">
        <div class="tip-label" style="color: red;">
          <svg-icon name="warningtip" />
        </div>
        <div class="tip-content" style="color: red;">
          该段录像原始存储有效期为录制后的{{ originExpTime }}天，已超过原始存储期限，解锁后，将被系统删除。
        </div>
      </div>
    </div>
    <div v-if="multiple" v-loading="ischeckingBatch">
      <div class="unlock">
        <div class="label"><span>解锁录像: </span></div>
        <div><span>{{ unlockNum }}个</span></div>
        <div v-if="unlockDelNum > 0" class="label"><span>解锁后立即删除录像: </span></div>
        <div v-if="unlockDelNum > 0"><span>{{ unlockDelNum }}个</span></div>
      </div>
      <div v-if="unlockDelNum > 0" class="unlock-tip">
        <div class="tip-label" style="color: red;">
          <svg-icon name="warningtip" />
        </div>
        <div class="tip-content" style="color: red;">
          您选择的录像文件中有{{ unlockDelNum }}个录像文件已超过录制模板的存储时长，解锁后立即过期，将被系统删除。
        </div>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="submitting" @click="submit">
          确 定
        </el-button>
        <el-button @click="closeDialog(false)">取 消</el-button>
      </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { unLock } from '@/api/device'

@Component({
  name: 'UnlockDialog'
})
export default class extends Vue {
  // @Prop()
  // private duration
  @Prop()
  private screen
  @Prop()
  private unlockItem
  @Prop()
  private multiple

  private dialogVisible = true
  private submitting = false
  private isExpired = false
  private unlockNum = 0
  private unlockDelNum = 0
  private deviceName = null
  private lockTime = null
  private originExpTime = null
  private ischecking = false
  private ischeckingBatch = false
  private periods = []

  /* 当前分屏的录像管理器 */
  private get recordManager() {
    return this.screen && this.screen.recordManager
  }

  private async created() {
    try {
      this.multiple ? this.ischecking = true : this.ischeckingBatch = true
      this.screen && this.screen.deviceId && (this.unlockItem[0].deviceId = this.screen.deviceId)
      this.screen && this.screen.deviceName && (this.unlockItem[0].deviceName = this.screen.deviceName)
      this.periods = this.unlockItem.map((item: any) => {
        return {
          deviceId: item.deviceId,
          startTime: item.startTime,
          endTime: item.endTime,
        }
      })
      const params: any = {
        // deviceId: this.unlockItem[0].deviceId,
        // startTime: +this.unlockItem[0].startTime,
        // endTime: +this.unlockItem[0].endTime,
        periods: this.periods,
        action: 'check'
      }
      console.log('是不是这里哦   2', params, this.multiple)
      const res: any = await unLock(params)
      // 批量解锁
      if (this.multiple) {
        this.unlockNum = res.unlockNo
        this.unlockDelNum = res.deleteNo
      } else {
        // 单个解锁
        if (res.storageExpired === 1) {
          // 包含已过期录像
          this.originExpTime = res.storageTime
          this.isExpired = true
        } else if (res.storageExpired === 0) {
          // 不包含
          this.isExpired = false
        }
        this.deviceName = this.unlockItem[0].deviceName
        this.lockTime = [new Date(this.unlockItem[0].startTime * 1000), new Date(this.unlockItem[0].endTime * 1000)]
      }
    } catch (e) {
      this.$message.error(e)
      this.closeDialog(false)
    } finally {
      this.ischecking = false
      this.ischeckingBatch = false
    }
    // 录像锁定管理
    // if (this.multiple) {
    //   this.unlockItem.map((item: any) => {
    //     if (item.exp_time === '解锁时刻') {
    //       this.unlockDelNum += 1
    //     }
    //   })
    //   this.unlockNum = this.unlockItem.length
    //   // console.log(' this.unlockDelNum   this.unlockNum ',  this.unlockDelNum, this.unlockNum)
    // } else {
    //   // console.log('解锁 dialog    ', this.unlockItem)
    //   this.deviceName = this.screen.deviceName
    //   this.lockTime = [new Date(this.unlockItem[0].startTime * 1000), new Date(this.unlockItem[0].endTime * 1000)]
    //   // this.isExpired = this.unlockItem[0].exp_time === '解锁时刻'
    //   // this.originExpTime = this.unlockItem[0].origin_exp_time
    // }
    // console.log('获取锁定时间    : ', this.recordLockItem)
  }

  // 提交锁定
  private async submit() {
    try {
      this.submitting = true
      console.log('提交解锁   ', this.multiple)
      // this.unlockItem[0].deviceId = this.screen.deviceId
      // this.unlockItem[0].deviceName = this.screen.deviceName

      const params: any = {
        // ...this.unlockItem[0],
        periods: this.periods,
        action: 'unlock'
      }
      await unLock(params)
      this.submitting = false
      this.closeDialog(true)
      // 一个emit提示页面重新获取锁列表
      // await this.screen.recordManager.getRecordListByDate(this.screen.recordManager.currentDate)
    } catch (e) {
      this.$message.error(e)
      this.submitting = false
      this.closeDialog()
    }
  }

  // 关闭 dialog
  private closeDialog(isRefresh: boolean = false) {
    this.dialogVisible = false
    console.log('离谱我靠    ', isRefresh)
    this.$emit('on-close', isRefresh) // 在父级组件中根据true false 判断刷新列表或执行其他操作
  }
}
</script>
<style lang="scss" scoped>
// .form {
//   display: grid;
//   margin-left: 16%;
//   grid-template-columns: 100px 400px;
// }

.unlock {
  display: grid;
  margin-left: 16%;
  grid-template-columns: 100px 400px;
  grid-template-rows: 36px 36px;
  grid-gap: 25px;
  align-items: center;

  & .label {
    justify-self: end;
    width: 130px;
    text-align: end;
  }
}

.unlock-tip {
  display: grid;
  margin-top: 25px;
  margin-left: 16%;
  grid-template-columns: 65px 455px;
  grid-column-gap: 10px;
  align-items: center;

  & .tip-label {
    justify-self: end;
    align-self: start;
  }
}

.dialog-footer {
  margin-top: 40px;
}
</style>
