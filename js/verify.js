function VForm (params){
    this.initVerify(params);    //初始化验证
}
VForm.prototype.verify = function (params) {
    var _this = this;
    var options = {
        "current": params.current,  //当前元素
        "dataType": $(params.current).attr("dataType"), //验证规则
        "errMsg": $(params.current).attr("errMsg"),  //验证失败的提示信息
        "nullMsg": $(params.current).attr("nullMsg") || '必填项不能为空!' //为空时的提示信息
    };
    var regObj = {  //内置验证规则
        "*": /[\w\W]+/, //验证空
        "zh": /[\u4e00-\u9fa5]+/,  //验证中文
        "n": /\d+/,	//验证数字
        "str": /[a-zA-Z][\da-zA-Z_]*/,   //以字母开头+字母数字下划线
        "email": /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, //验证邮箱
        "phone": /^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|18[0-9]{9}$/, //验证手机号
        "le": /^\S{" + firstNumber + "," + lastNumber + "}$/, //验证长度
        "url": /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, //验证url
        "ip": /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,   //验证IP地址
        "date": /^([1][7-9][0-9][0-9]|[2][0][0-9][0-9])([\-\.\/\:])([0][1-9]|[1][0-2])([\-\.\/\:])([0][1-9]|[1][0-9]|[2][0-9]|[3][0-1])$/g, //验证日期 yyyy-MM-dd
        "time": /^([0-1][0-9]|[2][0-3])([\-\.\/\:])([0-5][0-9])([\-\.\/\:])([0-5][0-9])$/g, //验证时间  hh:ss:mm
        "datetime": /^([1][7-9][0-9][0-9]|[2][0][0-9][0-9])([\-\.\/\:])([0][1-9]|[1][0-2])([\-\.\/\:])([0][1-9]|[1][0-9]|[2][0-9]|[3][0-1])(\s+)([0-1][0-9]|[2][0-3])([\-\.\/\:])([0-5][0-9])([\-\.\/\:])([0-5][0-9])$/g //验证时间 yyyy-MM-dd hh:ss:mm
    };

    var regFn = { //验证的方法
        getNull: function () { //验证空
            return regObj['*'].test($(options.current).val());
        },
        getRegFn: function (dataType) { //用内置类型去验证
            return regObj[dataType].test($(options.current).val());
        },
        getRechecked: function () { //再次验证
            var recheckVal = $('[name=\'' + $(params.current).attr("rechecked") + '\']').val(); //要比较的值
            return recheckVal == $(options.current).val();
        },
        getAjaxCheck: function () { //ajax验证
            var name = $(options.current).attr('name') || 'params';
            $.ajax({
                type: "GET",
                url: $(params.current).attr("ajaxUrl"),
                data: name + "=" + $(options.current).val(),
                success: function (data) {
                    return data.status == 0 ? true : false;
                },
                error: function () {
                    return false;
                }
            });
        },
        getRange: function (min, max) { //验证范围
            return (Number($(options.current).val()) >= Number(min) && Number($(options.current).val()) <= max) || false;
        },
        getCompareDate: function () { //比较日期
            var oStartDate = $(options.current).attr('startDate'); //开始日期指定的结束对象
            var oEndDate = $(options.current).attr('endDate'); //结束日期指定的开始对象
            var value = $(options.current).val();
            if (oStartDate != undefined && oStartDate != '') { //有开始日期
                var endDate = $("[name='" + oStartDate + "']"); //查找对应的结束日期
                return (new Date().getTime() - Date.parse(value) >= 0) ? true : (endDate == null ? false : true);
            }
            if (oEndDate != undefined && oEndDate != '') { //有结束日期
                var startDate = $("[name='" + oEndDate + "']");
                return ((startDate != null) && (Date.parse(value) - Date.parse(startDate.val()) >= 0) && (new Date().getTime() - Date.parse(value) >= 0)) ? true : false;
            }
        },
        success: function (type) { //验证成功
            if (type) { //成功
                $(options.current).removeClass('verify-success').removeClass('verify-error-b'); //添加success提示样式
            } else {
                $(options.current).addClass('verify-success').removeClass('verify-error-b'); //添加error提示样式
            }
            $(_this.options.elem).find(".verify-error").remove();
            return true;
        },
        error: function (msg) { //验证失败
            var msg = msg || '验证失败！';
            $(options.current).removeClass('verify-success').addClass('verify-error-b'); //清除成功提示样式
            $(_this.options.elem).find(".verify-error").remove();

            var vClass = _this.options.errorElePos ? 'verify-error verify-right' : 'verify-error'; //默认在上面  true表示右边
            var elem = '<div class="' + vClass + '">' + msg + '<div class="verify-error-icon"></div></div>';
            if ($(options.current).parent().css('position') == '' || $(options.current).parent().css('position') == 'static') {
                $(options.current).parent().css('position', 'relative'); //如果父级没有定位，则添加一个相对定位，防止显示错位
            }
            $(options.current).parent().append(elem); //追加错误提示标签
            if (!_this.options.errorElePos) { //在输入框上方显示错误信息
                var elemH = $(options.current).outerHeight() //+ $('.verify-error-icon').outerHeight();   //获取当前输入框的高度
                var errorEleH = $(options.current).siblings('.verify-error').outerHeight(); //错误信息框的高度
                if (elemH < errorEleH) { //如果输入框的高度没有错误提示框高
                    elemH = errorEleH;
                }
                var elemL = $(options.current).position().left; //获取当前输入框的left
                $(options.current).siblings('.verify-error').css({'top': -elemH + 'px', 'left': -(elemL) + 'px'});
            } else {
                var elemW = $(options.current).outerWidth(); //获取当前输入框的宽度
                $(options.current).siblings('.verify-error').css({'left': elemW + 'px'});
            }
            return false;
        }
    };
    //验证
    var ignore = $(options.current).attr('ignore'); //false 必填  true：选填
    if (!(options.dataType.charAt(0) === '/')) {    //使用的是内置规则
        if (options.dataType.indexOf('-') >= 0) {  //如果有 - 则表示是要验证范围
            return getIntervalNumber() ? extendVerify() : false;
        } else {
            return execTest(options.dataType, regFn.getRegFn, options.dataType);
        }
        function getIntervalNumber() {	//获取范围的数字
            var firstNumber = options.dataType.match(/\d+/)[0]; //获取长度最小值
            var lastNumber = options.dataType.substring(options.dataType.indexOf("-") + 1); //获取长度最大值
            var prefix = options.dataType.substring(0, options.dataType.indexOf("-") - firstNumber.length);	//获取验证的类型

            //重新构建正则
            if(prefix == 'r'){  //验证数字的范围
                return execTest([prefix, '-'], regFn.getRange, Number(firstNumber), Number(lastNumber));
            }else{
                var regPrefix = regObj[prefix].toString().slice(1,regObj[prefix].toString().length-2);  //取regObj的正则
                regObj["le"] = eval('/^' + regPrefix + '{' + firstNumber + ',' + lastNumber + '}$/');
                return execTest([prefix, '-'], regFn.getRegFn, 'le');  //返回的是true或则false
            }
        }

        //执行验证 并返回验证结果
        function execTest(str, callback) {
            var args = Array.prototype.slice.call(arguments, 2); //截取参数
            if (Object.prototype.toString.call(str) === '[object Array]') { //传递是一个数组
                return showInfo();
            } else { //传递是一个字符串 可以直接的调用相对的方法
                return (options.dataType.indexOf(str) >= 0) ? showInfo() : false;    //如果匹配了传递的字符串 就用用callback 否则就return false
            }
            //显示相关信息
            function showInfo() {
                if (!regFn.getNull()) {
                    return !ignore ? regFn.error(options.nullMsg) : regFn.success();
                } else {
                    return callback.apply(this, args) ? regFn.success() : regFn.error(options.errMsg);
                }
            }
        }
    } else {    //自定义正则验证
        options.dataType = eval(options.dataType);
        if (!regFn.getNull()) { //为空
            return !ignore ? regFn.error(options.nullMsg) : regFn.success();
        } else {
            return options.dataType.test($(options.current).val()) ? extendVerify() : regFn.error(options.errMsg);
        }
    }

    //验证扩展方法
    function extendVerify() {
        if ($(params.current).attr("rechecked")) { //二次验证
            return regFn.getRechecked(options.current) ? regFn.success() : regFn.error($(options.current).attr('reErrMsg' || '两次输入不一致！'));
        }
        if ($(params.current).attr("ajaxUrl")) { //ajax校验
            return regFn.getAjaxCheck() ? regFn.success() : regFn.error($(options.current).attr('ajaxErrMsg'));
        }
        if ($(params.current).attr("startDate") != undefined || $(params.current).attr("endDate") != undefined) { // 比较日期
            return regFn.getCompareDate() ? regFn.success() : regFn.error(options.errMsg || '日期验证失败！');
        }
        return regFn.success()
    }
};

