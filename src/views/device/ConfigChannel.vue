<template>
  <div class="app-container configChannelBox">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-table
      ref="channelTable"
      v-loading="tableLoading"
      :data="channelData"
      empty-text="暂无通道"
      @selection-change="selectChannel"
      @select="selectHandle"
    >
      <el-table-column type="selection" width="55" prop="selection" :selectable="ifDisabled" />
      <el-table-column prop="channelNum" label="通道号" />
      <el-table-column prop="channelName" label="通道名称" />
      <!-- <el-table-column prop="deviceStatus" label="接入状态">
        <template slot-scope="scope">
          <status-badge :status="scope.row.deviceStatus === 'on' ? 'on' : 'warning'" />
          {{ statusToText[scope.row.deviceStatus] || '未知' }}
        </template>
      </el-table-column> -->
      <el-table-column prop="deviceStatus" label="设备本地状态">
        <template slot-scope="scope">
          <status-badge :status="scope.row.deviceStatus === 'on' ? 'on' : 'warning'" />
          {{ statusToText[scope.row.deviceStatus] || '未知' }}
        </template>
      </el-table-column>
      <el-table-column prop="deviceVendor" label="厂家" />
      <!-- <el-table-column prop="createdTime" label="接入时间" /> -->
    </el-table>
    <div class="configChannelBtnBox">
      <el-button type="primary" :loading="submitting" :disabled="selectChannels.length===0" @click="sureConfig">确定</el-button>
      <el-button @click="cancelConfig">取消</el-button>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Mixins } from 'vue-property-decorator'
import createMixin from './mixin/createMixin'
import { getChannelList, configChannels } from '@/api/device'
import StatusBadge from '@/components/StatusBadge/index.vue'

@Component({
  name: 'ConfigEhomeNvrChannel',
  components: {
    StatusBadge
  }
})
export default class extends Mixins(createMixin) {
  private channelData = [
    // {
    //   channelNum: '1',
    //   channelName: '通道名称1',
    //   deviceStatus: 'on',
    //   deviceVendor: '海康'
    // },
    // {
    //   channelNum: '2',
    //   channelName: '通道名称2',
    //   deviceStatus: 'off',
    //   deviceVendor: '海康'
    // },
    // {
    //   channelNum: '3',
    //   channelName: '通道名称3',
    //   deviceStatus: 'on',
    //   deviceVendor: '海康'
    // }
  ]

  private statusToText = {
    'on': '在线',
    'off': '离线'
  }
  private dialogVisible = false

  private tableLoading = false

  private selectChannels:any = []

  private async mounted() {
    await this.getChannels()
  }

  // 获取子通道列表
  private async getChannels() {
    try {
      this.tableLoading = true
      const params = {
        inProtocol: this.inProtocol,
        parentDeviceId: this.deviceId
      }
      const { deviceChannels } = await getChannelList(params)
      // 如果有通道号传入，即为编辑过子通道
      if (this.$route.query.channelNumList) {
        const channelNumList = (this.$route.query.channelNumList as string).split(',').map(Number)
        const result = deviceChannels.filter((item:any) => {
          return channelNumList.some((val:any) => {
            return val === item.channelNum
          })
        })
        this.selectChannels = result
        this.setChecked()
      }

      if (this.$route.query.channelSize) {
        this.channelSize = this.$route.query.channelSize
      }
      this.channelData = deviceChannels
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.tableLoading = false
    }
  }

  private ifDisabled(row:any) {
    return row.deviceStatus === 'on'
  }

  // 通道checkbox状态改变
  private selectChannel(selection:any) {
    if (selection.length > this.channelSize) {
      this.selectChannels = selection.slice(0, this.channelSize)
      this.setChecked()
      const temp = selection.slice(this.channelSize)
      if (temp.length > 0) {
        this.$message({
          message: `可配置子通道数量不可超过${this.channelSize}个`,
          type: 'warning'
        })
        temp.forEach((ele:any) => {
          if (this.$refs.channelTable) {
            (this.$refs.channelTable as any).toggleRowSelection(ele, false)
          }
        })
      }
    } else if (selection.length > 0 && selection.length <= this.channelSize) {
      this.selectChannels = selection
      this.setChecked()
    } else {
      // 全不选时 逻辑
      this.$confirm('确定取消全部通道么？', '提示', {
        confirmButtonText: '关闭',
        cancelButtonText: '确定取消',
        type: 'warning'
      }).then(() => {
        this.setChecked()
      }).catch(() => {
        this.selectChannels = selection
        if (this.$refs.channelTable) {
          (this.$refs.channelTable as any).clearSelection()
        }
      })
    }
  }

  // 手动勾选checkbox逻辑
  private selectHandle(selection:any, row:any) {
    const result = selection.filter((item:any) => item.channelNum === row.channelNum)
    if (result.length > 0) {
      this.setChecked()
    } else {
      // 取消逻辑
      this.$confirm('确定取消此通道么？', '提示', {
        confirmButtonText: '关闭',
        cancelButtonText: '确定取消',
        type: 'warning'
      }).then(() => {
        const selectResult = [...selection, row]
        this.selectChannels = selectResult
        this.setChecked()
      }).catch(() => {
        this.selectChannels = selection
        this.setChecked()
      })
    }
  }

  // 设置选中状态
  private setChecked() {
    this.$nextTick(() => {
      this.selectChannels.forEach((ele:any) => {
        if (this.$refs.channelTable) {
          (this.$refs.channelTable as any).toggleRowSelection(ele, true)
        }
      })
    })
  }

  // 配置确认
  private async sureConfig() {
    try {
      this.submitting = true
      const params = {
        inProtocol: this.inProtocol,
        parentDeviceId: this.deviceId,
        deviceChannels: this.selectChannels
      }
      await configChannels(params)
      this.$message.success('配置子通道成功！')
      this.back()
      this.initDirs()
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.submitting = false
    }
  }

  // 配置取消
  private cancelConfig() {
    this.back()
  }
}
</script>

<style lang="scss" scoped>
  .configChannelBox{
    .configChannelBtnBox{
      margin-top: 20px;
      text-align: center;
    }
  }

</style>
