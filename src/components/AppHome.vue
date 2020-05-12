<template>
<div class="container">
    <!-- <h1>you'er Welcome</h1> -->
    <el-container class="container">
        <!-- 导航栏 -->
        <el-header class="header">
            <el-row>
                <el-col :span="22">
                    <h2>电商后台管理系统</h2>
                </el-col>
                <el-col :span="2">
                    <a href="#" @click.prevent="handelExit()">退出</a>
                </el-col>
            </el-row>
        </el-header>

        <el-container>
            <!-- 侧边 -->
            <el-aside width="200px" class="aside">
                <!-- 侧边栏 :unique-opened="true" 属性(当第二次点击新的菜单列时，第一次展开的菜单列就会关闭，保证菜单列只有一个被展开)-->
                <el-menu class="menu" :unique-opened="true" :router="true">
                    <el-submenu :index="index + ''" v-for="(item, index) in menus" :key="index">
                        <template slot="title">
                            <i class="el-icon-setting"></i>
                            <span>{{item.authName}}</span>
                        </template>
                        <el-menu-item :index="'/'+item1.path" v-for="(item1, index) in item.children" :key="index">
                            <i class="el-icon-menu"></i>
                            <span slot="title">{{item1.authName}}</span>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!-- 内容区域 -->
            <el-main class="main">
                <!-- 动态显示组件区域  嵌套路由  子路由-->
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</div>
</template>

<script>
export default {
    data() {
        return {
            menus: [], //左侧菜单
        }
    },
    // 判断是由有token(凭证)  如果没有就说明没有通过账号和密码直接进入主页
    /*  beforeCreate() {
         let token = localStorage.getItem("token");
         if (!token) {
             //true  没有登陆 token = null
             // 跳转登录页面
             this.$router.push({
                 name: "login"
             });
             this.$message.warning("请先登录");
         }
     }, */
    // 动态加载左侧菜单栏
    created() {
        this.$http.get(`menus`)
            .then(res => {
                const {
                    data,
                    meta: {
                        msg,
                        status
                    }
                } = res.data
                if (status === 200) {
                    this.menus = data
                }
            })
            .catch(res => {})
    },
    methods: {
        //   退出
        handelExit() {
            //  清除token凭证
            localStorage.clear();
            // 跳转到登录页面
            this.$router.push({
                name: "login"
            });
        }
    }
};
</script>

<style scoped>
.header {
    background-color: #222;
    color: #fff;
    text-align: center;
    line-height: 60px;
}

.header a {
    color: #fff;
}

.container,
.aside,
.menu {
    height: 100%;
}
</style>
