const Base = require('./base.js');
var product = think.model('product');
var activity = think.model('activity');
var bargain = think.model('bargain');
var user = think.model('user');
var order = think.model('order');
var dateUtil = require('../util/dateUtil')



module.exports = class extends Base {
    indexAction() {
        return this.display();
    }



    // 添加 一条 砍价 信息（答题完毕后 提交接口）
    async addBargainAction() {

        // 用户 id (用户 openid )
        // 帮 砍价 人 id(createdId)
        // 商品 id
        // 活动 id
        // 答题 正确数量  number
        // 订单 id  orderId



        var data = this.post(); // 获取所有 参数

        // 获取订单号
        var ord = await order.where({ order_id: data.orderId }).find();

        console.log(ord);

        if (think.isEmpty(ord)) {
            return this.fail('NOT_ORDER');
        }

        // 查找 商品  若为 null  返回 商品 以下架
        var pdt = await product.where({ product_id: ord.product_id }).find();

        // 查找 活动  若为 null  返回 活动 已结束
        var act = await activity.where({ activity_id: ord.activity_id }).find();

        if (think.isEmpty(act)) {
            return this.fail('NOT_VALIDATOR');
        }

        if (think.isEmpty(pdt)) {
            return this.fail('NOT_PRODUCT');
        }

        // 判断 用户是否 砍过价
        var bar = await bargain.isBargain(data.createdId, data.orderId);

        console.log(bar);

        if (!think.isEmpty(bar)) {
            return this.fail('NOT_BARGAIN');
        }

        // 防止刷接口 判断 用户 id 是否存在
        var users = await user.where({ openid: data.createdId }).find();

        console.log(users);
        if (think.isEmpty(users)) {
            return this.fail('NOT_USER');
        }



        // 计算 价格 （题数 * mark_down）  
        var price = data.number * pdt.mark_down; // 初始化一条



        // 处理  获取单价 与 底价
        var zongPrice = await bargain.where({ order_id: data.orderId }).sum('price');
        var min_price = pdt.min_price; // 底价
        var orderPrice = ord.price; // 总价

        if (orderPrice - min_price < zongPrice + price) { // price  要变成 差价
            price = orderPrice - min_price - zongPrice;
        }

        // 添加一条 砍价 数据
        bar = {
            activity_id: ord.activity_id,
            user_id: ord.user_id,
            product_id: ord.product_id,
            created_by: data.createdId,
            created_name: users.nickname,
            price: price,
            created_time: dateUtil.addHours().getTime(),
            order_id: data.orderId
        }

        var result = await bargain.add(bar);
        return this.success({ 'price': price });
    }

}