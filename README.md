QQ交流群~欢迎加入：`884587317`

#### 所有插件的下载连接在`Yunzai-bot根目录执行`，也可以自行查看源码后保存下载

#### 同时使用星铁插件和喵喵插件

<details><summary>展开/收起</summary>

`2023年9月5日更新了1.1版本，需要更新的请直接根目录重新跑一次下载指令，修复以前重复查询问题`

目前只兼容了`*更新面板`、`#星铁更新面板`、`*希儿面板`、`#星铁希儿面板`  

！！！并没有只有希儿能用！上面是举个例子！

默认关闭星铁插件，请下载插件后开启使用~

2023年9月13日提供`拦截星铁插件的绑定UID`功能，请自行查看注释，默认关闭！

就5个指令...自己琢磨吧~！
```
#插件面板状态
#星铁插件面板开启
#星铁插件面板关闭
#喵喵插件面板开启
#喵喵插件面板关闭
```

##### 下载
Github：
```
curl -o "./plugins/example/StarRail_v1.1.js" "https://raw.githubusercontent.com/Zyy955/Yunzai-Bot-plugin/main/StarRail_v1.1.js"
```
Gitee：
```
curl -o "./plugins/example/StarRail_v1.1.js" "https://gitee.com/Zyy955/Yunzai-Bot-plugin/raw/main/StarRail_v1.1.js"
```

</details>


#### 设置主人

<details><summary>展开/收起</summary>

为`Yunzai-Bot`设计，适用于`QQGuild-Plugin`

插件和`TRSS-Yunzai`自带的`#设置主人`并无区别，多了一个at添加主人

- 使用方法
  - 方法1：发送`#设置主人`，随后复制发送控制台的验证码即可成为主人
  - 方法2：发送`#设置主人@用户`，需要你是主人的情况下，指定此用户成为主人

主人可通过`#取消主人@用户`或者`#删除主人@用户`

##### 下载
Github：
```
curl -o "./plugins/example/SetMaster.js" "https://raw.githubusercontent.com/Zyy955/Yunzai-Bot-plugin/main/SetMaster.js"
```
Gitee：
```
curl -o "./plugins/example/SetMaster.js" "https://gitee.com/Zyy955/Yunzai-Bot-plugin/raw/main/SetMaster.js"
```

</details>

#### 无需登录QQ启动机器人

<details><summary>展开/收起</summary>

搭配[QQGuild-plugin](https://gitee.com/Zyy955/QQGuild-plugin)插件启用可无需登录QQ使用频道

##### 使用方法

下载完成后，使用`node apps`启动即可~

如果想使用原来的，使用`node app`启动即可~

##### 下载
Github：
```
curl -o "./apps.js" "https://raw.githubusercontent.com/Zyy955/Yunzai-Bot-plugin/main/apps.js"
```

Gitee：
```
curl -o "./apps.js" "https://gitee.com/Zyy955/Yunzai-Bot-plugin/raw/main/apps.js"
```

</details>

#### 全部更新改转发

<details><summary>展开/收起</summary>

```
#修改输出1、2、3
#输出方式

请自行设置三种输出方式
1：原方式
2：单独输出更新插件名称：开始更新 Miao-Yunzai 等
3：只输出一次 开始更新 Miao-Yunzai 随后更新完成合并转发输出
可使用指令修改输出方式，#修改输出1、#修改输出2、#修改输出3

#输出方式：查看当前的模式
```

##### 下载
Github：
```
curl -o "./plugins/example/forward_updateAll.js" "https://raw.githubusercontent.com/Zyy955/Yunzai-Bot-plugin/main/forward_updateAll.js"
```

Gitee：
```
curl -o "./plugins/example/forward_updateAll.js" "https://gitee.com/Zyy955/Yunzai-Bot-plugin/raw/main/forward_updateAll.js"
```

</details>


#### 提供js下载链接直接下载到example目录

<details><summary>展开/收起</summary>

使用说明：
![](https://cdn.jsdelivr.net/gh/Zyy955/imgs/img/202309130055196.png)

点击原始数据后，复制浏览器上方地址

![](https://cdn.jsdelivr.net/gh/Zyy955/imgs/img/202309130056145.png)

格式：
```
#下载https://gitee.com/Zyy955/Yunzai-Bot-plugin/raw/main/StarRail_v1.1.js

可选参数：自定义文件名称
#下载https://gitee.com/Zyy955/Yunzai-Bot-plugin/raw/main/StarRail_v1.1.js 星铁插件

得到`星铁插件.js`
```

##### 下载
Github：
```
curl -o "./plugins/example/download_js.js" "https://raw.githubusercontent.com/Zyy955/Yunzai-Bot-plugin/main/download_js.js"
```
Gitee：
```
curl -o "./plugins/example/download_js.js" "https://gitee.com/Zyy955/Yunzai-Bot-plugin/raw/main/download_js.js"
```

</details>


#### 踹

<details><summary>展开/收起</summary>

2023年9月13日之后，更新触发词`#踢`为`#踹`

- 暂时只支持以下几种场景
- 喵崽的QQ群 私聊
- 时雨崽的QQ群 私聊 QQ频道插件
- 不支持喵崽的频道插件 时雨崽的gocq频道
- 支持[新版QQGuild-plugin](https://gitee.com/Zyy955/QQGuild-plugin)

- 使用方法
  - 方法1：发送`#踢`，生成踢自己
  - 方法2：发送`#踢@用户`，生成踢对方

##### 效果图预览

![预览](https://cdn.jsdelivr.net/gh/Zyy955/imgs/img/202308021749791.gif)

##### 下载
Github：
```
curl -o "./plugins/example/kick.js" "https://raw.githubusercontent.com/Zyy955/Yunzai-Bot-plugin/main/kick.js"
```

Gitee：
```
curl -o "./plugins/example/kick.js" "https://gitee.com/Zyy955/Yunzai-Bot-plugin/raw/main/kick.js"
```

</details>

#### 怪物入侵

<details><summary>展开/收起</summary>

- 暂时只支持以下几种场景
- 喵崽的QQ群 私聊
- 时雨崽的QQ群 私聊 QQ频道插件
- 不支持喵崽的频道插件 时雨崽的gocq频道
- 支持[新版QQGuild-plugin](https://gitee.com/Zyy955/QQGuild-plugin)

- 使用方法
  - 方法1：发送`#怪物入侵`，怪物为自己
  - 方法2：发送`#怪物入侵@用户`，怪物为`@的用户`

##### 效果图预览

![](https://cdn.jsdelivr.net/gh/Zyy955/imgs/img/202308270006112.png)

##### 下载
Github：
```
curl -o "./plugins/example/invade.js" "https://raw.githubusercontent.com/Zyy955/Yunzai-Bot-plugin/main/invade.js"
```

Gitee：
```
curl -o "./plugins/example/invade.js" "https://gitee.com/Zyy955/Yunzai-Bot-plugin/raw/main/invade.js"
```

</details>

## 爱发电

![爱发电](https://cdn.jsdelivr.net/gh/Zyy955/imgs/img/202308271209508.jpeg)

