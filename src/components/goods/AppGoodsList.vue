<template>
<div>
    <el-card class="box-card">
        <!-- 面包屑 -->
        <com-Breadcrumb level1="商品管理" level2="商品列表"></com-Breadcrumb>
        <!-- <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb> -->

        <!-- 组合框 -->
        <el-row class="row">
            <el-col :span="8">
                <el-input placeholder="请输入内容" class="input-with-select" v-model="searchValue">
                    <el-button slot="append" icon="el-icon-search" @click="Load()"></el-button>
                </el-input>
            </el-col>
            <el-col :span="6">
                <el-button type="success" plain class="addbtn" @click="$router.push({name : 'goodsadd'})">添加商品</el-button>
            </el-col>
        </el-row>

        <!-- 数据表格 v-loading="loading" loading属性 是加载动画 当网速慢时会触发加载动画(loading值为true时触发) -->
        <template>
            <el-table :data="goods" border v-loading="loading" height=400>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="goods_name" label="商品名称"></el-table-column>
                <el-table-column prop="goods_price" label="商品价格 (元) " width="100px"></el-table-column>
                <el-table-column prop="goods_weight" label="商品重量" width="100px"></el-table-column>
                <el-table-column label="创建日期" width="160px">
                    <template slot-scope="scope">
                        {{scope.row.add_time |moment('YYYY-MM-DD HH:mm:ss')}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="140px">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit" circle plain @click="handleShowEdit(scope.row.goods_id)"></el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete" circle plain @click="handelDelete(scope.row.goods_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </template>

        <!-- 分页显示 -->
        <!--    size-change:页面显示条数，改变时会触发
                current-change:当前页，改变时会触发
                current-page   当前页码
                page-sizes   支持每页显示条数
                page-size   每页显示条数
                total   总条数
                layout  组件布局
      -->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total" class="pageHelp">
        </el-pagination>
    </el-card>
</div>
</template>

<script>
export default {
    data() {
        return {
            goods: [], //商品数据
            pagenum: 1, //当前页
            pagesize: 5, //每页条数
            total: 0, //总条数
            searchValue: "", //查询的内容
            loading: true,
        };
    },
    created() {
        // 查询数据
        this.Load();
    },
    methods: {
        // 显示编辑页面
        handleShowEdit(id) {
            this.$router.push({
                name: 'goodsedit',
                params: {
                    id: id
                }
            })
        },
        // 删除商品
        handelDelete(id) {
            this.$confirm("此操作将永久删除该商品, 是否继续?", "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning"
                })
                .then(() => {
                    this.$http.delete(`goods/${id}`).then(res => {
                        const {
                            data,
                            meta: {
                                msg,
                                status
                            }
                        } = res.data;
                        if (status === 200) {
                            this.$message.success(msg);
                            this.Load()
                        }
                    });
                })
                .catch(() => {});

        },

        // 加载数据
        async Load() {
            // query={查询的字段}  pagenum={当前页}  pagesize={每页数据条数}
            await this.$http
                .get(
                    `goods?query=${this.searchValue}&pagenum=${this.pagenum}&pagesize=${this.pagesize}`
                )
                .then(res => {
                    // 解构data
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data;
                    this.loading = false
                    if (status === 200) {
                        this.goods = data.goods
                        this.pagenum = data.pagenum
                        this.total = data.total
                    }
                });
        },
        // 页面大小发生变化
        handleSizeChange(val) {
            this.pagesize = val;
            this.Load();
        },
        // 页码发生变化
        handleCurrentChange(val) {
            this.pagenum = val;
            this.Load();
        }
    }
};
</script>

<style scoped>
.row {
    margin: 20px 0;
}

.addbtn {
    margin-left: 10px;
}

.pageHelp {
    text-align: center;
    margin: 20px 0;
}
</style>
