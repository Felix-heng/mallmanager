<template>
    <el-card class="box-card">
        <!-- 面包屑 -->
        <com-Breadcrumb level1="权限管理" level2="权限列表"></com-Breadcrumb>

        <!-- 数据表格  v-loading="loading" loading属性 是加载动画 当网速慢时会触发加载动画(loading值为true时触发)   -->
        <template>
            <el-table :data="roles" border style="margin: 30px 0px" height="450" v-loading="loading">
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="authName" label="权限"></el-table-column>
                <el-table-column prop="path" label="路径"></el-table-column>
                <el-table-column label="层级">
                    <template slot-scope="scope">
                       <span v-if="scope.row.level === '0'">一级</span>
                       <span v-if="scope.row.level === '1'">二级</span>
                       <span v-if="scope.row.level === '2'">三级</span>
                    </template>
                </el-table-column>
            </el-table>
        </template>
    </el-card>
</template>

<script>
    export default {
        data() {
            return {
                roles: [],
                loading: true ,  //当loading等于true是就会触发加载动画
            }
        },
        created () {
            this.loadData();
        },
        methods: {
            // loadData 是异步提交(类似于ajax)  当在方法前面加上async后就会变成一个同步提交 
            // 如果是异步提交 就会直接跳到代码(this.loading = false)开始执行则看不见加载效果
            // 而同步请求会等待请求执行完并返回数据后在 执行代码(this.loading = false) 就能看到加载效果
           async loadData() {
               await this.$http.get(`rights/list`)
                .then(res=>{
                    // 解构
                    const {data,meta:{msg,status}} = res.data
                    if (status === 200) {
                        this.roles = data
                    }
                }).catch(res=>{})
                this.loading = false
            }
        },
    }
</script>

<style scoped>

</style>