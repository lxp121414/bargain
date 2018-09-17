module.exports = class extends think.Logic {
    indexAction() {

    }

    async addBargainAction() {
        this.rules = {
            createdId: {
                required: true,
            },
            orderId: {
                required: true,
            },
            number: {
                required: true,
                int: { min: 0, max: 5 }
            },
        }
    }
};