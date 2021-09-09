<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-tabs :value="this.$route.query.tabNum ? 'result' : 'basic'" type="border-card" @tab-click="handleTabClick">
      <el-tab-pane label="基本信息" name="basic">
        <BasicAppInfo />
      </el-tab-pane>
      <el-tab-pane label="分析结果" name="result">
        <div class="left">
          <el-tree
            ref="dirTree"
            node-key="id"
            lazy
            show-checkbox
            :data="dirList"
            :load="loadDirs"
            :props="treeProp"
            :check-strictly="false"
            @check-change="onCheckDevice"
            @node-click="selectDevice"
          >
            <span slot-scope="{node, data}" class="custom-tree-node" :class="`custom-tree-node__${data.type}`">
              <span class="node-name">
                <svg-icon :name="data.type" color="#6e7c89" />
                {{ node.label }}
              </span>
            </span>
          </el-tree>
        </div>
        <div class="right">
          <div class="face-filter">
            <span>人脸库：</span>
            <el-select v-model="faceLib" placeholder="请选择" @change="handleSelectFaceLib">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <!-- <div ref="faceoptions" class="face-options">
              <div v-for="(item, index) in faceInfos" :id="item.id" :key="index" class="option" @click="handleFaceSelect(item)">
                <el-image :src="item.url" />
                <div class="option-info">
                  <span>{{ item.name }}</span>
                  <input :id="item.id+'input'" type="checkbox">
                </div>
              </div>
            </div> -->
            <!-- <div id="expand-btn" class="link-wrapper">
              <el-link type="warning" @click="handleExpand">{{ isExpand ? '- 收起' : '+ 展开' }}</el-link>
            </div> -->
            <div style="margin-top: 20px">
              <el-checkbox-group v-model="checkboxGroup1" size="mdedium">
                <el-checkbox v-for="(item, index) in faceInfos" :key="index" :label="index" border>
                  <div class="checkbox-content">
                    <img :src="item.url" alt="">
                    <span>{{ item.name }}</span>
                  </div>
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </div>

          <div class="query-wrapper">
            <span>截图时间：
              <el-radio-group v-model="queryParam.periodType" size="medium">
                <el-radio-button label="今天" />
                <el-radio-button label="近3天" />
                <el-radio-button label="自定义时间" />
              </el-radio-group>
              <el-date-picker
                v-if="queryParam.periodType === '自定义时间'"
                v-model="queryParam.period"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
            </span>
            <span>间隔频率：
              <el-select v-model="queryParam.frequency" placeholder="请选择">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </span>
          </div>
          <div class="chart-wrapper">
            <div class="title">
              <div class="title-block" />
              <span>人员聚集趋势</span>
            </div>
            <PeopleTrendChart
              :height="34"
              :param="queryParam"
            />
          </div>

          <div class="pic-wrapper">
            <div class="title">
              <div class="title-block" />
              <span>视频截图</span>
            </div>
            <div class="card-wrapper">
              <PicCard v-for="(pic, index) in picinfos" :key="index" :pic="pic" />
            </div>
            <el-pagination
              :hide-on-single-page="false"
              :total="5"
              layout="prev, pager, next"
            />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import PicCard from './component/PicCard.vue'
import PeopleTrendChart from './component/PeopleTrendChart.vue'
import BasicAppInfo from './component/BasicAppInfo.vue'
import { describeShareDevices } from '@/api/upPlatform'
import { getDeviceTree } from '@/api/device'
import { getGroups } from '@/api/group'
// import debounce from '@/utils/debounce'

