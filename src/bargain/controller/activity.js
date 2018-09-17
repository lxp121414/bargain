const Base = require('./base.js');
var activity = think.model('activity');
var bargain = think.model('bargain');
var order = think.model('order');
var mapUnderscoreToCamelCase = require('../util/mapUnderscoreToCamelCase');
var dateUtil = require('../util/dateUtil')
var moment = require('moment');

module.exports = class extends Base {
    indexAction() {
        return this.display();
    }


    // 添加 一条活动 
    async addAction() {

        var data = this.post();

        data = mapUnderscoreToCamelCase.activity(data);

        data.created_time = dateUtil.addHours().getTime();

        var result = await activity.add(data);

        return this.success(result);
    }


    // 上架 下架 
    async updateUseAction() {

        var activityId = this.post('activityId');

        var use = this.post('useStatus'); // 0 或者 1

        var result = await activity.where({ activity_id: activityId }).update({ use_status: use });
        // 返回 1 修改成功  后期处理

        return this.success(result);

    }



    // 修改 删除  传入 修改的 字段与值
    async updateActivityAction() {

        var data = this.post();

        data = mapUnderscoreToCamelCase.activity(data);

        var result = await activity.where({ activity_id: data.activityId }).update(data);

        return this.success(result);
    }


    // 获取  在当前时间的活动
    // async getActivityAction() {

    //     //  获取用户 openid  
    //     var userId = this.post('userId');

    //     // 获取 砍价人 id （可能不能这么获取）
    //     var createdId = this.post('createdId');

    //     // 订单 id  // 必传
    //     var orderId = this.post('orderId');

    //     // 当前时间的 毫秒数
    //     var date = dateUtil.addHours().getTime();

    //     //  活动 / 商品 信息 正在进行的 活动-商品 信息
    //     var result = await activity.getActivityProduct(date);

    //     if (think.isEmpty(result)) { // 活动结束了
    //         return this.fail('NOT_VALIDATOR');
    //     }

    //     // 获取订单 活动 信息 
    //     var orderResult = await order.where({ order_id: orderId }).find();
    //     //console.log(orderResult);
    //     if (think.isEmpty(orderResult)) {
    //         return this.fail('NOT_ORDER');
    //     }

    //     if (think.isEmpty(userId)) {
    //         userId = orderResult.user_id;
    //     }

    //     // createdId 存在 验证 ：
    //     if (!think.isEmpty(createdId)) {
    //         console.log(orderResult.activity_id);
    //         console.log(orderResult.product_id);

    //         if (result[0].activity_id != orderResult.activity_id || result[0].product[0].productId != orderResult.product_id) {
    //             return this.fail('VALIDATOR_END');
    //         }
    //     }

    //     for (let i = 0; i < result.length; i++) { // 遍历 活动

    //         // 遍历 每一个 商品  可以更改
    //         var pro = result[i].product; // 商品信息

    //         result[i].orderStatus = orderResult.order_status;

    //         // console.log(orderResult.oreder_status);

    //         for (let j = 0; j < pro.length; j++) { // 遍历 商品

    //             // 获取 该商品 能减 的 价格
    //             var price = orderResult.price - pro[j].minPrice;
    //             // console.log(price);
    //             // console.log(userId);
    //             // console.log(pro[j].productId);
    //             // console.log(result[i].activity_id);

    //             // 获取 砍价 列表  用户id 商品id 活动 id  订单 状态
    //             //var bargainArray = await bargain.findUserBargain(userId, pro[j].productId, result[i].activity_id); // 更改成 用户订单查找
    //             var bargainArray = await bargain.field('id,created_name as createdName,price,created_by as createdId').where({ order_id: orderId }).select();

    //             result[i].bargain = bargainArray;

    //             var bargainPrice = 0.00;

    //             var isBargain = false;

    //             // 算出 总砍价 值
    //             bargainArray.forEach(function(item, x) {

    //                 bargainPrice = bargainPrice + item.price;

    //                 // 判断 createdId 是否 砍过价
    //                 if (createdId != null && createdId == item.createdId) {
    //                     isBargain = true;
    //                 }

    //             });

    //             pro[j].isBargain = isBargain;

    //             // 将 userId  createdId 返回  用于前端 判断

    //             pro[j].userid = userId;
    //             pro[j].createdId = createdId;



    //             if (price > bargainPrice) {
    //                 pro[j].bargainPrice = bargainPrice;
    //             } else {
    //                 pro[j].bargainPrice = price;
    //             }


    //         }

    //     };

    //     return this.success(result);
    // }

    // 获取活动 未开启 页面 展示数据
    async getStartActivityAction() {

        var userId = this.post('userId');

        // 当前时间的 毫秒数
        var date = dateUtil.addHours().getTime();

        //  活动 / 商品 信息 正在进行的 活动-商品 信息
        var result = await activity.setRelation(true).getActivityProduct(date);

        if (think.isEmpty(result)) {
            return this.fail('VALIDATOR_END');
        }

        var activityId = result[0].activity_id;

        var ord = await order.where({ user_id: userId, activity_id: activityId }).find();

        if (think.isEmpty(ord)) {
            result[0].isOrder = false;
        } else {
            result[0].isOrder = true;
        }

        return this.success(result);
    }



};