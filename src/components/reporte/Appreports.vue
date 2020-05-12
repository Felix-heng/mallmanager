<template>
<el-card class="box-card">
    <!-- 面包屑 -->
    <com-Breadcrumb level1="数据统计" level2="数据报表"></com-Breadcrumb>
    <!-- 图形 -->
    <!-- 为 ECharts准备一个大小（宽高）的DOM -->
    <div id="main" style="width:800px;height:400px"></div>
</el-card>
</template>

<script>
// import echarts from 'echarts'
export default {
    data() {
        return {

        }
    },

    async mounted() {
        var echarts = require('echarts')
        var myChart = echarts.init(document.getElementById('main'))

        var option1 = {
            title: {
                text: '区域销售情况统计'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#6a7985'
                    }
                }
            }
        }
        await this.$http.get(`reports/type/1`)
            .then(res => {
                var option2 = res.data.data
                var option = {
                    ...option1,
                    ...option2
                }
                myChart.setOption(option)
            })

    }
}
</script>

<style scoped>

</style>
