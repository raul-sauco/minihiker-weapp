const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * Return a formatted version of the date.
 */
const formatDate = dateString => {
  const currentYear = new Date().getFullYear();

  let dates = dateString.split("-");
  let formattedDate = '';

  if (currentYear !== parseInt(dates[0])) {

    formattedDate += dates[0] + '年';

  }

  formattedDate += dates[1] + '月';
  formattedDate += dates[2] + '日';

  return formattedDate;

}

/**
 * Generate a random string of a required length
 * TODO unused function, move to /utils
 */
const generateRandomString = length => {

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i<length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

/*
 * https://github.com/HecateDK/Social-services/issues/4
 *
 * 15位身份证
 *    前6位位地区代码+第7-12位为出生年月日+第13-15位为顺序位（男性最后一位为单数，女为双数）
 *  18位身份证
 *    身份证号码的结构：公民身份证号码是特征组合码，由17位数字本体码和一位校验码组成：6位数字地址码+8位数字出生日期码+三位数字顺序码+1位数字校验码
 *    地址码（前6位）：表示编码对象常住户口所在县（市、旗、区）的行政区划代码，按GB/T2260的规定执行
 *    出生日期码（第7到14位）：表示编码对象出生的年月日，按GB/T7408的规定执行
 * 	   顺序码（第15到17位）：表示在同一地址码所标识的区域范围内，对同年、同月、同日出生的人编定的顺序号，顺序码的奇数分配给男性，偶数分配给女性
 * 	   校验码（第18位）
*/
const verifyIdCard = (num) =>  {
  num = num.toUpperCase();
  // console.log(num);
  // 身份证号码为15位或者18位，15位时全为数字，18位时前17位为数字，最后一位是校验位，可能为数字或字符X
  if (!(/(^\d{15}$)|^\d{17}([0-9]|X)$/.test(num))) {
    const message = '您输入的身份证号长度不对，或者号码不符合规定！\n 15位号码应全是数字，18位号码末位可以是数字或X。';
    console.warn(message);
    return message;
  }
  // 校检位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10
  //下面分别分析出生日期和检验位
	/*
	 * @param len：num长度
	 * @param re：截取num的正则表达式
	 * @param arrSplit：一组数组，截取num里面的信息（包括地址码、出生年月日、顺序码等）
	 * @param dtmBirth：把出生年月日换算成中国标准时间
	 * @param bGoodDay：检验输入出生年月日是否正确，正确返回true
	 * @param arrInt：第i位置上的加权因子
	 * @param nTemp：前17位数字的权求和之值
	*/
  var len, re, arrSplit, dtmBirth, bGoodDay, arrInt, arrCh, nTemp, i;
  len = num.length;
  if (len === 15) {
    // 截取num的第1-6位数字、第7-8位数字、第9-10位数字、第11-12位数字、第13-15位数字
    re = new RegExp(/^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/);
    arrSplit = num.match(re);   // arrSplit[0]为num，arrSplit[1]为地址码，arrSplit[2]为出生年份，arrSplit[3]为出生月份，arrSplit[4]为出生日期，arrSplit[5]为顺序码
    dtmBirth = new Date('19' + arrSplit[2] + '/' + arrSplit[3] + '/' + arrSplit[4]);    // 检查生日日期是否正确
    bGoodDay = (dtmBirth.getYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]));
    console.debug(len, re, arrSplit, dtmBirth, bGoodDay);
    if (!bGoodDay) {
      const message = "您输入的身份证号码里出生日期不对";
      console.warn(message);
      return message;
    } else {
      // 将15位身份证号码转成18位——出生月份前加"19"(20世纪才使用的15位身份证号码),最后一位加校验码
      // 校验码按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10
      arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
      arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
      nTemp = 0;
      num = num.substr(0, 6) + '19' + num.substr(6, num.length - 6);
      for (i = 0; i < 17; i++) {
        nTemp += num.substr(i, 1) * arrInt[i];          // 对前17位数字的权求和
      }
      num += arrCh[nTemp % 11];                          // arrCh[nTemp % 11]为最后一位校验码
      console.debug(nTemp, arrCh[nTemp % 11], num);
      return true;  // True means valid
    }
  }
  if (len == 18) {
    // 截取num的第1-6位数字、第7-10位数字、第11-12位数字、第13-14位数字、第15-18位数字，若有X则截取出来
    re = new RegExp(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/);
    arrSplit = num.match(re);
    dtmBirth = new Date(arrSplit[2] + '/' + arrSplit[3] + '/' + arrSplit[4]);
    bGoodDay = (dtmBirth.getFullYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]));
    console.debug(len, re, arrSplit, dtmBirth, bGoodDay);
    if (!bGoodDay) {
      const message = "您输入的身份证号码里出生日期不对";
      console.warn(message);
      return message;
    } else {
      // 校验18位身份证的校验码是否正确
      // 校验码按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10
      var valnum;
      arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
      arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
      nTemp = 0;
      for (i = 0; i < 17; i++) {
        nTemp += num.substr(i, 1) * arrInt[i];
      }
      valnum = arrCh[nTemp % 11];
      console.debug(nTemp, arrCh[nTemp % 11], num);
      if (valnum != num.substr(17, 1)) {
        const message = "18位身份证的校验码不正确！应该为：" + valnum;
        console.warn(message);
        return message;
      }
      return true;
    }
  }
  return false;
}

module.exports = {
  formatTime,
  formatDate,
  verifyIdCard
}
