# 个人博客前-后端通讯接口

* Version：V1.0.0
* 创建时间：2010-06-21
* 测试用户：test  111111

# 目录索引

# 签名说明

### api请求说明
1. 使用restful风格API
2. 使用JsonWebToken(缩写 JWT)认证方案
3. 用户登录后获得两个token,`token`与`refreshToken`，客户端需保存至本地，用于接口请求认证
    - `token`：用户登录状态认证 - 有效期暂定2小时，失效后通过'refreshToken'获取新的有效token，达到自动续期作用
    - `refreshToken`：续期用户token的作用 - 有效期15天，有效期内可换取新的'token'，失效后用户退出登录
4. 请求的header里需要带上参数：`Authorization`（登录后服务端返回的token，token中包含用户的`uid`。用户退出后需清除本地保存的`token`）

    ```
    // 'Bearer 用户token' - 注意Bearer后面的空格
    header: {
        Authorization: Bearer eyJhbGciOJ9.eyJ1aWQixNX0.qEk85A2yB945
    }
    ```
5. token详细使用与介绍 - 参考[token使用说明](./token使用说明.md)

# 其他说明

在本版本中，对数据请求`状态码`、`参数`等

### 公共参数说明
- `apiServer` - 表示WebApi部署的服务器地址，具体值是：域名或IP+端口;

### 状态码说明
接口返回`code`码与HTTP状态码一致。HTTP状态即接口服务器响应状态，各状态与 RFC2616 标准规定状态一致，常用状态如下：

- `200` - 正常    
- `201` - 重复提交   
- `301` - 永久重定向   
- `302` - 临时重定向   
- `400` - 请求错误、参数不匹配    
- `401` - 未认证、认证失败    
- `402` - 未授权、授权过期    
- `403` - 禁止访问    
- `404` - 请求资源不存在    
- `500` - 系统错误   
- `504` - 请求超时  
- `511` - 表示header缺失参数token
- `512` - 表示缺少auth_key
- `513` - 表示api接口参数验证token过期
- `514` - 表示api接口参数token验证失败
- `520` - jsonwebtoken生成失败
- `521` - jsonwebtoken验证失败


### 服务端返回数据结构

一般会包含主要的几个字段

- `code` {Number} - 请求状态码，200请求正常，数据返回正常
- `msg` {String}，可选 - 请求返回的消息，与`code`搭配使用，如`code`不是`200`，`msg`字段会描述问题原因
- `errors` {Any}，可选 - 错误信息，出错时存在
- `data` {Json} - 请求返回的数据

如：
```
{
  "code": 200,
  "msg": "success",
  "data": {
    "token": "eb9120d72e48ed67c225f535bc27f9c51529379915929"
  }
}
```


# 1. 基本接口

## 1.1 公用部分
### 1.1.1 图片验证码
```
获取图片验证码，返回svg文件
```
**接口方式** HTTP    
**HTTP方法** GET    
**URI路径** '${apiServer}/blogapi/service/captcha'      
**参数**    

| 参数名|数据类型|必须|默认|说明 |
|---|:---:|:---:|:---:|---|
| width | Number | 否 | 120 | 图片宽度 |
| height | Number | 否 | 44 | 图片高度 |

**返回值**

| 参数名|数据类型|说明 |
|---|:---:|---|
| data | Image | 返回svg图片（html标签显示）  |

### 1.1.2 续期token
```
token过期，进行续期
```
**接口方式** HTTP    
**HTTP方法** POST    
**URI路径** '${apiServer}/blogapi/service/renewal'      
**参数**    

| 参数名|数据类型|必须|默认|说明 |
|---|:---:|:---:|:---:|---|
| refreshToken | String | 是 |  | 登录后保存的refreshToken |

**返回值**

| 参数名|数据类型|说明 |
|---|:---:|---|
| code | Number | 状态码 |
| msg | String | 提示信息 |
| data | JSON | token信息 |

**返回参数data说明**

| 参数名|数据类型|说明 |
|---|:---:|---|
| token | String | 新的用户登录凭证 |
| refreshToken | String | 新的刷新token凭证 |

```
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cC",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR"
}
```


## 1.2 用户相关
### 1.2.1 用户注册
```
普通用户注册，验证码、用户名验证相关查看（1.1 公用部分）
```
**接口方式** HTTP    
**HTTP方法** POST    
**URI路径** '${apiServer}/blogapi/reg'      
**参数**    

