module.exports = class extends think.Logic {
    indexAction() {

    }

    // 添加 商品 
    async addProduct() {
        this.rules = {
            name: {
                required: true,
                string: true,
            },
            image: {
                required: true
            },
            description: {
                required: true
            },
            price: {
                required: true
            },
            minPrice: {
                required: true
            },
            stock: {
                required: true
            },
            markDown: {
                required: true
            }
        }
    }

    // 商品上下架
    async updateUseAction() {
        this.rules = {
            productStatus: {
                required: true,
                int: { min: 0, max: 1 }
            },
            productId: {
                required: true
            }

        }
    }

    // 商品修改 删除
    async updateProduct() {
        this.rules = {
            productId: {
                required: true
            }
        }
    }
};