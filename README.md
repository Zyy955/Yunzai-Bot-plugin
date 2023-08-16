### 所有插件的下载连接在`Yunzai-bot根目录执行`，也可以自行查看源码后保存下载

## 同时使用星铁插件和喵喵插件

目前只兼容了`*更新面板`、`#星铁更新面板`、`*希儿面板`、`#星铁希儿面板`  

！！！并没有只有希儿能用！上面是举个例子！

默认关闭星铁插件，请下载插件后开启使用~

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
curl -o "./plugins/example/SetMaster.js" "https://raw.githubusercontent.com/Zyy955/Yunzai-Bot-plugin/main/StarRail.js"
```
Gitee：
```
curl -o "./plugins/example/SetMaster.js" "https://gitee.com/Zyy955/Yunzai-Bot-plugin/raw/main/StarRail.js"
```


## 设置主人

为`Yunzai-Bot`设计，适用于`QQGuild-Plugin`

插件和`TRSS-Yunzai`自带的`#设置主人`并无区别，多了一个at添加主人

- 使用方法
  - 方法1：发送`#设置主人`，随后复制发送控制台的验证码即可成为主人
  - 方法2：发送`#设置主人@用户`，需要你是主人的情况下，指定此用户成为主人

##### 下载
Github：
```
curl -o "./plugins/example/SetMaster.js" "https://raw.githubusercontent.com/Zyy955/Yunzai-Bot-plugin/main/SetMaster.js"
```
Gitee：
```
curl -o "./plugins/example/SetMaster.js" "https://gitee.com/Zyy955/Yunzai-Bot-plugin/raw/main/SetMaster.js"
```

## 无需登录QQ启动机器人

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

## 踢

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