VForm.prototype.isVerify = function () { //验证全部
    this.options.type = true;
    return this.initVerify(this.options);
};

VForm.prototype.clearVerifyStatus = function () { //清除状态
    var parentElem = $(this.options.elem);
    parentElem.find(".verify-error").remove();
    parentElem.find(".verify-success").removeClass('verify-success');
    parentElem.find("verify-error-b").removeClass('verify-error-b');
};

VForm.prototype.initVerify = function (params) { //初始化验证方法
    this.options = {
        elem: params.elem || document,  //要验证的表单  默认document
        type: params.type || false, //默认false  false：初始化 true: 验证全部
        textarea: params.textarea || false,	//默认false  false:表示不验证textarea
        errorElePos: params.errorElePos || false, //错误提示显示的位置 true为右侧，false为上侧
        isAll: params.isAll || false    //默认全部验证 true: 逐个验证  false：全部验证
    };
    var input, select;
    input = $(this.options.elem).find(this.options.textarea ? "input[datatype],textarea[datatype]" : "input[datatype]");	//是否验证textarea
    select = $(this.options.elem).find("select[datatype]");
    if (!this.options.type) { //初始化表单元素
        input.unbind("blur", fn); //移除input的blur事件
        select.unbind("change", fn); //移除select的change事件
        var This = this;
        var fn = function () {
            return This.verify({current: this, errorElePos: This.options.errorElePos});
        };
        input.blur(fn); //绑定blur事件
        select.change(fn); //绑定change事件
    } else {
        if (this.options.isAll) {  //逐条验证
            input.each(function (index, item) {
                return $(item).trigger('blur');
            });
            select.each(function (index, item) {
                return $(item).trigger('change');
            });
        } else {
            input.trigger('blur');
            select.trigger('change');
        }
        if ($(this.options.elem).find(".verify-error-b").length > 0) {
            var elem = $(this.options.elem).find('.verify-error-b:first').get(0);
            if (elem.nodeName.toLowerCase() == 'select') {
                $(elem).trigger('change');
            } else {
                elem.focus();
                $(elem).trigger('blur');
            }
            return false;
        }
        return true;
    }
};