| 参数名|数据类型|必须|默认|说明 |
|---|:---:|:---:|:---:|---|
| account | String | 是 | | 用户名 |
| password | String | 是 | | 密码(需要md5加密) |
| email | String | 是 | | 注册邮箱(未认证状态) |
| nick | String | 否 | '新用户-****' | 用户昵称 |
| captcha | String | 是 | | 图形验证码 |

**返回值**

| 参数名|数据类型|说明 |
|---|:---:|---|
| code | Number | 状态码 |
| msg | String | 提示信息 |
| data | JSON | 用户信息 |

**返回参数data说明**

| 参数名|数据类型|说明 |
|---|:---:|---|
| account | String | 注册的用户名 |
| email | String | 注册的邮箱 |
| emailVerified | Boolean | 邮箱认证状态 |
| status | String | 用户状态：pending: 未认证; normal: 正常; reject: 未通过认证; freeze: 冻结 |
| nick | String | 用户昵称 |
| created | Date | 注册时间戳（毫秒） |
| level | Number | 用户等级 |

```
{
    account: 'test',
    email: '468768678@qq.com',
    emailVerified: false,
    status: 'pending',
    nick: '小灰',
    created: 1561083720816,
    type: 'client',
    level: 0
}
```

### 1.2.2 登录
```
用户登录，使用JWT验证方案
```
**接口方式** HTTP    
**HTTP方法** POST    
**URI路径** '${apiServer}/blogapi/login'      
**参数**    

| 参数名|数据类型|必须|默认|说明 |
|---|:---:|:---:|:---:|---|
| account | String | 是 | | 用户名 |
| password | String | 是 | | 密码(需要md5加密) |

**返回值**

| 参数名|数据类型|说明 |
|---|:---:|---|
| code | Number | 状态码 |
| msg | String | 提示信息 |
| data | JSON | 登录信息 |

**返回参数data说明**

| 参数名|数据类型|说明 |
|---|:---:|---|
| token | String | 用户登录凭证 |
| refreshToken | String | 刷新token凭证 |

```
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cC",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR"
}
```


# 2. 用户管理


# 3. 博客相关

### 3.1.1 获取博客列表
```
默认获取全部博客列表
```
**接口方式** HTTP    
**HTTP方法** GET    
**URI路径** '${apiServer}/blogapi/articles'      
**参数**    

| 参数名|数据类型|必须|默认|说明 |
|---|:---:|:---:|:---:|---|
| page | Number | 否 | 1 | 页码 |
| pageSize | Number | 否 | 10 | 页数 |

**返回值**

| 参数名|数据类型|说明 |
|---|:---:|---|
| code | Number | 状态码 |
| msg | String | 提示信息 |
| data | JSON | 列表信息 |

**返回参数data说明**

| 参数名|数据类型|说明 |
|---|:---:|---|
| items | Array | 列表 |
| total | Number | 列表总和 |
| pageSize | Number | 每页数 |
| hasPrevPage | Boolean | 是否有上一页 |
| hasNextPage | Boolean | 是否有下一页 |
| currentPage | Number | 当前页码 |
| pageCount | Number | 总页数 |
| pagingCounter | Number | 页码计数 |
| prev | Array | 上一页 |
| next | Array | 下一页 |

```
"items": [
    {
        "user_info": {
            "id": "5d0c893ce0358e52c4041548",
            "nick": "小灰",
            "cover": "",
            "type": "client",
            "is_root": false
        },
        "summary": "求富文本用js过滤部分标签",
        "tags": [],
        "read": 0,
        "praise": 0,
        "review": 0,
        "_id": "5d15c2fb209b9d4100de123a",
        "title": "测试文章2",
        "type": "3",
        "category": "2",
        "__v": 0,
        "last_revise": 1561965435629,
        "deleted": false,
        "created": 1561967621111
    }
],
"total": 3,
"pageSize": 10,
"hasPrevPage": false,
"hasNextPage": false,
"currentPage": 1,
"pageCount": 1,
"pagingCounter": 1,
"prev": null,
"next": null
```

### 3.1.2 获取博客详情
```
获取博客详情，通过文章id查询
```
**接口方式** HTTP    
**HTTP方法** GET    
**URI路径** '${apiServer}/blogapi/article/detail/:id'      
**参数**    

| 参数名|数据类型|必须|默认|说明 |
|---|:---:|:---:|:---:|---|

**返回值**

