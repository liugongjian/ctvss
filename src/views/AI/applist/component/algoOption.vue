<template>
  <div>
    <el-row>
      <el-tabs v-model="activeName" @tab-click="handleTabType">
        <el-tab-pane v-for="tab in tabInfo" :key="tab.name" :label="tab.label" :name="tab.name">
          <div class="card-container">
            <ProdCard v-for="prod in prodInfo" :key="prod.id" :prod="prod" @changeStep="changeStep" />
          </div>
          <el-button>取消</el-button>
        </el-tab-pane>
      </el-tabs>
      <el-input v-model="input3" placeholder="请输入应用名称 / 描述" class="input-with-select">
        <el-button slot="append" icon="el-icon-search" />
      </el-input>
    </el-row>
  </div>
</template>
<script>
import ProdCard from './prodCard.vue'
export default {
  components: { ProdCard },
  props: ['step'],
  data() {
    return {
      activeName: 'all',
      tabInfo: [
        { label: '全部', name: 'all' },
        { label: '人脸识别', name: 'face' },
        { label: '人体识别', name: 'body' },
        { label: '场景识别', name: 'scene' }
      ],
      prodInfo: [
        { id: 1, name: '人脸比对', description: '两张人脸进行 1：1 比对，得到人脸相似度，分析图片中人脸的遮挡度、模糊度、光照强度、姿态角度、完整度，基于输出的符合质量标准的图片，返回准确的相似度评分。' },
        { id: 2, name: '人流量统计', description: '适用于3米以上的中远距离俯拍，以头部为识别目标统计图片中的瞬时人数；无人数上限，广泛适用于机场、车站、商场、展会、景区等人群密集场所。' },
        { id: 3, name: '手势识别', description: '识别图片中的手部位置和手势类型，可识别24种常见手势，包括拳头、OK、比心、作揖、作别、祈祷、我爱你、点赞、Diss、Rock、竖中指、数字等。' },
        { id: 4, name: '人脸属性识别', description: '检测出授权图像中人脸数量，输出人脸概率、性别、年龄、表情（中性/微笑）、是否戴眼镜、是否佩戴口罩六种属性和人脸的1024维深度学习特征，可实现高性能的人脸识别。' },
        { id: 4, name: '人流量统计', description: '适用于3米以上的中远距离俯拍，以头部为识别目标统计图片中的瞬时人数；无人数上限，广泛适用于机场、车站、商场、展会、景区等人群密集场所。' },
        { id: 4, name: '手势识别', description: '识别图片中的手部位置和手势类型，可识别24种常见手势，包括拳头、OK、比心、作揖、作别、祈祷、我爱你、点赞、Diss、Rock、竖中指、数字等。' }
      ]
    }
  },
  methods: {
    changeStep(val) {
      this.$emit('update:step', val.step)
      val.prod && this.$emit('update:prod', val.prod)
    }
  }
}
</script>
<style scoped>
.input-with-select {
    width: 260px;
    position: absolute;
    top:0;
    right: 0;
}
.el-row{
    position: relative;
}
.card-container{
    overflow: auto;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content:space-around;
    align-content: flex-start;
    height: 60vh;
    min-width: 1200px;
    min-height: 400px;
}
</style>
