var wxPayment = require('wx-payment');
var fs = require('fs');
var path = require('path');

// 
async function prepayment(data) {
    //  wx 支付 初始化 
    wxPayment.init({

    });

    var result = await wxPayment.createUnifiedOrder({
        body: '定金支付', // 商品或支付单简要描述
        out_trade_no: data.orderId, // 商户系统内部的订单号,32个字符内、可包含字母
        total_fee: 100,
        spbill_create_ip: '192.168.25.101', //
        notify_url: think.config("notify"),
        trade_type: 'JSAPI',
        product_id: data.productId,
        openid: data.openid
    })

    console.log(result);
}


module.exports.prepayment = prepayment;