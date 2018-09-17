const Base = require('./base.js');
var user = think.model('user');
var wxUtil = require('../util/wxUtil')
var dateUtil = require('../util/dateUtil')
var moment = require('moment');
var fs = require('fs');
var request = require('request');

module.exports = class extends Base {

    // 用户登录
    async loginAction() {
        var code = this.post('code');

        //var code = '011gOygv0CPtCb10kcfv06ypgv0gOygF';
        var data = await wxUtil.accessToken(code);

        console.log(data);

        if (think.isEmpty(data.openid)) {
            return this.fail('CODE_NOT');
        }

        // 

        // 回传 openid 
        var openid = data.openid;

        var re = await wxUtil.token();
        var token = re.access_token;


        // 判断 openid 是否存入 

        var users = await user.where({ openid: openid }).find();

        console.log(users);



        // var openid = 'ouUwit6INVXYGgADyw1kSwwu0of4';
        // var token = '12_D0I40McpXHvODFFbk_CbWKzhJzqQqGuVj71a0_XiaC9SrYTCVFDgZtB7tzregz7vh_4pc7sLHOKxGb3QBw3CVA';
        // var url = "https://api.weixin.qq.com/sns/auth?access_token=" + token + "&openid=" + openid
        // var aa = await think.fetch(url, { method: 'GET' }).then(res => res.text());

        // console.log("ads", aa);

        var addUser = await wxUtil.userInfo(openid, token);
        console.log(addUser);

        if (think.isEmpty(users)) {
            addUser.created_time = dateUtil.addHours().getTime();
            if (addUser.subscribe == 0) {
                return this.success(addUser);
            }
            await user.add(addUser);
            return this.success(addUser);

        }
        return this.success(addUser);

    }


    /**
     * 获取jsapi签名
     */
    async jsapisignAction() {
        let url = this.post("url");
        let data = await wxUtil.jsapisign(url);
        data.appid = think.config('appid');
        return this.success(data)
    }


    // 测试 发送请求 生成图片
    async imgAction() {
        var url = 'https://api.weixin.qq.com/wxa/getwxacode?access_token=12_uqoV-flEqwe5lsz-WBz4y672wZo85OL_AiPSBJNK_8_vlZDXaRCOlq3AkDBDsyKOL4LGMZGTgR1tzjQeTNg_HawuBB3WMNUJInRndyWTVhixXPbpdaB-zvPM8bCyHVq11s4gsSfgbTJdlzjHWVOfAFACBU';
        // var body = { "path": "appreciates/appreciates", "width": 300 }
        // const res = await this.fetch(url, { method: 'POST', body: body }).then(res => res.text());

        // console.log(res);

        var data = 'gQG28DoAAAAAAAAAASxodHRwOi8vd2VpeGluLnFxLmNvbS9xL0FuWC1DNmZuVEhvMVp4NDNMRnNRAAIEesLvUQMECAcAAA==';
        // var dataBuffer = new Buffer(data);

        // fs.writeFile('E://avatar3.png', dataBuffer, function(err) {
        //     if (err) { console.log(err) }
        // });

        request({
            method: 'POST',
            url: url,
            encoding: null,
            body: JSON.stringify({
                path: 'http://lxp.com',

            })
        }, function(err, data) {
            //将微信返回的东西装到文件中。
            // data.pipe(fs.createWriteStream('E://lxp' + '.png'));
            //console.log(data.body);


            var base64 = data.body.toString('base64');
            console.log(base64);


            base64 = base64.replace(/^data:image\/\w+;base64,/, ""); //去掉图片base64码前面部分data:image/png;base64
            var dataBuffer = new Buffer(base64, 'base64'); //把base64码转成buffer对象，
            console.log('dataBuffer是否是Buffer对象：' + Buffer.isBuffer(dataBuffer));
            fs.writeFile('E://lxp' + '.png', dataBuffer, function(err) { //用fs写入文件
                if (err) {
                    console.log(err);
                } else {
                    console.log('写入成功！');
                }
            })

        })



        //     let deferred = think.defer();
        //   remoteCall =  request.get(url)
        //         .end(function(err, res) {
        //             console.log('返回信息 = ' + res.text);
        //             deferred.resolve(res.text);
        //         });
        //     return deferred.promise;
        // }
        // let result = await remoteCall(url);

        // console.log(result);
        // return result;


    }

}