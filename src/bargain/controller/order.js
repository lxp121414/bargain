var order = think.model('order');
var product = think.model('product');
var user = think.model('user');
var activity = think.model('activity');
var uuid = require('node-uuid')
var smsUtil = require('../util/smsUtil');
var dateUtil = require('../util/dateUtil');
var wxUtil = require('../util/wxUtil');
var moment = require('moment');
const Base = require('./base.js');
const fastXmlParser = require('fast-xml-parser');
var payment = think.model('payment');
var util = require('../util/utils');
var bargain = think.model('bargain');

module.exports = class extends Base {

    // 创建 订单(立即参加) 
    async addOrderAction() {
        // 需要 用户 id  商品id
        var userId = this.post('userId');
        var productId = this.post('productId');
        var activityId = this.post('activityId');
        var number = this.post('number');

        // 查找 product 商品表
        var pro = await product.where({ product_id: productId }).find();
        if (think.isEmpty(pro)) {
            return this.fail('NOT_PRODUCT');
        }

        // 查找 用户信息
        var us = await user.where({ openid: userId }).find();
        if (think.isEmpty(us)) {
            return this.fail('NOT_USER');
        }

        // 判断 该用户 对该商品 有没有未完成订单
        var ord = await order.where({ user_id: userId, product_id: productId, order_status: 0 }).find();

        console.log(ord);

        if (!think.isEmpty(ord)) {

            return this.success({ 'orderId': ord.order_id });
        }

        // 获取 总价 数量 单价 
        var price = number * pro.price;

        if (price - pro.handsel < 0) {
            return this.fail("NUMBER_NOT");
        }

        if (price - pro.min_price < 0) {
            return this.fail('NUMBER_NOT');
        }

        // var orderId = uuid.v1().replace(/\-/g, ''); // 生成订单号
        // 订单好随机生成



        var date = dateUtil.addHours().getTime();

        // var time = new Date().getTime().toString();
        var orderId = new Date().getTime().toString() + dateUtil.getNumber(3);
        var data = {
            order_id: orderId,
            user_id: us.openid,
            product_id: productId,
            user_name: us.nickname,
            phone: us.mobile,
            price: price,
            handsel: pro.handsel,
            created_time: date,
            update_time: date,
            activity_id: activityId,
            number: number
        }
        var result = await order.add(data);
        // 返回 订单号
        return this.success({ 'orderId': orderId });

    }


    // 判断 用户 是否 有参加过活动  // 以及 订单 状态的 确认(不判断 无效就成为 垃圾数据)
    async isOrderAction() {
        // 用户 id
        var userId = this.post('userId');

        var date = dateUtil.addHours().getTime();

        var result = await activity.setRelation(true).getActivityProduct(date);

        console.log(result);

        // 目前查找产品 id

        if (think.isEmpty(result)) {
            return this.fail('NOT_VALIDATOR');
        }

        var pro = result[0].product;

        if (think.isEmpty(pro)) {
            return this.fail('NOT_PRODUCT');
        }

        var productId = pro[0].productId;

        // 查找订单 （订单状态 0）
        var ord = await order.where({ user_id: userId, product_id: productId, order_status: 0 }).find();

        if (think.isEmpty(ord)) {
            return this.success({ 'join': false });
        } else {
            return this.success({ 'join': true, 'orderId': ord.order_id });
        }
    }


    // 查看 我的订单 
    async myOrderAction() {
        // 用户 id 
        var userId = this.post('userId');

        var ord = await order
            .setRelation(true)
            .field('id,order_id as orderId,user_id as userId,product_id,user_name as userName,phone,price,handsel,bargain_price as bargainPrice ,created_time as createdTime')
            .where({ user_id: userId, order_status: 1 }).order('createdTime DESC').select();

        return this.success(ord);
    }


    // 获取订单 信息
    async getOrderAction() {

        //  获取用户 openid  
        // var userId = this.post('userId');

        // 获取 砍价人 id （可能不能这么获取）
        var createdId = this.post('createdId');

        // 订单 id  // 必传
        var orderId = this.post('orderId');

        // 获取订单 活动 信息 
        var orderResult = await order.setRelation(false).where({ order_id: orderId }).find();
        //console.log(orderResult);



        if (think.isEmpty(orderResult)) {
            return this.fail('NOT_ORDER');
        }

        if (createdId == orderResult.user_id) {
            return this.fail('NOTUSER_BARGAIN');
        }

        // 当前时间的 毫秒数
        // var date = dateUtil.addHours().getTime();

        //  活动 / 商品 信息 正在进行的 活动-商品 信息(目前配置一个活动一个商品)
        //  var result = await activity.getActivityProduct(date);
        //  var result = await activity.getOrderActivity(orderResult.activity_id); // 查了一个活动 对应多个商品  （目前就一个商品）
        // if (think.isEmpty(result)) { // 活动结束了
        //     return this.fail('NOT_VALIDATOR');
        // }

        var result = await activity
            .setRelation(false)
            .field('activity_id,activity_name as activityName,details,start_time as startTime ,end_time as endTime,question_category as questionCategory,number')
            .where({ activity_id: orderResult.activity_id }).find();

        result.product = await product.field('activity_id,product_id as productId,name,image,description,price,handsel,min_price as minPrice,stock,mark_down as markDown')
            .where({ product_id: orderResult.product_id, activity_id: orderResult.activity_id })
            .find()

        var userId = orderResult.user_id;


        // 以下是逻辑判断

        var data = {}

        //data.orderPrice = orderResult.price;
        data.order = orderResult;
        var act = result;
        var pro = act.product // 活动 商品 

        // data.orderStatus = orderResult.order_status;

        data.activity = act;
        //data.product = pro;


        // 获取 该商品 能减 的 价格
        var price = orderResult.price - pro.minPrice; // 此处是总价 - 底价


        // console.log(price);
        // console.log(userId);
        // console.log(pro[j].productId);
        // console.log(result[i].activity_id);

        // 获取 砍价 列表  用户id 商品id 活动 id  订单 状态
        //var bargainArray = await bargain.findUserBargain(userId, pro[j].productId, result[i].activity_id); // 更改成 用户订单查找
        var bargainArray = await bargain.field('id,created_name as createdName,price,created_by as createdId,created_time as createdTime').where({ order_id: orderId }).select();

        data.bargain = bargainArray;

        var bargainPrice = 0.00;

        var isBargain = false;

        // 算出 总砍价 值
        bargainArray.forEach(function(item, x) {

            bargainPrice = bargainPrice + item.price;

            // 判断 createdId 是否 砍过价
            if (createdId != null && createdId == item.createdId) {
                isBargain = true;
            }

        });

        data.isBargain = isBargain;

        // 将 userId  createdId 返回  用于前端 判断

        data.userid = userId;
        data.createdId = createdId;

        if (!think.isEmpty(data.createdId)) { // 存在 createdId
            data.createdUser = await user.where({ openid: userId }).find();
        }


        // console.log('bargainPrice', bargainPrice);
        // console.log('price', price);

        if (price > bargainPrice) {
            data.bargainPrice = bargainPrice;
        } else {
            data.bargainPrice = price;
        }

        return this.success(data);
    }


    // 获取 当前用户 订单id
    async getOrderIdAction() {
        var userId = this.post('userId');
        var productId = this.post('productId');
        var result = await order.field('id,order_id as orderId,user_id as userId,product_id as productId').where({ user_id: userId, product_id: productId, order_status: 0 }).find();

        return this.success(result);
    }


    // 更新 用户名 手机号 (参数验证)
    async updateOrderAction() {

        var orderId = this.post('orderId');
        var phone = this.post('phone'); // 手机号
        var userName = this.post('userName'); // 用户名        
        var number = this.post('number'); // 验证码

        var city = this.post('city');
        var province = this.post('province');

        // 获取 global.phone 
        var code = global.phone;

        if (think.isEmpty(code)) {
            return this.fail('CODE_RESEND');
        }

        if (number != code) {
            return this.fail('CODE_ERR');
        }

        var ord = await order.where({ order_id: orderId }).update({ user_name: userName, phone: phone, city: city, province: province });
        return this.success(ord);
    }

    // 发送 手机 验证码
    async getSmsUtilAction() {
        // 获取手机号
        var phone = this.post('phone');
        // 产生 6 位随机数
        var number = smsUtil.createCaptcha();
        // 将验证码 设到 全局变量中
        global.phone = number;
        console.log(number);
        // 发送 验证码
        smsUtil.sendCaptcha(phone, number);
        return this.success();
    }


    // 用户支付
    async payAction() {

        var param = this.post();

        // 查找订单
        var rod = await order.where({ user_id: param.userId, order_id: param.orderId }).find();

        if (think.isEmpty(rod)) {
            return this.fail('NOT_ORDER');
        }

        var handsel = rod.handsel * 100 + "";

        var data = wxUtil.init({
            orderId: param.orderId,
            productI: rod.product_id,
            openid: param.userId
        });

        var result = await wxUtil.createUnifiedOrder({
            body: '支付定金', // 商品或支付单简要描述
            out_trade_no: data.orderId, // 商户系统内部的订单号,32个字符内、可包含字母               
            product_id: data.productId,
            openid: data.openid,
            total_fee: handsel
        }, data);


        var re = await wxUtil.getPaysign(result);

        return this.success(re);
    }



    // 支付成功 跳转的 页面

    async paymentOrderAction() {
        var data = this.post().xml;

        // 订单状态  金额  签名
        // console.log(data.xml.appid[0]);
        var out_trade_no = data.out_trade_no[0];
        var total_fee = data.total_fee[0];

        //var xml = '<xml><appid><![CDATA[wx2421b1c4370ec43b]]></appid><attach><![CDATA[支付测试]]></attach><bank_type><![CDATA[CFT]]></bank_type><fee_type><![CDATA[CNY]]></fee_type><is_subscribe><![CDATA[Y]]></is_subscribe><mch_id><![CDATA[10000100]]></mch_id><nonce_str><![CDATA[5d2b6c2a8db53831f7eda20af46e531c]]></nonce_str><openid><![CDATA[oUpF8uMEb4qRXf22hE3X68TekukE]]></openid><out_trade_no><![CDATA[1409811653]]></out_trade_no><result_code><![CDATA[SUCCESS]]></result_code><return_code><![CDATA[SUCCESS]]></return_code><sign><![CDATA[B552ED6B279343CB493C5DD0D78AB241]]></sign><sub_mch_id><![CDATA[10000100]]></sub_mch_id><time_end><![CDATA[20140903131540]]></time_end><total_fee>1</total_fee><coupon_fee><![CDATA[10]]></coupon_fee><coupon_count><![CDATA[1]]></coupon_count><coupon_type><![CDATA[CASH]]></coupon_type><coupon_id><![CDATA[10000]]></coupon_id><coupon_fee><![CDATA[100]]></coupon_fee><trade_type><![CDATA[JSAPI]]></trade_type><transaction_id><![CDATA[1004400740201409030005092168]]></transaction_id></xml>';
        //var data = await fastXmlParser.parse(xml).xml;

        var ord = await order.where({ order_id: out_trade_no }).find();
        console.log(ord);

        var isNot = false;

        if (ord.order_status == 1) {
            console.log("订单已完成！");
            // 下面代码 就不执行了 
            isNot = true;
        }


        console.log(ord.handsel);
        console.log(total_fee[0]);
        if (ord.handsel * 100 != total_fee[0]) {
            console.log("支付金额不正确！" + total_fee);
            isNot = true;
        }

        // var re = require('querystring').stringify(data);
        // 签名验证
        var sign = util.sign(data, think.config('apiKey'));
        console.log('sign', sign);
        if (sign != data.sign[0]) {
            console.log("sign 不正确！" + sign);
            isNot = true;
        }


        if (isNot) {
            return this.success('<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>');
        }
        //console.log(re);
        //return this.success(sign);
        //stringSignTemp=stringA+"&key=192006250b4c09247ec02edce69f6a2d" //注：key为商户平台设置的密钥key
        //sign=MD5(stringSignTemp).toUpperCase()="9A0A8659F005D6984697E2CA0A9CF3B7"




        // 业务逻辑 处理
        // 1.修改订单状态  2.生成支付信息  
        await order.where({ order_id: data.out_trade_no[0] }).update({ order_status: 1 });


        await payment.add({
            amount: data.total_fee[0] / 100,
            order_no: data.transaction_id[0],
            pay_time: dateUtil.addHours().getTime(),
            openid: data.openid[0],
            order_id: data.out_trade_no[0]
        });

        return this.success('<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>');

    }


    // 获取 用户所遇订单 
    async orderAction() {
        // 获取所有支付定金的订单
        var result = await order.where({ order_status: 1 }).order('created_time DESC').select();
        return this.success(result);

    }

    // 修改备注
    async backstageAction() {
        var data = this.post();
        var result = await order.where({ order_id: data.orderId }).update({ backstage: data.backstage });
        return this.success();
    }


    async dateAction() { // 精度
        // var orderId = uuid.v1();
        // console.log(orderId);

        // return this.success(orderId.replace(/\-/g, ''));

        // var data = dateUtil.addHours().getTime();       
        // console.log(new Date());

        // return this.success(data); 

        var time = new Date().getTime();

        var result = dateUtil.getNumber(2);
        return this.success(time);

    }

};