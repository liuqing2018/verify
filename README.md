# verify 验证表单的插件
> 实现功能(暂时只针对input和select)
- 支持失焦验证和提交表单两种验证方式
- 支持二次验证，如密码和确认密码
- 支持ajax验证，如检测用户名是否存在，同一个页面支持多个ajax验证
- 支持开始时间和结束时间比较
- 支持必填项和选填项校验
- 支持在元素上方边或则右边显示错误信息

### 使用示例
``````
$.initVerify(); //简单的逻辑只要调用这一句话即可
``````

### 使用方法
> 1.引入相关的文件jquery.js、verify.css和verify.js,本例为了布局引入了bootcss，实际项目可不引入

```
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/verify.css">
    <script src="js/jquery.js"></script>
    <script src="js/verify.js"></script>
```

> 2.相关表单元元素要增加自定义元素

```
<input type="text" datatype="" nullMsg="" errMsg="" rechecked="" reErrMsg="" ajaxUrl="" startDate="" endDate="">
```


 - datatype:可以是正则，也可以是内置的验证对象  ，也可以是正则表达式
   > 内置datatype：
             "*":  验证空
             "zh": 验证中文
             "n":  验证数字
             "r":   "验证数字的范围"
             "email":  验证邮箱
             "phone":  验证手机号
             "le": 验证长度
             "date": 简单验证日期 yyyy-MM-dd
             "time": 简单验证时间  hh:ss:mm
             "datetime": 简单验证日期时间
- nullMsg：string    //验证项为空时候的提示信息
- errMsg：strinig    //验证项不符合规则的时候提示信息
- ajaxUrl：url       //验证对象的地址
- ajaxErrMsg : string	//验证失败提示信息 需要结合ajaxUrl使用
- rechecked：eleName        //要二次验证的数据 eleName为要验证元素的名称 name
- reErrMsg : string      //二次验证失败的提示信息，要结合rechecked使用，否则无效
- startDate : eleName    //eleName 要对应endDate元素的name
- endDate : eleName      //eleName 要对应startDate元素的name
- ignore ： ignore  // 添加该属性时表示选填 否则为必填

> 3.javascript代码里的逻辑控制

```
$(function () {
    //初始化验证
    var oForm = $('.form-inline');      //要验证的表单
    var oBtn = $('#btnAdd');    //提交按钮
    $.initVerify({      //初始化表单，即添加事件绑定，以便失焦时验证数据
        elem: oForm,          // 可选：要验证元素的表单 不填为document
        errorElePos: true,     //可选：默认为false ,true： 错误信息在右边，false：错误信息在上边
    });
    
    //提交表单时执行验证
    oBtn.on('click',function(){
        if($.isVerify()){     //$.isVerify()返回一个boolean值，用来表示是否验证通过 true：通过，false：不通过
            
            //TODO put your code here
            
            $('#myForm').submit();
        }
    })
    
    /*
    $.isVerify({
        elem: oForm,         //要验证元素的表单 不填为document
        errorElePos: true,     //默认为false true： 错误信息在右边，false：错误信息在上边
    })
    
    */
})
```

### 相关示例
> 1.提交时验证表单

```
    var formElem = $('#myForm');    //表单
    var oBtn = $('#btnAdd');    //提交按钮
    
    //首先要初始化表单
    $.initVerify(formElem);   //给formElem表单下面的元绑事件   
    
    oBtn.on('click',function(){
        if($.isVerify()){
          //通过验证
            $('#myForm').submit();  //也可以走ajax请求
        }else{
            //验证没有通过
        }
    })
```

> 2.二次验证（以密码和确认密码为例）

- 在相关元素（第二个）上添加 rechecked="name"    // name为你要二次校验的元素   
- 添加reErrMsg="错误信息"     // reErrMsg为校验失败的提示信息

```
<!-- 密码 -->
<input type="password" name="password1"  datatype="*5-6" nullMsg="密码不能为空!" errMsg="输入的密码格式不正确">

<!-- 确认密码 -->
<input type="password" datatype="*5-6" reErrMsg="确认密码必须和密码一致" nullMsg="确认密码不能为空!" errMsg="" rechecked="password1">

```

> 3.ajax回调验证（以验证用户名是否存在为例）
- 在元素上添加ajaxUrl属性
- 服务器返回值的格式为
```
	{
	  "status": 1,      //1：表示验证失败  0表示验证成功
	  "msg": "用户已经存在",   //错误信息
	  "data": []    //可以不传，暂时无用
	}
```

```
<input class="form-control" type="text" placeholder="请输入用户名" name="username" datatype="/^\d{5,19}$/" nullMsg="用户名不能为空!" errMsg="输入的用户名格式不正确" ajaxErrMsg="用户已经存在了" ajaxUrl="data/user.json">
```

> 4.日期比较

- startDate="name" name为startDate文本框的name  //在开始日期上加startDate属性
- endDate="name"   name为endDate文本框的name     //在结束日期上加endDate属性
- 验证的时候会比较：
    --开始日期是否早于结束日期
    --开始日期是否早于今日
    --结束日期是否早于今日
    
```
<!-- 开始日期 -->
<input type="text" datatype="date" startDate="myenddate" name="mystartdate" nullMsg="开始日期不能为空!" errMsg="输入的开始日期格式不正确">
<!-- 结束日期 -->
<input type="text" datatype="date" endDate="mystartdate" name="myenddate" nullMsg="结束日期不能为空!" errMsg="输入的结束日期格式不正确">
```

> 5.必选验证和可选验证

 - 有些数据，比如用户的兴趣爱好，可以不用做必填验证，但是填了就要符合一定的规则，这个此处称作为选填项*
 - 如果元素上加ignore属性，则表示为选填项，否则为必填项
```
<input type="text" placeholder="请输入员工编号" datatype="^\d{5,6}$" ignore="ignore" nullMsg="员工编号不能为空!" errMsg="输入的员工编号格式不正确">
```

> 6 内置对象和自定义正则表达式

```

//使用内置日期时间对象

<input class="form-control"  type="text" placeholder="日期时间" datatype="datetime"  nullMsg="日期时间不能为空!" errMsg="输入的日期时间格式不正确">

// 任意区间的数字
<input type="text" placeholder="请输入5-6位的数字" datatype="n5-6" />

// 验证数字范围 5-65536之间
<input type="text" placeholder="请输入5-6位的数字" datatype="r5-65536" />

// 任意区间的中文
<input type="text" placeholder="请输入5-6位的中文" datatype="zh5-6" />

// 任意区间的字符
<input type="text" placeholder="请输入5-6位的任意字符" datatype="*5-6" />


//使用正则表达式
<input type="text" placeholder="请输入3-16位的小写字母、数字、-或则下划线" datatype="/^[a-z0-9_-]{3,16}$/" />

```


