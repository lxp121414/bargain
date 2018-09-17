const Base = require('./base.js');

var mapUnderscoreToCamelCase = require('../util/mapUnderscoreToCamelCase');
var product = think.model('product');

module.exports = class extends Base {
    indexAction() {
        return this.display();
    }


    // 添加 商品 
    async addProduct() {
        var data = this.post();

        data = mapUnderscoreToCamelCase.product(data);

        var result = await product.add(data);

        return this.success();
    }

    // 商品上下架
    async updateUseAction() {

        var productId = this.post('productId');

        var productStatus = this.post('productStatus'); // 0 或者 1

        var result = await product.where({ produc_id: productId }).update({ product_status: productStatus });
        // 返回 1 修改成功  后期处理

        return this.success(result);

    }

    // 商品修改 删除
    async updateProduct() {

        var data = this.post();

        data = mapUnderscoreToCamelCase.product(data);

        var result = await product.where({ product_id: data.productId }).update(data);

        return this.success(result);
    }

};