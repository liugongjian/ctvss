<template>
  <DashboardContainer title="网络流量统计">
    <template v-slot:header>
      <el-select
        size="small"
        v-model="userType"
        clearable
        @change="flowTypeChange"
      >
        <el-option
          v-for="time in timeList"
          :key="time.value"
          :label="time.label"
          :value="time.value"
        />
      </el-select>
    </template>
    <div id="flow-container"></div>
  </DashboardContainer>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Chart } from "@antv/g2";
import DashboardContainer from "./DashboardContainer.vue";
import { getFlowData } from "@/api/dashboard";

@Component({
  name: "DashboardDevice",
  components: { DashboardContainer },
})
export default class extends Vue {
  private timeList: Array<{ label: string; value: string }> = [
    {
      label: "最近12小时",
      value: "12",
    },
    {
      label: "最近6小时",
      value: "6",
    },
    {
      label: "最近3小时",
      value: "3",
    },
  ];
  private flowData = [];
  private userType = "12";
  private async created() {
    this.drawChart()
  }
  private flowTypeChange() {}
  private async drawChart() {
    const res = await getFlowData({});
    console.log('res: ', res)
    this.flowData = res;
    const chart = new Chart({
      container: "flow-container",
      autoFit: true,
      height: 500,
    });
    chart.data(this.flowData);
    chart.scale({
      time: {
        range: [0, 1],
      },
      value: {
        nice: true,
      },
    });

    chart.tooltip({
      showCrosshairs: true,
      shared: true,
    });


    chart.axis("value", {
      label: {
        formatter: (val) => {
          return val + " /Mbps";
        },
      },
    });

    chart.line().position("time*value").color("type").shape("smooth");

    chart.point().position("time*value").color("type").shape("circle");

    chart.render();
  }
}
</script>
<style lang="scss" scoped>
</style>
