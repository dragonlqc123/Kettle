# kettleweb【原创】

#### 介绍

基于原生kettle-6.1.0.1版本开发web版数据集成平台，交流群：861466073

#### 软件架构

1. 使用Spring3.2.8与Kettle6.1.0.1-196
2. 前端使用Ext3.4.1


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

#### 截图

![image text](https://gitee.com/wind137/kettleweb/raw/master/images/%E8%BF%90%E8%A1%8C%E6%88%AA%E5%9B%BE.png)

#### 参与贡献

1. Fork 本仓库
2. 新建 Feat_xxx 分支
3. 提交代码
4. 新建 Pull Request
