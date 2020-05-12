<template>
<div>
    <el-card class="box-card">
        <!-- 面包屑 -->
        <com-Breadcrumb level1="订单管理" level2="订单列表"></com-Breadcrumb>

        <!-- 数据表格 v-loading="loading" loading属性 是加载动画 当网速慢时会触发加载动画(loading值为true时触发) -->
        <template>
            <el-table :data="orders" border v-loading="loading" class="mt">
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="order_number" label="订单编号"></el-table-column>
                
                <el-table-column prop="order_price" label="订单价格"></el-table-column>
                <el-table-column label="是否付款">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.pay_status === '1'"  type="success">已付款</el-tag>
                        <el-tag v-if="scope.row.pay_status === '0'">未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="is_send" label="是否发货"></el-table-column>
                <el-table-column label="下单时间">
                    <template slot-scope="scope">{{scope.row.create_time |moment('YYYY-MM-DD HH:mm:ss')}}</template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit" circle plain @click="handleShowEdit(scope.row)"></el-button>
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
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pagenum"
         :page-sizes="[5, 10, 15, 20]" :page-size="pagesize" 
         layout="total, sizes, prev, pager, next, jumper" :total="total" class="pageHelp"></el-pagination>

        <!-- 编辑用户对话框 -->
        <el-dialog title="编辑订单" :visible.sync="dialogFormVisibleEdit" @closed="handelClose">
            <el-form :model="formdata">
                <el-form-item label="订单号" label-width="120px">
                    <span>{{formdata.order_number}}</span>
                </el-form-item>
                <el-form-item label="是否发货" label-width="120px">
                    <template>
                        {{formdata.is_send}}
                        <el-switch v-model="formdata.is_send"
                         active-value="是" inactive-value="否"
                         active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                    </template>
                </el-form-item>
                <el-form-item label="订单支付" label-width="120px">
                    <template>
                        <el-radio-group v-model="formdata.order_pay">
                            <el-radio label="0">未支付</el-radio>
                            <el-radio label="1">支付宝</el-radio>
                            <el-radio label="2">微信</el-radio>
                            <el-radio label="3">银行卡</el-radio>
                        </el-radio-group>
                    </template>
                </el-form-item>
                <el-form-item label="订单价格" label-width="120px">
                    <el-input v-model="formdata.order_price"></el-input>
                </el-form-item>
                <el-form-item label="送货地址" label-width="120px" >
                    <template>
                        <el-cascader size="large" 
                        :options="options" 
                        v-model="selectedOptions" >
                        </el-cascader>
                    </template>
                </el-form-item>
                <el-form-item label="详细地址" label-width="120px">
                     <el-input v-model="address"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="handelClose">取 消</el-button>
                <el-button type="primary" @click="handleEditOrder">修改</el-button>
            </div>
        </el-dialog>
    </el-card>
</div>
</template>

<script>
import { provinceAndCityData, regionData, provinceAndCityDataPlus, regionDataPlus, CodeToText, TextToCode } from 'element-china-area-data'
export default {
    data() {

        return {
            orders: [], //订单数据
            pagenum: 1, //当前页
            pagesize: 5, //每页条数
            total: 0, //总条数
            radio: 0,
            formdata: {}, //表单数据
            dialogFormVisibleEdit: false, //修改订单话框
            loading: true,
            options: regionData, //地理位置下拉框
            selectedOptions: [],  //选中的地址
            address: '', //详细地址
        };
    },
    created() {
        // 查询数据
        this.Load();
    },
    methods: {
        // 修改订单
        handleEditOrder(){
            // 是否发货
            this.formdata.is_send = this.is_send === '是'? '0':'1'
            // 修改支付状态
           if(this.formdata.order_pay === '0'){
               this.formdata.pay_status = '0'
           }else{
               this.formdata.pay_status = '1'
           }
            //  地址 consignee_addr = 省市区+详细地址
            this.formdata.consignee_addr = (this.selectedOptions.length===0 ? '' : this.selectedOptions.join(','))+
            (this.address===''?'':(','+this.address))

            
            
            
            this.$http.put(`orders/${this.formdata.order_id}`,this.formdata)
            .then(res=>{
                const {data,meta:{msg,status}} = res.data
                if (status === 201) {
                    this.$message.success(msg)
                    this.dialogFormVisibleEdit = false
                    this.Load()
                }
            })
            .catch(res=>{})

            
        },
        // 地址信息级联下拉框
        /* handleChange(value) {
             用CodeToText转换成中文
            console.log(CodeToText[value[0]]) 
            console.log(CodeToText[value[1]]) 
            console.log(CodeToText[value[2]]) 
            this.selectedOptions[0] = CodeToText[value[0]]
            this.selectedOptions[1] = CodeToText[value[1]]
            this.selectedOptions[2] = CodeToText[value[2]]
            }, */

        // 打开编辑订单
        handleShowEdit(order) {
                 this.dialogFormVisibleEdit = true
                 this.is_send = order.is_send
                 this.formdata = order
                // 获取省市区
                this.selectedOptions = this.formdata.consignee_addr===''? [] :this.formdata.consignee_addr.split(',',3)
                // 获取详细地址
                this.address = this.formdata.consignee_addr===''?'' : (this.formdata.consignee_addr
                .substring(this.formdata.consignee_addr.lastIndexOf(',')+1))
            },
        // 关闭添加窗口
        handelClose() {
         // 清空所有表单数据
            this.formdata = {}
            this.selectedOptions = {}
            this.address = ''
            this.dialogFormVisibleEdit = false
        },
        // 加载数据
        async Load() {
                        // query={查询的字段}  pagenum={当前页}  pagesize={每页数据条数}
                        await this.$http.get(`orders?pagenum=${this.pagenum}&pagesize=${this.pagesize}`)
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
                                    this.orders = data.goods;
                                    this.pagenum = data.pagenum;
                                    this.total = data.total;
                                }
                            });
                    },
                    // 翻页显示数据

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
.mt {
    margin: 20px 0;
}

.pageHelp {
    text-align: center;
    margin: 20px 0;
}
</style>