| 参数名|数据类型|说明 |
|---|:---:|---|
| code | Number | 状态码 |
| msg | String | 提示信息 |
| data | JSON | 返回数据 |

**返回参数data说明**

| 参数名|数据类型|说明 |
|---|:---:|---|
| title | String | 文章标题 |
| content | String | 文章内容 |
| summary | String | 文章简介 |
| type | String | 文章类型 |
| typeUrl | String | 转载Url |
| category | String | 博文分类 |
| tags | Array | 文章标签 |
| seo | Obj | seo相关 |
| seo.title | String  | seo的title |
| seo.keywords | String  | seo的key |
| seo.description | String | seo的desc |
| userInfo | Obj | 用户信息 |
| userInfo.id | Obj | 用户ID |
| userInfo.nick | Obj | 用户昵称 |
| userInfo.cover | Obj | 用户头像 |
| userInfo.type | Obj | 用户类型 |
| userInfo.is_root | Boolean | 是否管理员 |
| read | Number | 阅读量 |
| praise | Number | 点赞数 |
| review | Number | 评论量 |
| created | Number | 发布时间 |

```
{
    "title": "测试文章",
    "content": "<div class=c-abstract>2016年10月31日求<em>富文本</em>用<em>js过滤</em>部分<em>标签<em>但保留文本内容代码! 更多帖子 关注 空间 博客  laienshun  本版专家分:0  结帖率 0% 比如我从其他地方复制了一段文本,里...</div>",
    "summary": "2016年10月31日求富文本用js过滤部分标签但保留文本内容代码!更多帖子关注空间博客laienshun本版专家分:0结帖率0%比如我从其他地方复制了一段文本,里...",
    "type": "1",
    "category": "1",
    "tags": [],
    "seo": {},
    "userInfo": {
        "id": "5d0c893ce0358e52c4041548",
        "nick": "小灰",
        "cover": "",
        "type": "admin",
        "is_root": false
    },
    "read": 0,
    "praise": 0,
    "review": 0,
    "created": 1561963036271
}
```

### 3.1.3 发布博文
```
发布博文
```
**接口方式** HTTP    
**HTTP方法** POST    
**URI路径** '${apiServer}/blogapi/article/section'      
**参数**    

| 参数名|数据类型|必须|默认|说明 |
|---|:---:|:---:|:---:|---|
| title | String | 是 |  | 文章标题 |
| content | String | 是 |  | 文章内容 |
| summary | String | 否 | `content`中提取 | 文章简介 |
| type | String | 是 |  | 文章类型: 'original-原创', 'copy-转载' |
| typeUrl | String | 否 |  | 转载Url |
| category | String | 是 |  | 博文分类 |
| tags | Array | 否 |  | 文章标签 |
| cover | String | 否 |  | 博文封面 |
| isPrivate | Boolean | 否 |  | 是否私密文章 |
| status | String | 否 | 'draft' | 博文状态：草稿-'draft'、上线-'online', 软删除-'delete' |
| seo | Obj | 否 |  | seo自定义 |
| seo.title | String | 否 |  | seo的title |
| seo.keywords | String | 否 |  | seo的key |
| seo.description | String | 否 |  | seo的desc |

**返回值**

| 参数名|数据类型|说明 |
|---|:---:|---|
| code | Number | 状态码 |
| msg | String | 提示信息 |
| data | JSON | 返回数据 |

**返回参数data说明**

| 参数名|数据类型|说明 |
|---|:---:|---|
| title | String | 文章标题 |
| content | String | 文章内容 |
| summary | String | 文章简介 |
| type | String | 文章类型 |
| typeUrl | String| 转载Url |
| category | String | 博文分类 |
| tags | Array | 文章标签 |
| seo | Obj | seo相关 |
| seo.title | String  | seo的title |
| seo.keywords | String  | seo的key |
| seo.description | String | seo的desc |
| userInfo | Obj | 用户信息 |
| userInfo.id | Obj | 用户ID |
| userInfo.nick | Obj | 用户昵称 |
| userInfo.cover | Obj | 用户头像 |
| userInfo.type | Obj | 用户类型 |
| userInfo.is_root | Boolean | 是否管理员 |
| read | Number | 阅读量 |
| praise | Number | 点赞数 |
| review | Number | 评论量 |
| created | Number | 发布时间 |

