# kettleweb【原创】

#### 介绍
基于原生kettle-6.1.0.1版本开发web版数据集成平台

#### 软件架构
1、使用Spring3.2.8与Kettle6.1.0.1-196
2、前端使用Ext3.4.1


#### 安装教程

本项目使用apache-maven-3.2.3和jdk1.7(1.8可以启动，但访问页面报错)构建

1. 在kettleweb下面打开命令行窗口
2. 输入mvn install
3. cd kettle-webapp/
4. mvn jetty:run
5. 访问http://localhost:8088/web/

#### 使用说明

1. 双击左侧资源库中已存在的转换，或者点击新增转换或作业，进入设计器界面
2. 从左侧核心对象面板内拖拽2个组件到右侧的网格设计区
3. 将鼠标移动到组件中心位置上，待组件边框变成绿色后，点击鼠标左键开始连线
4. 双击组件进行配置，或者右键组件选择需要操作的功能
5. 在线体验地址：http://182.61.45.14/web/

#### 参与贡献

1. Fork 本仓库
2. 新建 Feat_xxx 分支
3. 提交代码
4. 新建 Pull Request


#### 码云特技

1. 使用 Readme\_XXX.md 来支持不同的语言，例如 Readme\_en.md, Readme\_zh.md
2. 码云官方博客 [blog.gitee.com](https://blog.gitee.com)
3. 你可以 [https://gitee.com/explore](https://gitee.com/explore) 这个地址来了解码云上的优秀开源项目
4. [GVP](https://gitee.com/gvp) 全称是码云最有价值开源项目，是码云综合评定出的优秀开源项目
5. 码云官方提供的使用手册 [https://gitee.com/help](https://gitee.com/help)
6. 码云封面人物是一档用来展示码云会员风采的栏目 [https://gitee.com/gitee-stars/](https://gitee.com/gitee-stars/)