@Component({
  name: 'AppDetail',
  components: {
    PicCard,
    PeopleTrendChart,
    BasicAppInfo
  }
})
export default class extends Vue {
    private treeProp = {
      label: 'label',
      children: 'children',
      isLeaf: 'isLeaf'
    }
    public loading = {
      dir: false
    }
    private dirList: any = []
    private breadCrumbContent: String = '应用详情'
    private appName: String = null
    private isExpand: boolean = false
    private expandBtnVisible: boolean = null
    private faceLib: String = 'all'
    private faceSelected: any = []
    private checkboxGroup1: any = []
    private queryParam: any = {
      periodType: '今天',
      period: '',
      device: 'all',
      frequency: 'all'
    }
    private faceInfos: any = [{
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      name: '高手高手',
      id: '1'
    }, {
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      name: '高手高手',
      id: '2'
    }, {
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      name: '高手高手',
      id: '3'
    }, {
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      name: '高手高手',
      id: '4'
    }, {
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      name: '高手高手',
      id: '5'
    }, {
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      name: '高手高手',
      id: '6'
    }, {
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      name: '高手高手',
      id: '7'
    }]
    private isLoading: boolean = false
    private options: any = [{
      value: 'all',
      label: '全部人脸库'
    }, {
      value: 'lib1',
      label: '第一人脸库'
    }, {
      value: 'lib2',
      label: '第二人脸库'
    }]
    private radio2: String = '今天'
    private picinfos: any = [{
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      time: '2021-07-07 08:56:45',
      device: 'IPC球机',
      rate: 0.65
    }, {
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      time: '2021-07-07 08:56:45',
      device: 'IPC球机',
      rate: 0.65
    }, {
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      time: '2021-07-07 08:56:45',
      device: 'IPC球机',
      rate: 0.65
    }, {
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      time: '2021-07-07 08:56:45',
      device: 'IPC球机',
      rate: 0.65
    }, {
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      time: '2021-07-07 08:56:45',
      device: 'IPC球机',
      rate: 0.65
    }, {
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      time: '2021-07-07 08:56:45',
      device: 'IPC球机',
      rate: 0.65
    }, {
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      time: '2021-07-07 08:56:45',
      device: 'IPC球机',
      rate: 0.65
    }, {
      url: 'https://img2.baidu.com/it/u=2708550806,1693850416&fm=26&fmt=auto&gp=0.jpg',
      time: '2021-07-07 08:56:45',
      device: 'IPC球机',
      rate: 0.65
    }]

    // @Watch('faceSelected')
    // selectFace(newArr :any, oldArr :any) {
    //   let difference: any = newArr.concat(oldArr).filter((v: any) => !newArr.includes(v) || !oldArr.includes(v))
    //   if (newArr.length < oldArr.length) {
    //     document.getElementById(difference[0]).classList.remove('selected')
    //     document.getElementById(difference[0] + 'input').checked = false
    //   } else {
    //     newArr.forEach((element: any) => {
    //       document.getElementById(element).classList.add('selected')
    //       document.getElementById(element + 'input').checked = true
    //     })
    //   }
    // }
    @Watch('queryParam.periodType')
    private periodTypeUpdated(newVal) {
      switch (newVal) {
        case '今天':
          // this.queryParam = {}
          break
        case '近3天':
          break
      }
    }
    private getData() {
      console.log(this.faceSelected)
    }
    // 防抖
    // private debounceHandle = debounce(this.getData, 500)

    private mounted() {
      this.initDirs()
      // this.handleExpandShow()
      // window.addEventListener('resize', this.handleExpandShow.bind(this), false)
    }

    public async initDirs() {
      try {
        this.loading.dir = true
        const res = await getGroups({
          pageSize: 1000
        })
        this.dirList = []
        res.groups.forEach((group: any) => {
          (group.inProtocol === 'gb28181' || group.inProtocol === 'ehome' || group.inProtocol === 'vgroup') && (
            this.dirList.push({
              id: group.groupId,
              groupId: group.groupId,
              label: group.groupName,
              inProtocol: group.inProtocol,
              type: group.inProtocol === 'vgroup' ? 'vgroup' : 'top-group',
              disabled: true,
              path: [{
                id: group.groupId,
                label: group.groupName,
                type: group.inProtocol === 'vgroup' ? 'vgroup' : 'top-group'
              }]
            })
          )
        })
        console.log('this.dirList:', this.dirList)
      } catch (e) {
        this.dirList = []
      } finally {
        this.loading.dir = false
      }
    }

    private async loadDirs(node: any, resolve: Function) {
      if (node.level === 0) return resolve([])
      const dirs = await this.getTree(node)
      resolve(dirs)
    }

