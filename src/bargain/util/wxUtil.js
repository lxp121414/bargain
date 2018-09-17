var request = require('superagent');
var crypto = require("crypto");
var iconv = require('iconv-lite');
var utils = require('./utils');
var path = require('path');
var fs = require('fs');
const fastXmlParser = require('fast-xml-parser');
var dateUtil = require('./dateUtil')

let appid = "wxd83a044f50e706b5";
let appsecret = "f0fbd557224ae0f217826fcaa4e85fc8";

let mp_appid = "wx5ffdae5615d602f1";
let mp_appsecret = "ff3384d77a9fcbe29184cd5bfd048e59";


async function getAppletUserInfo(code) {
    let url = "https://api.weixin.qq.com/sns/jscode2session?appid=" + appid + "&secret=" +
        appsecret + "&js_code=" + code + "&grant_type=authorization_code";
    return callWeixin(url);
}

async function callWeixin(URL) {
    let deferred = think.defer();
    request.get(URL)
        .end(function(err, res) {
            console.log('返回信息 = ' + res.text);
            deferred.resolve(JSON.parse(res.text));
        });
    return deferred.promise;
}

async function accessToken(code) {
    let url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + mp_appid + "&secret=" +
        mp_appsecret + "&code=" + code + "&grant_type=authorization_code";


    let remoteCall = (url) => {
        let deferred = think.defer();
        request.get(url)
            .end(function(err, res) {
                console.log('返回信息 = ' + res.text);
                deferred.resolve(JSON.parse(res.text));
            });
        return deferred.promise;
    }
    let result = await remoteCall(url);
    return result;
}

async function getTicket() {
    if (global.ticket && (new Date().getTime() - global.ticketTime) < 7000 * 1000) {
        return global.ticket;
    } else {
        let ticketResult = await ticket();
        if (ticketResult && ticketResult.ticket) {
            global.ticket = ticketResult.ticket;
            global.ticketTime = new Date().getTime();
            return global.ticket;
        } else {
            return;
        }
    }
}

async function ticket() {
    let token = await getToken();

    if (token) {
        let url = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" + token + "&type=jsapi";
        let remoteCall = (url) => {
            let deferred = think.defer();
            request.get(url)
                .end(function(err, res) {
                    console.log('返回信息 = ' + res.text);
                    deferred.resolve(JSON.parse(res.text));
                });
            return deferred.promise;
        }
        let result = await remoteCall(url);
        return result;
    } else {
        return;
    }
};

async function getToken() {
    if (global.token && (new Date().getTime() - global.tokenTime) < 7000 * 1000) {
        return global.token;
    } else {
        let tokenResult = await token();
        console.log(tokenResult);

        if (tokenResult.access_token) {
            global.token = tokenResult.access_token;
            global.tokenTime = new Date().getTime();
            return global.token;
        } else {
            return;
        }
    }
}

async function token() {
    var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + mp_appid + "&secret=" + mp_appsecret;
    let remoteCall = (url) => {
        let deferred = think.defer();
        request.get(url)
            .end(function(err, res) {
                console.log('返回信息 = ' + res.text);
                deferred.resolve(JSON.parse(res.text));
            });
        return deferred.promise;
    }
    let result = await remoteCall(url);

    return result;
};

async function userInfo(openid, token) {
    // url = "https://api.weixin.qq.com/cgi-bin/user/info?access_token="  公众号登录
    // url = "https://api.weixin.qq.com/sns/userinfo?access_token=" 网页授权
    var url = "https://api.weixin.qq.com/cgi-bin/user/info?access_token=" + token + "&openid=" + openid;
    let remoteCall = (url) => {
        let deferred = think.defer();
        request.get(url)
            .end(function(err, res) {
                console.log('返回信息 = ' + res.text);
                deferred.resolve(JSON.parse(res.text));
            });
        return deferred.promise;
    }
    let result = await remoteCall(url);
    return result;
};


async function jsapisign(url) {
    let ticket = await getTicket();

    if (!ticket) {
        return;
    }

    obj = {
        //jsapi_ticket
        jsapi_ticket: ticket,

        // 随机字符串
        noncestr: nonce(),

        // 时间戳
        timestamp: Math.round(new Date().getTime() / 1000),

        //url
        url: url
    }

    var stringSignTemp = '';
    for (var k of Object.keys(obj).sort()) {
        stringSignTemp += k + '=' + obj[k] + '&'
    }
    stringSignTemp = stringSignTemp.substring(0, stringSignTemp.length - 1);

    console.log(stringSignTemp);
    obj.signature = sha1(stringSignTemp);
    return obj;
}


function nonce(length) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var maxPos = chars.length;
    var noceStr = "";
    for (var i = 0; i < (length || 32); i++) {
        noceStr += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return noceStr;
};


function sha1(str) {　　
    str = (new Buffer(str)).toString("binary");　　
    var ret = crypto.createHash('sha1').update(str).digest("hex");　　
    console.log(ret);
    return ret;
}


// 支付信息 初始化
function init(options) {

    options.appid = think.config("appid");
    options.mch_id = think.config("mch_id");
    options.apiKey = think.config("apiKey"); //微信商户平台API密钥
    options.pfx = fs.readFileSync(path.join(process.cwd(), 'apiclient_cert.p12')) //微信商户平台证书 (optional，部分API需要使用)
    if (!options.appid || !options.mch_id) {
        throw new Error("Not set appid, mech_id...");
    }
    return options
}

// 创建统一支付订单
// spec: https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_1
async function createUnifiedOrder(order, options) {

    order.spbill_create_ip = '172.0.0.1'; // 可以省略
    order.notify_url = think.config("notify");
    order.trade_type = 'JSAPI';
    order.nonce_str = order.nonce_str || utils.createNonceStr();
    order.appid = options.appid;
    order.mch_id = options.mch_id;
    order.sign = utils.sign(order, options.apiKey);

    console.log(order);

    //return utils.buildXML(order);
    var data = { method: 'POST', body: utils.buildXML(order) }

    console.log("发送的请求", data.body);
    var text = await think.fetch("https://api.mch.weixin.qq.com/pay/unifiedorder", data).then(res => res.text());
    //return text
    //var result = await utils.parseXML(text);
    console.log(text);
    var result = await fastXmlParser.parse(text);
    console.log(result);
    return result;
}


// 获取 prepay_id 后的签名
async function getPaysign(obj) {

    var nonceStr = await utils.createNonceStr();
    // var timeStamp = await utils.createTimeStamp();

    var timeStamp = dateUtil.addHours().getTime() / 1000;
    var appid = think.config("appid");
    var paysign = await utils.paysignjs(appid, nonceStr, "prepay_id=" + obj.xml.prepay_id, 'MD5', timeStamp);

    var result = {

        "appId": appid, //公众号名称，由商户传入 
        "timeStamp": timeStamp.toString(), //时间戳，自1970年以来的秒数 _this.orderinfo.timeStamp 
        "nonceStr": nonceStr, //随机串 
        "package": "prepay_id=" + obj.xml.prepay_id,
        "signType": 'MD5', //微信签名方式： 
        "paySign": paysign //微信签名 
    }

    console.log(result);


    return result;

}



module.exports.getTicket = getTicket;
module.exports.getToken = getToken;
module.exports.userInfo = userInfo;
module.exports.jsapisign = jsapisign;
module.exports.accessToken = accessToken;
module.exports.getAppletUserInfo = getAppletUserInfo;
module.exports.createUnifiedOrder = createUnifiedOrder;
module.exports.init = init;
module.exports.getPaysign = getPaysign;
module.exports.token = token;