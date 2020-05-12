<template>
<div>
    <el-card class="box-card">
        <!-- 面包屑 -->
        <com-Breadcrumb level1="商品管理" level2="商品列表"></com-Breadcrumb>

        <!--  <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb> -->

        <!-- alert提示框 -->
        <el-alert title="添加商品信息" type="success" center show-icon :closable="false" class="alert"></el-alert>

        <!-- 步骤条 -->
        <el-steps :active="active*1" align-center finish-status="success">
            <el-step title="基本信息"></el-step>
            <el-step title="商品参数"></el-step>
            <el-step title="商品属性"></el-step>
            <el-step title="商品图片"></el-step>
            <el-step title="商品内容"></el-step>
        </el-steps>

        <!-- tabs标签页  :before-leave 属性 当返回值为false时则无法切换标签页-->
        <el-form label-position="top" label-width="80px" :model="formData">
            <el-tabs tab-position="left" class="alert" v-model="active" :before-leave="handleOpenTab" @tab-click="handleChangeTab">
                <el-tab-pane label="基本信息" name="1">
                    <!-- 信息表单 -->
                    <el-form-item label="商品名称">
                        <el-input v-model="formData.goods_name"></el-input>
                    </el-form-item>
                    <el-form-item label="商品价格">
                        <el-input v-model="formData.goods_price"></el-input>
                    </el-form-item>
                    <el-form-item label="商品重量">
                        <el-input v-model="formData.goods_weight"></el-input>
                    </el-form-item>
                    <el-form-item label="商品数量">
                        <el-input v-model="formData.goods_number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品分类">
                        <el-cascader :options="categorys" clearable v-model="selectOptions" :props="defaultProps"></el-cascader>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品参数" name="2">
                    <!-- 商品动态参数参数 根据商品分类的变化而变化-->
                    <el-form-item :label="item.attr_name" v-for="(item, index) in goodsDyParams" :key="index">
                        <el-checkbox :label="item1" v-model="item.attr_vals" border v-for="(item1, index) in item.attr_vals" :key="index" size="small"></el-checkbox>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品属性" name="3">
                    <!-- 商品静态参数 -->
                    <el-form-item :label="item.attr_name" v-for="(item, index) in goodsStaticParams" :key="index">
                        <el-input v-model="item.attr_vals"></el-input>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品图片" name="4">
                    <el-upload action="http://localhost:8888/api/private/v1/upload" list-type="picture-card" :headers="tokenHeader" :on-success="handleAvatarSuccess" :on-remove="handleRemove" :before-upload="beforeAvatarUpload">
                        <i class="el-icon-plus"></i>
                    </el-upload>
                    <el-dialog :visible.sync="dialogVisible">
                        <img width="100%" :src="dialogImageUrl" alt="">
                    </el-dialog>
                </el-tab-pane>
                <el-tab-pane label="商品内容" name="5">
                    <!-- 富文本控件 -->
                    <quill-editor v-model="formData.goods_introduce"></quill-editor>
                    <!-- 提交按钮 -->
                    <div class="btn">
                        <el-button type="success" @click="handleAddGoods">添加商品</el-button>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </el-form>
    </el-card>
</div>
</template>