```
{
    "title": "测试文章",
    "content": "<div class=c-abstract>2016年10月31日求<em>富文本</em>用<em>js过滤</em>部分<em>标签<em>但保留文本内容代码! 更多帖子 关注 空间 博客  laienshun  本版专家分:0  结帖率 0% 比如我从其他地方复制了一段文本,里...</div>",
    "summary": "2016年10月31日求富文本用js过滤部分标签但保留文本内容代码!更多帖子关注空间博客laienshun本版专家分:0结帖率0%比如我从其他地方复制了一段文本,里...",
    "type": "1",
    "category": "1",
    "tags": [],
    "seo": {},
    "userInfo": {
        "id": "5d0c893ce0358e52c4041548",
        "nick": "小灰",
        "cover": "",
        "type": "admin",
        "is_root": false
    },
    "read": 0,
    "praise": 0,
    "review": 0,
    "created": 1561963036271
}
```

### 3.1.4 修改博文
```
修改博文, 通过文章id
```
**接口方式** HTTP    
**HTTP方法** PUT   
**URI路径** '${apiServer}/blogapi/article/section/:id'      
**参数**    

| 参数名|数据类型|必须|默认|说明 |
|---|:---:|:---:|:---:|---|
| title | String | 是 |  | 文章标题 |
| content | String | 是 |  | 文章内容 |
| summary | String | 否 | `content`中提取 | 文章简介 |
| type | String | 是 |  | 文章类型: 'original-原创', 'copy-转载'|
| typeUrl | String | 否 |  | 转载Url |
| category | String | 是 |  | 博文分类 |
| tags | Array | 否 |  | 文章标签 |
| cover | String | 否 |  | 博文封面 |
| isPrivate | Boolean | 否 |  | 是否私密文章 |
| status | String | 否 | 'draft' | 博文状态：草稿-'draft'、上线-'online', 软删除-'delete' |
| seo | Obj | 否 |  | seo自定义 |
| seo.title | String | 否 |  | seo的title |
| seo.keywords | String | 否 |  | seo的key |
| seo.description | String | 否 |  | seo的desc |

**返回值**

| 参数名|数据类型|说明 |
|---|:---:|---|
| code | Number | 状态码 |
| msg | String | 提示信息 |
| data | JSON | 返回数据 |

**返回参数data说明**

| 参数名|数据类型|说明 |
|---|:---:|---|
| title | String | 文章标题 |
| content | String | 文章内容 |
| summary | String | 文章简介 |
| type | String | 文章类型 |
| typeUrl | String  | 转载Url |
| category | String | 博文分类 |
| tags | Array | 文章标签 |
| seo | Obj | seo相关 |
| seo.title | String  | seo的title |
| seo.keywords | String  | seo的key |
| seo.description | String | seo的desc |
| userInfo | Obj | 用户信息 |
| userInfo.id | Obj | 用户ID |
| userInfo.nick | Obj | 用户昵称 |
| userInfo.cover | Obj | 用户头像 |
| userInfo.type | Obj | 用户类型 |
| userInfo.is_root | Boolean | 是否管理员 |
| read | Number | 阅读量 |
| praise | Number | 点赞数 |
| review | Number | 评论量 |
| created | Number | 发布时间 |

```
{
    "title": "测试文章",
    "content": "<div class=c-abstract>2016年10月31日求<em>富文本</em>用<em>js过滤</em>部分<em>标签<em>但保留文本内容代码! 更多帖子 关注 空间 博客  laienshun  本版专家分:0  结帖率 0% 比如我从其他地方复制了一段文本,里...</div>",
    "summary": "2016年10月31日求富文本用js过滤部分标签但保留文本内容代码!更多帖子关注空间博客laienshun本版专家分:0结帖率0%比如我从其他地方复制了一段文本,里...",
    "type": "1",
    "category": "1",
    "tags": [],
    "seo": {},
    "userInfo": {
        "id": "5d0c893ce0358e52c4041548",
        "nick": "小灰",
        "cover": "",
        "type": "admin",
        "is_root": false
    },
    "read": 0,
    "praise": 0,
    "review": 0,
    "created": 1561963036271
}
```

### 3.1.4 删除博文
```
删除博文，文章id
```
**接口方式** HTTP    
**HTTP方法** DELETE   
**URI路径** '${apiServer}/blogapi/article/section/:id'      
**参数**    

| 参数名|数据类型|必须|默认|说明 |
|---|:---:|:---:|:---:|---|

**返回值**

| 参数名|数据类型|说明 |
|---|:---:|---|
| code | Number | 状态码 |
| msg | String | 提示信息 |