    private async getTree(node: any) {
      try {
        if (node.data.type === 'role') {
          node.data.roleId = node.data.id
        } else if (node.data.type === 'group') {
          node.data.realGroupId = node.data.id
          node.data.realGroupInProtocol = node.data.inProtocol
        }
        let shareDeviceIds: any = []
        if (node.data.type !== 'vgroup' && node.data.type !== 'role') {
          let params: any = {
            platformId: this.platformId,
            inProtocol: node.data.inProtocol,
            groupId: node.data.realGroupId || node.data.groupId,
            dirId: node.data.type === 'top-group' || node.data.type === 'group' ? 0 : node.data.id,
            dirType: '0',
            pageNum: 1,
            pageSize: 1000
          }
          const shareDevices: any = await describeShareDevices(params)
          shareDeviceIds = shareDevices.devices.map((device: any) => {
            return device.deviceId
          })
        }

        const devices: any = await getDeviceTree({
          groupId: node.data.groupId,
          id: node.data.type === 'top-group' || node.data.type === 'vgroup' ? 0 : node.data.id,
          inProtocol: node.data.inProtocol,
          type: node.data.type === 'top-group' || node.data.type === 'vgroup' ? undefined : node.data.type,
          'self-defined-headers': {
            'role-id': node.data.roleId,
            'real-group-id': node.data.realGroupId
          }
        })
        if (node.data.type === 'role') {
          devices.dirs = devices.dirs.filter((dir: any) => dir.inProtocol === 'gb28181' || dir.inProtocol === 'ehome')
        }
        const dirTree: any = this.$refs.dirTree
        let checkedKeys = dirTree.getCheckedKeys()
        let dirs: any = devices.dirs.map((dir: any) => {
          let sharedFlag = false
          if (shareDeviceIds.includes(dir.id) && dir.type === 'ipc') {
            sharedFlag = true
            checkedKeys.push(dir.id)
            dirTree.setCheckedKeys(checkedKeys)
          }
          return {
            id: dir.id,
            groupId: node.data.groupId,
            label: dir.label,
            inProtocol: dir.inProtocol || node.data.inProtocol,
            isLeaf: dir.isLeaf,
            type: dir.type,
            disabled: dir.type !== 'ipc' || sharedFlag,
            path: node.data.path.concat([dir]),
            sharedFlag: sharedFlag,
            roleId: node.data.roleId || '',
            realGroupId: node.data.realGroupId || '',
            realGroupInProtocol: node.data.realGroupInProtocol || ''
          }
        })
        return dirs
      } catch (e) {
        console.log(e)
      }
    }

    private onCheckDevice() {
      const dirTree: any = this.$refs.dirTree
      const nodes = dirTree.getCheckedNodes()
      this.deviceList = nodes.filter((node: any) => {
        return (node.type === 'ipc' && !node.sharedFlag)
      })
    }

    private selectDevice(data: any) {
      if (data.type === 'ipc' && !data.sharedFlag) {
        const dirTree: any = this.$refs.dirTree
        const node = dirTree.getNode(data.id)
        dirTree.setChecked(data.id, !node.checked)
      }
    }

    private handleFaceSelect(option: any) {
      if (this.faceSelected.includes(option.id)) {
        this.faceSelected = this.faceSelected.filter((item: any) => item !== option.id)
      } else {
        this.faceSelected.push(option.id)
      }
      // this.debounceHandle()
    }
    private handleTabClick() {
      // resize 为了让图表触发刷新从而自适应尺寸
      const e = document.createEvent('Event')
      e.initEvent('resize', true, true)
      window.dispatchEvent(e)
    }
    // private handleExpand() {
    //   let expandDom: any = this.$refs.faceoptions
    //   if (this.isExpand) {
    //     expandDom.style.height = '86px'
    //     expandDom.style.overflow = 'hidden'
    //     expandDom.scrollTop = 0
    //   } else {
    //     if (expandDom.scrollHeight > 220) {
    //       expandDom.style.overflowY = 'auto'
    //       expandDom.style.height = '225px'
    //     } else {
    //       expandDom.style.height = expandDom.scrollHeight + 'px'
    //       expandDom.style.overflow = 'hidden'
    //     }
    //   }
    //   this.isExpand = !this.isExpand
    // }
    // private handleExpandShow() {
    //   const faceWrapperDom: any = document.getElementsByClassName('face-options')[0]
    //   if (faceWrapperDom.scrollHeight > faceWrapperDom.offsetHeight) {
    //     document.getElementById('expand-btn').style.display = 'block'
    //   } else {
    //     document.getElementById('expand-btn').style.display = 'none'
    //   }
    // }
    private handleSelectFaceLib(val) {
      // 请求后端数据并赋值给this.faceInfos
      switch (val) {
        case 'all':
          break
        case 'lib1':
          break
        case 'lib2':
          break
      }
    }
    private back() {
      this.$router.push({ name: 'AI-AppList' })
    }
}
</script>

