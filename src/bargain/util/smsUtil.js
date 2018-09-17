var request = require("superagent");


//智能匹配模板发送接口的http地址
var URI_SEND_SMS = "https://sms.yunpian.com/v2/sms/single_send.json";

//编码格式。发送编码格式统一用UTF-8
var ENCODING = "UTF-8";

var apikey = "eb34a6280f6142fd218d1f873930f251"; //可在官网（http://www.yunpian.com)登录后获取

async function sendCaptcha(mobile, code) {
    let params = {
        apikey: apikey,
        text: "【乐家家居顾问】您的验证码是" + code + "。如非本人操作，请忽略本短信",
        mobile: mobile
    }

    let remoteCall = (url, params) => {
        let deferred = think.defer();
        request.post(url)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .set('Accept', 'application/json')
            .send(params)
            .end(function(err, res) {
                console.log('返回信息 = ' + res.text);
                deferred.resolve(JSON.parse(res.text));
            });

        return deferred.promise;
    }

    console.log("send captcha:" + JSON.stringify(params));
    let result = await remoteCall(URI_SEND_SMS, params);
    return result;
}

function createCaptcha() {
    var captcha = "";

    for (var i = 0; i < 4; i++) {
        var seed = Math.floor(Math.random() * 10);
        captcha = captcha + seed;
    }

    return captcha;
}

module.exports.sendCaptcha = sendCaptcha;
module.exports.createCaptcha = createCaptcha;