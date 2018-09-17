var xml2js = require('xml2js');
var MD5 = require('md5');
var crypto = require('crypto');

var utils = {
    sign: function(object, key) {
        var querystring = utils.createQueryString(object);
        if (key) querystring += "&key=" + key;

        return MD5(querystring).toUpperCase();
    },

    createNonceStr: function(length) {
        length = length || 24;
        if (length > 32) length = 32;

        return (Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2)).substr(0, length);
    },

    createTimestamp: function() {
        return parseInt(new Date().getTime() / 1000) + '';
    },

    createQueryString: function(options) {
        return Object.keys(options).filter(function(key) {
            return options[key] !== undefined && options[key] !== '' && ['pfx', 'apiKey', 'sign', 'key'].indexOf(key) < 0;
        }).sort().map(function(key) {
            return key + '=' + options[key];
        }).join("&");
    },

    buildXML: function(json) {
        var builder = new xml2js.Builder();
        return builder.buildObject(json);
    },

    parseXML: function(xml, fn) {
        var parser = new xml2js.Parser({ trim: true, explicitArray: false, explicitRoot: false });
        parser.parseString(xml, fn || function(err, result) {});
    },

    parseRaw: function() {
        return function(req, res, next) {
            var buffer = [];
            req.on('data', function(trunk) {
                buffer.push(trunk);
            });
            req.on('end', function() {
                req.rawbody = Buffer.concat(buffer).toString('utf8');
                next();
            });
            req.on('error', function(err) {
                next(err);
            });
        }
    },

    pipe: function(stream, fn) {
        var buffers = [];
        stream.on('data', function(trunk) {
            buffers.push(trunk);
        });
        stream.on('end', function() {
            fn(null, Buffer.concat(buffers));
        });
        stream.once('error', fn);
    },


    raw: function(args) {
        var keys = Object.keys(args);
        keys = keys.sort()
        var newArgs = {};
        keys.forEach(function(key) {
            newArgs[key] = args[key];
        });
        var string = '';
        for (var k in newArgs) {
            string += '&' + k + '=' + newArgs[k];
        }
        string = string.substr(1);
        return string;
    },

    paysignjs: function(appid, nonceStr, pack, signType, timeStamp) {
        var ret = {
            appId: appid,
            nonceStr: nonceStr,
            package: pack,
            signType: signType,
            timeStamp: timeStamp
        };
        var string = this.raw(ret);
        string = string + '&key=' + think.config("apiKey");;
        var sign = crypto.createHash('md5').update(string, 'utf8').digest('hex');
        return sign.toUpperCase();
    },

    paysignjsapi: function(appid, attach, body, mch_id, nonce_str, notify_url, openid, out_trade_no, spbill_create_ip, total_fee, trade_type) {
        var ret = {
            appid: appid,
            attach: attach,
            body: body,
            mch_id: mch_id,
            nonce_str: nonce_str,
            notify_url: notify_url,
            openid: openid,
            out_trade_no: out_trade_no,
            spbill_create_ip: spbill_create_ip,
            total_fee: total_fee,
            trade_type: trade_type
        };
        var string = this.raw(ret);
        string = string + '&key=' + key; //key为在微信商户平台(pay.weixin.qq.com)-->账户设置-->API安全-->密钥设置 
        var crypto = require('crypto');
        var sign = crypto.createHash('md5').update(string, 'utf8').digest('hex');
        return sign.toUpperCase();
    },

    // 随机字符串产生函数 
    createNonceStr: function() {
        return Math.random().toString(36).substr(2, 15);
    },

    // 时间戳产生函数 
    createTimeStamp: function() {
        return parseInt(new Date().getTime() / 1000) + '';
    },
}

module.exports = utils;