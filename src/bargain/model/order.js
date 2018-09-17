module.exports = class extends think.Model {




    get relation() {
        return {
            product: {
                type: think.Model.HAS_ONE,
                key: 'product_id',
                fKey: 'product_id',
                field: 'product_id,activity_id as activity,name,image,description,price,handsel,min_price as minPrice,stock,mark_down as markDown', // 主键 不能重命名
                where: { delete_status: 0, product_status: 1 }
            }
        }
    }

}