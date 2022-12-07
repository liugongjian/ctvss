<template>
  <el-dialog
    title="锁定规则"
    :visible="true"
    width="50%"
    :before-close="handleClose"
    center
  >
    <el-form ref="form" :model="form" label-width="130px">
      <el-form-item label="IP" prop="list">
        <template slot="label">
          IP:
          <el-popover
            placement="top-start"
            width="400"
            trigger="hover"
            :open-delay="300"
            content="支持添加IP网段，例如192.168.0.1/24（多个IP使用回行分隔）"
          >
            <svg-icon slot="reference" class="form-question" name="help" />
          </el-popover>
        </template>
        <el-input v-model="form.list" type="textarea" />
      </el-form-item>
      <el-form-item label="锁定时常">
        <el-select v-model="form.time" placeholder="请选择锁定时常">
          <el-option v-for="item in timeList" :key="item.key" :label="item.label" :value="item.key" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="form.time === 'custom'" label="自定义解锁时间">
        <el-date-picker
          v-model="form.customTime"
          type="datetime"
          placeholder="选择日期时间"
        />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="centerDialogVisible = false">确 定</el-button>
      <el-button @click="centerDialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
@Component({
  name: 'LockRule'
})
export default class extends Vue {
  private form = {
    list: '',
    time: '30min',
    customTime: ''
  }

  private timeList = [
    {
      key: '30min',
      label: '30分钟'
    },
    {
      key: '1h',
      label: '1小时'
    },
    {
      key: '2h',
      label: '2小时'
    },
    {
      key: '6h',
      label: '6小时'
    },
    {
      key: '12h',
      label: '12小时'
    },
    {
      key: '24h',
      label: '24小时'
    },
    {
      key: '48h',
      label: '48小时'
    },
    {
      key: '72h',
      label: '72小时'
    },
    {
      key: 'custom',
      label: '自定义'
    }
  ]

  private handleClose() {
    this.form = {
      list: '',
      time: '30min',
      customTime: ''
    }
    this.$emit('on-close')
  }
}
</script>
