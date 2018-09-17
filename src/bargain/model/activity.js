module.exports = class extends think.Model {

    get relation() {
        return {
            product: {
                type: think.Model.HAS_MANY,
                key: 'activity_id',
                fKey: 'activity_id',
                field: 'activity_id,product_id as productId,name,image,description,price,handsel,min_price as minPrice,stock,mark_down as markDown', // 主键 不能重命名
                where: { delete_status: 0, product_status: 1 }
            }
        }
    }


    async getActivityProduct(date) {
        return await this
            .field('activity_id,activity_name as activityName,details,start_time as startTime ,end_time as endTime,question_category as questionCategory,number')
            .where({
                start_time: { '<=': date },
                delete_status: 0,
                use_status: 1,
                end_time: { '>=': date, '=': null, _logic: 'OR' },

            }).select();
    }
};