var dateutil = require('./dateUtil');

//驼峰转换

// activity
function activity(data) {
    var activity = {
        // update_time: data.updateTime,
        // start_time: data.startTime,
        // end_time: data.endTime,
        // use_status: data.useStatus,
        // delete_status: data.deleteStatus,
        // question_category: data.questionCategory
    }

    if (!think.isEmpty(data.activityId)) {
        activity.activity_id = data.activityId;
    }

    if (!think.isEmpty(data.activityName)) {
        activity.activity_name = data.activityName;
    }

    if (!think.isEmpty(data.details)) {
        activity.details = data.details;
    }

    if (!think.isEmpty(data.createdBy)) {
        activity.created_by = data.createdBy;
    }

    if (!think.isEmpty(data.startTime)) {
        activity.start_time = data.startTime;
    }

    if (!think.isEmpty(data.startTime)) {
        activity.end_time = data.startTime;
    }

    if (!think.isEmpty(data.endTime)) {
        activity.activity_name = data.endTime;
    }

    if (!think.isEmpty(data.useStatus)) {
        activity.use_status = data.useStatus;
    }

    if (!think.isEmpty(data.deleteStatus)) {
        activity.delete_status = data.deleteStatus;
    }

    if (!think.isEmpty(data.questionCategory)) {
        activity.question_category = data.questionCategory;
    }

    activity.update_time = dateutil.addHours().getTime(); // 添加数据库当前时间

    return activity;
}

// product
function product(data) {
    var product = {}

    if (!think.isEmpty(data.productId)) {
        product.product_id = data.productId;
    }

    if (!think.isEmpty(data.name)) {
        product.name = data.name;
    }

    if (!think.isEmpty(data.image)) {
        product.image = data.image;
    }

    if (!think.isEmpty(data.description)) {
        product.description = data.description;
    }

    if (!think.isEmpty(data.price)) {
        product.price = data.price;
    }

    if (!think.isEmpty(data.handsel)) {
        product.handsel = data.handsel;
    }

    if (!think.isEmpty(data.minPrice)) {
        product.min_price = data.minPrice;
    }

    if (!think.isEmpty(data.stock)) {
        product.stock = data.stock;
    }

    if (!think.isEmpty(data.markDown)) {
        product.mark_down = data.markDown;
    }


    if (!think.isEmpty(data.activityId)) {
        product.activity_id = data.activityId;
    }

    if (!think.isEmpty(data.deleteStatus)) {
        product.delete_status = data.deleteStatus;
    }

    product.update_time = dateutil.addHours().getTime();

    return product;
}

module.exports.activity = activity;
module.exports.product = product;