<style lang='scss' scoped>
.el-tab-pane{
  display: flex;
}
.left {
    flex: 0 0 20%;
    vertical-align: top;
    height: 100%;
    padding: 10px;
    overflow: auto;
    .is-disabled + .custom-tree-node__ipc {
      cursor: not-allowed;
    }
}
.right{
  flex: 1 1;
  padding-left: 20px;
  border-left: 1px solid $borderGrey;
  .face-filter{
    margin-bottom: 20px;
      .el-checkbox-group{
        padding-left: 55px;
        .el-checkbox{
          line-height: 63px;
          height: 84px;
          width: 200px;
          position: relative;
          padding:0;
          margin: 0 58px 20px 0;
          ::v-deep .el-checkbox__input{
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-41%);
          }
          ::v-deep .el-checkbox__label{
            position: absolute;
            padding: 0;
            width: 160px;
            height: 100%;
            vertical-align: middle;
            .checkbox-content{
              display: flex;
              flex-direction: row;
              justify-content:space-between;
              align-items: center;
            }
            img{
              height: 100%;
            }
            span{
              display: inline-block;
            }
          }
        }
      }
      .checkbox-content{
        width: 100%;
        height: 100%;
      }
      .face-options{
          width: 88%;
          height: 86px;
          margin-left: 56px;
          overflow: hidden;
          transition: height .2s;
          &::-webkit-scrollbar {
              /*滚动条整体样式*/
              width : 1px;  /*高宽分别对应横竖滚动条的尺寸*/
              height: 1px;
          }
          &::-webkit-scrollbar-thumb {
              /*滚动条里面小方块*/
              border-radius   : 10px;
              background-color: #fff;
          }
          &::-webkit-scrollbar-track {
          /*滚动条里面轨道*/
              background   : #fff;
              border-radius: 10px;
          }
          .selected{
              border: rgba(250,131,52) solid 2px !important;
          }
          .option{
              cursor: pointer;
              display: inline-block;
              width: 15%;
              min-width: 167px;
              max-width: 222px;
              height: 54px;
              border: rgb(192,196,204) solid .5px;
              border-radius: 5px;
              margin:20px 20px 0 0;
              overflow: hidden;
              padding:0;
              .el-image{
                  display: inline-block;
                  height: 100%;
                  width: 40%;
                  min-width: 65px;
                  max-width: 70px;
              }
              .option-info{
                  float: right;
                  display: flex;
                  line-height: 54px;
                  width: 60%;
                  justify-content: space-around;
                  align-items: center;
              }
          }
      }
      .link-wrapper{
          margin-top: 10px;
          text-align: center;
      }
  }
  .query-wrapper{
      margin-bottom: 20px;
      padding-left: 10px;
      &>span{
          margin-right: 20px;
      }
      .el-date-editor{
        margin-left: 10px;
        padding-top: 2px;
      }
  }
  .pic-wrapper{
      .card-wrapper{
          // height: 40vh;
          // overflow-y: scroll;
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          flex-wrap: wrap;
      }
  }
  .title{
          height: 50px;
          vertical-align: middle;
          &>div{
              // display: inline-block;
              padding-top: 5px;
          }
          .title-block{
              width: 7px;
              height: 15px;
              background-color: rgba(250, 131, 52, 1);
              border: none;
              margin-top: 2px;
              margin-right: 5px;
              display: inline-block;
          }
          span {
              font-weight: bold;
          }
      }
}
</style>
