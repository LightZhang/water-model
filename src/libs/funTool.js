export default class funTool {
  static IsNullorEmpty(obj) {
    if (typeof (obj) === 'undefined' || obj == null || obj == '') {
      return true;
    }
    return false;
  }

  // 设置Cookie
  static setCookie(name, value) {
    var exdate = new Date();
    var expiredays = 7;
    exdate.setDate(exdate.getDate() + expiredays);
    document.cookie = name + '=' + escape(value) +
      ((expiredays == null) ? '' : ';expires=' + exdate.toGMTString());
  }

  // 读取cookie
  static getCookie(name) {
    if (document.cookie.length > 0) {
      var c_start = document.cookie.indexOf(name + '=');
      if (c_start != -1) {
        c_start = c_start + name.length + 1;
        var c_end = document.cookie.indexOf(';', c_start);
        if (c_end == -1) c_end = document.cookie.length;
        return unescape(document.cookie.substring(c_start, c_end));
      }
    }
    return '';
  }

  static getCheckString(value) {
    let curTemp = !funTool.IsNullorEmpty(value) ? value : '';
    return curTemp;
  }

  static toJson(data) {
    return JSON.parse(JSON.stringify(data));
  }

  // 图片验证码
  static createCode() {
    var code = '';
    var codeLength = 4; // 验证码的长度
    var random = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R',
      'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'); // 随机数
    for (var i = 0; i < codeLength; i++) {
      // 循环操作
      var index = Math.floor(Math.random() * 36); // 取得随机数的索引（0~35）
      code += random[index]; // 根据索引取得随机数加到code上
    }
    return code;
  }

  static removeEmptyObject(data) {
    data = data || {};
    for (let index in data) {
      if (data[index] == '' || data[index] == '全部') {
        delete data[index];
      }
    }
    return data;
  }


  static getComponentHeight(diffHegiht) {
    let curBodyHeight = document.documentElement.clientHeight;
    let height = curBodyHeight - diffHegiht;
    return height;
  }

  static showMainLoad() {
    var div = '<div class="loadPop"><img  src="../assets/img/load.gif" /></div>';
    if ($('body .loadPop').length == 0) {
      $('body').append(div);
    }
  }

  static hideMainLoad() {
    setTimeout(() => {
      $('.loadPop').remove();
    }, 600);
  }

  static showLoad() {
    var div = '<div class="loadLeftPop "><label>加载中</label><label class="spin-loopload">...</label></div>';
    if ($('body .loadLeftPop').length == 0) {
      $('body').append(div);
    }
  }

  static hideLoad() {
    setTimeout(() => {
      $('body .loadLeftPop').remove();
    }, 600);
  }

  /**
   * 取得url参数
   */
  static getUrlParam(key) {
    var index = window.location.href.indexOf('?') + 1;
    var reg = new RegExp('(^|&)' + key + '=([^&]*)(&|$)'); // 构造一个含有目标参数的正则表达式对象
    var r = window.location.href.substr(index).match(reg); // 匹配目标参数
    if (r != null) return unescape(r[2]);
    return null; // 返回参数值
  }

  // 获取两者之间的整数
  static getRandomNum(minNum, maxNum) {
    switch (arguments.length) {
      case 1:
        return parseInt(Math.random() * minNum + 1, 10);
        break;
      case 2:
        return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
        break;
      default:
        return 0;
        break;
    }
  }

  // 颠倒数组顺序
  static reverse(arr) {
    // 初始化数组并定义长度
    let arrResult = new Array();
    let j = 0; // 新数组的下标
    // 通过循环替换数据
    for (let i = arr.length - 1; i >= 0; i--, j++) {
      arrResult[j] = arr[i];
    }
    return arrResult;
  }

  static isObjectEqual(a, b) {
    let isEqual = true;

    for (var key in a) {
      if (a[key] != b[key]) {
        isEqual = false;
        break;
      }
    }
    return isEqual;
  }

  static downloadImg(url, name) {
    const aLink = document.createElement('a');
    aLink.download = name;
    aLink.href = url;
    aLink.dispatchEvent(new MouseEvent('click', {}));
  }

  static dictionaries(key) {
    let str = '';
    if (key == 1) {
      str = '-BIGUSER';
    }
    return str;
  }

  static isDate(date) {
    var reDateTime = /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/;
    var isDateTime = reDateTime.test(date);
    return isDateTime;
  }
}