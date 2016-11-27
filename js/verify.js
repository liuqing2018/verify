$.extend({
    verify: function (params) {
        var _this = this;
        var options = {
            "current": params.current,
            "dataType": $(params.current).attr("dataType"),
            "errMsg": $(params.current).attr("errMsg") || '验证失败!',
            "nullMsg": $(params.current).attr("nullMsg") || '不能为空!',
            "errorElePos": params.errorElePos,
            "rechecked": $(params.current).attr("rechecked"),
            "ajaxUrl": $(params.current).attr("ajaxUrl"),
            "startDate": $(params.current).attr("startDate"),
            "endDate": $(params.current).attr("endDate")
        };

        var value = $(options.current).val().trim(); //获取当前输入的值
        var regObj = {  //验证对象
            "*": /[\w\W]+/, //验证空
            "zh": /.*[\u4e00-\u9fa5]+.*$/, //验证中文
            "n": /\d+/,	//验证数字
            "email": /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, //验证邮箱
            "phone": /^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|18[0-9]{9}$/, //验证手机号
            "le": /^\S{" + firstNumber + "," + lastNumber + "}$/, //验证长度
            "url": /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
            "ip": /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
            "date": /^([1][7-9][0-9][0-9]|[2][0][0-9][0-9])([\-\.\/\:])([0][1-9]|[1][0-2])([\-\.\/\:])([0][1-9]|[1][0-9]|[2][0-9]|[3][0-1])$/g, //验证日期 yyyy-MM-dd
            "time": /^([0-1][0-9]|[2][0-3])([\-\.\/\:])([0-5][0-9])([\-\.\/\:])([0-5][0-9])$/g, //验证时间  hh:ss:mm
            "datetime": /^([1][7-9][0-9][0-9]|[2][0][0-9][0-9])([\-\.\/\:])([0][1-9]|[1][0-2])([\-\.\/\:])([0][1-9]|[1][0-9]|[2][0-9]|[3][0-1])(\s+)([0-1][0-9]|[2][0-3])([\-\.\/\:])([0-5][0-9])([\-\.\/\:])([0-5][0-9])$/g //验证时间 yyyy-MM-dd hh:ss:mm
        };

        var obj = { //验证对象
            getNull: function () { //验证空
                return regObj['*'].test(value);
            },
            getRegFn: function (dataType) { //用内置类型去验证
                //debugger
                return regObj[dataType].test(value);
            },
            getRechecked: function () { //再次验证
                var recheckVal = $('input[name=\'' + options.rechecked + '\']').val().trim(); //要比较的值
                return recheckVal == value;
            },
            getAjaxCheck: function () { //ajax验证
                var name = $(options.current).attr('name') || 'params';
                $.ajax({
                    type: "GET",
                    url: options.ajaxUrl,
                    data: name + "=" + value,
                    success: function (data) {
                        return data.status == 0 ? true : false;
                    },
                    error: function (data) {
                        return false;
                    }
                });
            },
            getRange : function (min,max) { //验证范围
                return (Number(value) >= Number(min) && Number(value) <= max) || false;
            },
            getCompareDate: function () { //比较日期
                var oStartDate = $(options.current).attr('startDate'); //开始日期指定的结束对象
                var oEndDate = $(options.current).attr('endDate'); //结束日期指定的开始对象
                var flag = true;
                var msg = '';
                if (oStartDate != undefined && oStartDate != '') { //有开始日期
                    flag = (new Date().getTime() - Date.parse($(options.current).val()) >= 0) ? true : false;
                    var endDate = $("input[name='" + oStartDate + "']"); //查找对应的结束日期
                    if (endDate == null) { //开始日期startDate="name", 通过input[name='name']找不到元素
                        flag = false;
                    }
                }
                if (oEndDate != undefined && oEndDate != '') { //有结束日期
                    var startDate = $("input[name='" + oEndDate + "']");
                    if (startDate != null) {
                        flag = ((Date.parse(value) - Date.parse(startDate.val()) >= 0) && (new Date().getTime() - Date.parse(value) >= 0)) ? true : false;
                    } else {
                        flag = false;
                    }
                }
                return flag;
            },
            success: function (type) { //验证成功
                if (type) { //成功
                    $(options.current).removeClass('verify-success').removeClass('verify-error-b'); //添加success提示样式
                } else {
                    $(options.current).addClass('verify-success').removeClass('verify-error-b'); //添加error提示样式
                }
                $(_this.params.elem).find(".verify-error").remove();
                return true;
            },
            error: function (msg) { //验证失败
                var msg = msg || '验证失败！';
                $(options.current).removeClass('verify-success').addClass('verify-error-b'); //清除成功提示样式
                $(_this.params.elem).find(".verify-error").remove();

                var vClass = options.errorElePos ? 'verify-error verify-right' : 'verify-error'; //默认在上面  true表示右边
                var elem = '<div class="' + vClass + '">' + msg + '<div class="verify-error-icon"></div></div>';
                if ($(options.current).parent().css('position') == '' || $(options.current).parent().css('position') == 'static') {
                    $(options.current).parent().css('position', 'relative'); //如果父级没有定位，则添加一个相对定位，防止显示错位
                }
                $(options.current).parent().append(elem); //追加错误提示标签
                if (!options.errorElePos) { //在输入框上方显示错误信息
                    var elemH = $(options.current).outerHeight() //+ $('.verify-error-icon').outerHeight();   //获取当前输入框的高度
                    var errorEleH = $(options.current).siblings('.verify-error').outerHeight(); //错误信息框的高度
                    if (elemH < errorEleH) { //如果输入框的高度没有错误提示框高
                        elemH = errorEleH;
                    }
                    var elemL = $(options.current).position().left; //获取当前输入框的宽度
                    $(options.current).siblings('.verify-error').css({'top': -elemH + 'px', 'left': -(elemL) + 'px'});
                } else {
                    var elemW = $(options.current).outerWidth(); //获取当前输入框的高度
                    $(options.current).siblings('.verify-error').css({'left': elemW + 'px'});
                }
                return false;
            }
        };
        //验证
        //debugger
        var ignore = $(options.current).attr('ignore'); //如果有表示不是必填项
        if (!(options.dataType.charAt(0) === '/')) {    //使用的是内置规则
            if (options.dataType.indexOf('-') >= 0) {  //如果有 - 则表示是要验证范围
                return getIntervalNumber() ? extendVerify() : false;
            } else {
                return execTest(options.dataType, obj.getRegFn,options.dataType);
            }
            function getIntervalNumber() {	//获取范围的数字
                //debugger
                var firstNumber = options.dataType.match(/\d+/)[0]; //获取长度最小值
                var lastNumber = options.dataType.substring(options.dataType.indexOf("-") + 1); //获取长度最大值
                var prefix = options.dataType.substring(0, options.dataType.indexOf("-") - firstNumber.length);	//获取验证的类型

                //重新构建正则
                switch (prefix) {
                    case '*':   //验证任意字符长度 (非空)
                        regObj["le"] = new RegExp("^\\S{" + firstNumber + "," + lastNumber + "}$");
                        break;
                    case 'zh':  //验证中文长度
                        regObj["le"] = new RegExp("^[\\u4e00-\\u9fa5]{" + firstNumber + "," + lastNumber + "}$");
                        break;
                    case 'n':   //验证数字长度
                        regObj["le"] = new RegExp("^\\d{" + firstNumber + "," + lastNumber + "}$");
                        break;
                    case 'r':    //比较数字范围
                        return execTest([prefix, '-'],obj.getRange,Number(firstNumber), Number(lastNumber));
                        break;
                    default:    //验证任意字符长度
                        regObj["le"] = new RegExp("^\\S{" + firstNumber + "," + lastNumber + "}$");
                        break;
                }
                return execTest([prefix, '-'], obj.getRegFn,'le');  //返回的是true或则false
            }

            //执行验证
            function execTest(str, callback) {
                //debugger
                var args = Array.prototype.slice.call(arguments,2); //截取参数
                if (Object.prototype.toString.call(str) === '[object Array]') { //传递是一个数组
                    return showInfo();
                } else { //传递是一个字符串 可以直接的调用相对的方法
                    return (options.dataType.indexOf(str) >= 0) ? showInfo() : false;    //如果匹配了传递的字符串 就用用callback 否则就return true 继续查找
                }

                //显示相关信息
                function showInfo() {
                    //debugger
                    if (!ignore) { //必填项
                        if(!obj.getNull()){
                            return obj.error(options.nullMsg);
                        }else {
                            return callback.apply(this, args) ? obj.success() : obj.error(options.errMsg);
                        }
                    } else {
                        if (!obj.getNull()) { //空
                            return obj.success();
                        } else {
                            return callback.appaly(this,args) ? obj.success() : obj.error(options.errMsg);
                        }
                    }
                }
            }
        } else {    //自定义正则验证
            //debugger
            options.dataType = eval(options.dataType);

            if (!ignore) {
                if (!obj.getNull()) { //为空
                    return obj.error(options.nullMsg);
                } else {
                    if(options.dataType.test(value)){
                        obj.success();
                        extendVerify()
                    }else{
                        obj.error(options.errMsg);
                    }
                }
            } else {
                if (!obj.getNull()) { //空
                    return obj.success();
                } else {
                    if(options.dataType.test(value)){
                        obj.success();
                        extendVerify()
                    }else{
                        obj.error(options.errMsg);
                    }
                }
            }
        }

        //验证扩展方法
        function extendVerify() {
            //debugger
            if (options.rechecked) { //二次验证
                obj.getRechecked(options.current) ? obj.success() : obj.error($(options.current).attr('reErrMsg' || '两次输入不一致！'));
            }
            if (options.ajaxUrl) { //ajax校验
                obj.getAjaxCheck() ? obj.success() : obj.error($(options.current).attr('ajaxErrMsg'));
            }
            if (options.startDate != undefined || options.endDate != undefined) { // 比较日期
                obj.getCompareDate(options.current) ? obj.success() : obj.error(options.errMsg || '日期验证失败！');
            }
        }
    },
    isVerify: function () { //验证全部
        this.params.type = true;
        return this.initVerify(this.params);
    },
    clearVerifyStatus: function (elem) { //清除状态
        elem = elem || document;
        $(elem).find(".verify-error").remove();
        $(elem).find(".verify-success").removeClass();
        $(elem).find("input").removeClass('verify-error-b');
    },
    initVerify: function (params) { //初始化验证方法
        var params = params || {};
        this.params = params;
        var elem = params.elem || document;
        var options = {
            elem: elem,  //要验证的表单元素
            type: params.type || false, //false：初始化 true: 验证全部
            textarea: params.textarea || false,	//false表示不验证textarea
            errorElePos: params.errorElePos || false //错误提示显示的位置 true为右侧，false为上侧
        };

        var input, select;
        input = $(options.elem).find(options.textarea ? "input[datatype],textarea[datatype]" : "input[datatype]");	//是否验证textarea
        select = $(options.elem).find("select[datatype]");
        if (!options.type) { //初始化表单元素
            input.unbind("blur", fn); //移除input的blur事件
            select.unbind("change", fn); //移除select的change事件
            var fn = function () {
                var result = $.verify({current: this, errorElePos: options.errorElePos}); //验证当前项
                //TODO put your code here
            };
            input.blur(fn); //绑定blur事件
            select.change(fn); //绑定change事件

        } else {
            input.trigger('blur');
            select.trigger('change');
            if ($(options.elem).find(".verify-error-b").length > 0) {
                var ele = $('.verify-error-b:first').trigger('blur');
                $('.verify-error-b:first').focus();
                return false;
            }
            return true;
        }
    }
});