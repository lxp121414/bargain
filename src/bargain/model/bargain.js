module.exports = class extends think.Model {

    async isBargain(createdId, orderId) {

        return await this.where({ created_by: createdId, order_id: orderId }).find(); // fnid 只查找 一条数据

    }

    async findUserBargain(userId, productId, activityId) {

        return await
        this.field('id,created_name as createdName,price,created_by as createdId')
            .where({ activity_id: activityId, user_id: userId, product_id: productId, order_status: 0 }).select();
    }
}