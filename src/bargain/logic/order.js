module.exports = class extends think.Logic {

    async addOrderAction() {

        this.rules = {
            userId: {
                required: true
            },
            productId: {
                required: true
            },
            activityId: {
                required: true
            },
            number: {
                required: true
            }

        }
    }

    async getorderAction() {

        this.rules = {
            orderId: {
                required: true
            }
        }
    }


    // 判断 用户 是否 有参加过活动  // 以及 订单 状态的 确认(不判断 无效就成为 垃圾数据)
    async isOrderAction() {
        // 用户 id
        this.rules = {
            userId: {
                required: true
            }
        }
    }


    // 查看 我的订单 
    async myOrderAction() {
        this.rules = {
            userId: {
                required: true
            }
        }
    }

    // 获取 当前用户 订单id
    async getOrderIdAction() {
        this.rules = {
            userId: {
                required: true
            },
            productId: {
                required: true
            }
        }
    }


    // 更新 用户名 手机号 (参数验证)
    async updateOrderAction() {
        this.rules = {
            orderId: {
                required: true
            },
            phone: {
                required: true
            },
            userName: {
                required: true
            },
            number: {
                required: true
            }
        }

    }

    // 发送 手机 验证码
    async getSmsUtilAction() {
        this.rules = {
            phone: {
                required: true
            }
        }

    }




    // 用户 支付 定金
    async payOrderAction() {
        this.rules = {
            orderId: {
                required: true
            },
            userId: {
                required: true
            }
        }
    }



    async payAction() {
        this.rules = {
            orderId: {
                required: true
            },
            userId: {
                required: true
            }
        }

    }
}