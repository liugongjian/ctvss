<template>
  <div>
    <el-row>
      <el-button type="warning" @click="addApp">新建AI应用</el-button>
    </el-row>
    <el-row>
      <el-tabs v-model="activeName" type="border-card" @tab-click="handleTabType">
        <el-tab-pane v-for="item in tabInfo" :key="item.name" :label="item.label" :name="item.name">
          <el-row>
            <el-button>启用</el-button>
            <el-button>停用</el-button>
            <el-button>删除</el-button>
            <el-input v-model="input3" placeholder="请输入应用名称 / 描述" class="input-with-select">
              <el-button slot="append" icon="el-icon-search" />
            </el-input>
          </el-row>
          <el-row>
            <el-table
              ref="multipleTable"
              :data="tableData"
              tooltip-effect="dark"
              style="width: 100%"
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column label="应用名称" width="120">
                <template slot-scope="scope"><el-link type="warning">{{ scope.row.date }}</el-link></template>
              </el-table-column>
              <el-table-column prop="name" label="算法类型" width="120" />
              <el-table-column prop="address" label="分析类型" />
              <el-table-column prop="description" label="描述" show-overflow-tooltip />
              <el-table-column prop="device" label="关联设备数" />
              <el-table-column prop="status" label="状态">
                <template slot-scope="scope"><span>{{ parseInt(scope.row.status) ? '启用' : '未启用' }}</span></template>
              </el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-link type="warning">分析结果</el-link>
                  <el-popover
                    placement="bottom"
                    popper-class="more"
                    trigger="click"
                  >
                    <div><el-link>应用详情</el-link></div>
                    <div><el-link>编辑</el-link></div>
                    <div><el-link>停用</el-link></div>
                    <div><el-link>删除</el-link></div>
                    <el-link slot="reference" type="warning">更多</el-link>
                  </el-popover>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              :hide-on-single-page="false"
              :total="5"
              layout="prev, pager, next"
            />
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </el-row>
  </div>
</template>
<script>
// @ts-ignore
export default {
  data() {
    return {
      activeName: 'all',
      tabInfo: [
        { label: '全部', name: 'all' },
        { label: '人脸识别', name: 'face' },
        { label: '人体识别', name: 'body' },
        { label: '场景识别', name: 'scene' }
      ],
      tableData: [{
        date: '人员布控03',
        name: '人员聚集',
        address: '分钟级',
        description: 'xxxxxxxxxxx',
        device: '3',
        status: '-1'
      }, {
        date: '人员布控03',
        name: '人员聚集',
        address: '分钟级',
        description: 'xxxxxxxxxxx',
        device: '3',
        status: '0'
      }, {
        date: '人员布控04',
        name: '人脸比对',
        address: '高算力',
        description: 'xxxxxxxxxxx',
        device: '3',
        status: '1'
      }, {
        date: '人员布控01',
        name: '人脸比对',
        address: '秒级',
        description: 'xxxxxxxxxxx',
        device: '3',
        status: '1'
      }, {
        date: '人员布控08',
        name: '人脸比对',
        address: '秒级',
        description: 'xxxxxxxxxxx',
        device: '3',
        status: '1'
      }, {
        date: '人员布控06',
        name: '人脸比对',
        address: '秒级',
        description: 'xxxxxxxxxxx',
        device: '3',
        status: '1'
      }, {
        date: '人员布控07',
        name: '人脸比对',
        address: '秒级',
        description: 'xxxxxxxxxxx',
        device: '3',
        status: '1'
      }],
      multipleSelection: []
    }
  },
  computed: {
  },
  watch: {
  },
  methods: {
    addApp() {
      this.$router.push({ path: '/AI/add', params: { appType: 1 } })
    }
  }
}
</script>

<style scoped>
.input-with-select {
    float: right;
    width: 260px;
}
</style>
