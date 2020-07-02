<template>
  <div>
    <el-form
      :inline="true"
      :model="filter"
    >
      <el-form-item label="Vhost">
        <el-input
          v-model="filter.Vhost"
          placeholder="请输入"
        />
      </el-form-item>
      <el-form-item label="AppName">
        <el-input
          v-model="filter.AppName"
          placeholder="请输入"
        />
      </el-form-item>
      <el-form-item label="StreamName">
        <el-input
          v-model="filter.StreamName"
          placeholder="请输入"
        />
      </el-form-item>
      <el-button type="primary">
        查询
      </el-button>
      <el-button>重置</el-button>
    </el-form>
    <el-table :data="streamList">
      <el-table-column
        prop="Vhost"
        label="Vhost"
      />
      <el-table-column
        prop="AppName"
        label="AppName"
      />
      <el-table-column
        prop="StreamName"
        label="StreamName"
      />
      <el-table-column
        prop="type"
        label="类型"
      />
      <el-table-column
        prop="startTime"
        label="开始推流时间"
        :formatter="formatDateInTable"
      />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="showPlayAddrDialog(scope.row)"
          >
            直播地址
          </el-button>
          <el-button
            type="text"
            @click="showStreamDetailDialog(scope.row)"
          >
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <dialog-addr
      v-if="showPlayAddr"
      :stream-info="streamInfo"
      @on-close="closeDialog()"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { format, isValid } from 'date-fns'
import DialogAddr from '../dialogs/DialogAddr.vue'

@Component({
  name: 'StreamList',
  components: {
    DialogAddr
  }
})
export default class extends Vue {
  private showPlayAddr = false;
  private streamInfo = {};

  private filter = {
    Vhost: '',
    AppName: '',
    StreamName: ''
  };

  private streamList = [
    {
      Vhost: 1,
      AppName: 2,
      StreamName: 3,
      type: 1
    }
  ];

  private showStreamDetailDialog(row: Object) {
    this.$emit('show-stream-detail', row)
  }

  private showPlayAddrDialog(row: Object) {
    this.showPlayAddr = true
    this.streamInfo = row
  }

  private formatDateInTable(formatString = 'yyyy-MM-dd HH:mm:ss') {
    return (row: any, col: any, val: any) => {
      if (val && isValid(new Date(val))) {
        return format(val, formatString)
      }
      return '- -'
    }
  }

  private closeDialog() {
    this.showPlayAddr = false
  }
}
</script>
<style lang="scss" scoped>
</style>
