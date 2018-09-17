const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });

module.exports = {
    messages: {
        // required: '{name} 不能为空',
        // int: '{name} 必须为int 类型',
        eqLucy: '{name} should eq {args}',
        ERR_TEST: [1002, { 'stateCode': "解密异常" }],
        NOT_GET: [1003, '参数异常'],
        NOT_VALIDATOR: [1006, { 'stateCode': "无此活动" }],
        NOT_PRODUCT: [1007, { 'stateCode': "无此商品" }],
        NOT_BARGAIN: [1008, { 'stateCode': "该商品，您以帮好友砍过价" }],
        NOT_USER: [1009, { 'stateCode': "用户ID 不存在" }],
        NOT_ORDER: [1010, { 'stateCode': "orderId 异常" }],
        VALIDATOR_END: [1011, { 'stateCode': "活动已结束" }],
        STOCK_NOT: [1012, { 'stateCode': "库存不足" }],
        CODE_RESEND: [1013, { 'stateCode': "请重新获取验证码" }],
        CODE_ERR: [1014, { 'stateCode': "验证码错误" }],
        // PAY_ERR: [1015, { 'stateCode': "支付失败" }],
        CODE_NOT: [1015, { 'stateCode': "code 错误" }],

        PAY_ERR: [1016, { 'stateCode': "调取支付失败" }],
        NUMBER_NOT: [1017, { 'stateCode': "未达到指定购买数量" }],
        NOTUSER_BARGAIN: [1018, { 'stateCode': "自己不能帮自己砍价哦!" }],
    }
}