<script>
// 引入富文本编辑的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 引入富文本编辑的控件
import {
    quillEditor
} from 'vue-quill-editor'
export default {
    data() {
        return {
            active: '1', //tabs标签页选中的值
            formData: {
                goods_cat: [],
                pics: [], //存储图片的数组
            }, //商品数据
            categorys: [], //商品分类下拉框参数
            goodsDyParams: [], //商品动态参数
            goodsStaticParams: [], //商品静态参数
            selectOptions: [], //选中的商品分类参数 (cat_id)
            defaultProps: { //商品分类数据  value :实际值  label : 显示值  children : 子集合  
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            dialogImageUrl: '', //图片显示的地址
            dialogVisible: false, //照片的显示

            tokenHeader: { //设置上传token
                'Authorization': localStorage.getItem('token')
            }
        }
    },
    components: {
        quillEditor
    },
    created() {
        this.loadDatacategories()
    },
    methods: {
        // 添加商品提交
        handleAddGoods() {
            // 处理 goods_cat 参数 ","合并
            this.formData.goods_cat = this.selectOptions.join(',')
            // 商品参数 = 静态参数+动态参数
            let arr1 = this.goodsDyParams.map(item => {
                let val = item.attr_vals === '' ? '' : item.attr_vals.join(',')
                return {
                    'attr_id': item.attr_id,
                    "attr_vals": val
                }
            })
            let arr2 = this.goodsStaticParams.map(item => {
                return {
                    'attr_id': item.attr_id,
                    "attr_vals": item.attr_vals
                }
            })
            // 合并两个数组
            this.formData.attrs = [...arr1, ...arr2]
            this.$http.post(`goods`, this.formData)
                .then(res => {
                    // 解构data
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data;
                    if (status === 201) {
                        this.$message.success(msg)
                        this.formData = {} //清空表单数据
                        this.$router.push({
                            name: 'goods'
                        })
                    }
                })
        },
        // 上传前的文件格式验证
        beforeAvatarUpload(file) {
            // 文件格式限制
            const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
            // 文件大小限制
            const isLt2M = file.size / 1024 / 1024 < 2;

            if (!isJPG) {
                this.$message.error('上传图片只能是 JPG或PNG 格式!');
            }
            if (!isLt2M) {
                this.$message.error('上传图片大小不能超过 2MB!');
            }
            return isJPG && isLt2M;
        },
        // 点击图片移除
        handleRemove(file, fileList) {
            // 遍历formData.pic ，找到需要溢出的图片数组
            this.formData.pics.forEach((item, index) => {
                if (item.pic === file.response.data.tmp_path) {
                    this.formData.pics.splice(index, 1)
                }
            })
        },
        // 图片上传成功
        handleAvatarSuccess(res, file) {
            if (res.meta.status === 200) {
                this.$message.success("图片上传成功")
                this.formData.pics.push({
                    'pic': res.data.tmp_path
                })
            } else {
                this.$message.success("图片上传成功")
            }
        },
        // 加载商品分类下拉框
        loadDatacategories() {
            this.$http.get(`categories`)
                .then(res => {
                    // 解构data
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data;
                    if (status === 200) {
                        this.categorys = data
                    }
                })
        },
        // 必须要有商品分类值 如果没有则不能切换标签页
        handleOpenTab() {
            // 在方法的最外层不能直接返回false 否则方法不能执行，因为它的期望值是true
            if (this.selectOptions.length === 0) {
                this.$message.warning("请选择商品分类！")
                return false
            }
            // return false
        },
        // 动态参数
        async handleChangeTab() {
            // 当active = 2 的时候标签页指向商品参数 
            if (this.active === '2') {
                await this.loadDataParams('many')
                this.goodsDyParams.forEach(item => {
                    item.attr_vals = item.attr_vals.length === 0 ? '' : item.attr_vals.split(',')
                })
            } else if (this.active === '3') {
                // 静态参数
                await this.loadDataParams()
            }

        },
        // 分类参数    默认 type = only 是静态参数
        async loadDataParams(type = 'only') {
            // 获取分类ID (获取选中商品id数组 并只需要最后一个id即可)
            let cat_id = this.selectOptions[2]
            await this.$http.get(`categories/${cat_id}/attributes?sel=${type}`)
                .then(res => {
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data
                    if (type === 'many') {
                        this.goodsDyParams = res.data.data
                    } else {
                        this.goodsStaticParams = res.data.data
                    }
                })
                .catch(res => {})
        }
    },
};
</script>

<style scoped>
.alert {
    margin: 20px 0;
}

.btn {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}
</style>
