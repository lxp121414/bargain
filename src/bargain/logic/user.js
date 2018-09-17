module.exports = class extends think.Logic {

    indexAction() {

    }

    async loginAction() {

        this.rules = {
            code: { // 活动名字
                string: true,
                required: true
            }
        }
    }

}