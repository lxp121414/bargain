var moment = require('moment');


// mongo 数据 date 加 8小时

function addHours() {
    var date = new Date(moment().format());
    return date;
}


function getDateStr() {
    var d = new Date();
    var date = d.getFullYear() + "" + (d.getMonth() + 1) + "" + d.getDate();
    return date;
}


function getDateMilli() {
    var d = new Date();
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);

    return d;
}

function getWeekStr() {
    var d = new Date();
    var date = d.getFullYear() + "" + getYearWeek(d);
    return date;
}

function getYearWeek(date) {
    var date2 = new Date(date.getFullYear(), 0, 1);
    return ((date - date2) / (24 * 60 * 60 * 7 * 1000) | 0) + 1;

}

// 对数据库 取出 的时间 加 8小时
function addHoursDate(date) {
    var sj = new Date(moment(date).add(8, 'hours').format()); // 返回的 是 字符串
    return sj;
}


// 获取 随机数 
function getNumber(length) {

    var result = "";

    var n = 20;
    if (null != length && length > 0) {
        n = length;
    }
    var randInt = 0;
    for (var i = 0; i < n; i++) {
        var randInt = Math.floor(Math.random() * 10);;
        result += randInt;
    }
    return result;

}


module.exports.getDateStr = getDateStr;
module.exports.getDateMilli = getDateMilli;
module.exports.getWeekStr = getWeekStr;
module.exports.addHours = addHours;
module.exports.addHoursDate = addHoursDate;
module.exports.getNumber = getNumber;