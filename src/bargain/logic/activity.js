module.exports = class extends think.Logic {
    indexAction() {

    }
    async addAction() {
        // var data = this.post();
        // if (think.isEmpty(data)) { // 若是一个空对象 先返回 false           
        //     return this.fail();
        // }

        let rules = {
            activityName: { // 活动名字
                string: true,
                required: true,
            },
            createdBy: { // 创建人
                string: true,
                required: true,
            },
            startTime: { // 活动开始时间
                required: true,
            },
            details: {
                string: true,
                required: true,
            }
        }
        let flag = this.validate(rules);

        if (!flag) {
            return this.fail(this.config('validateDefaultErrno'), this.validateErrors);
        }
    }

    // 上架 下架 
    async updateUseAction() {
        this.rules = {
            useStatus: {
                required: true,
                int: { min: 0, max: 1 }
            },
            activityId: {
                required: true
            }

        }
    }

    // 修改 删除  传入 修改的 字段与值
    async updateActivityAction() {
        this.rules = {
            activityId: {
                required: true
            }
        }
    }

    // 获取  在当前时间的活动(不需要传参)
    async getActivityAction() {

    }
};