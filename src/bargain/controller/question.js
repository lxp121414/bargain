const Base = require('./base.js');
var question = think.model('question');
var dateUtil = require('../util/dateUtil');

module.exports = class extends Base {
    indexAction() {
        return this.display();
    }


    // 题目 导入
    async addQuestionAction() {
        //         var questions = `
        //          1,1,市场上家装公司通常宣传的“免费设计”是指？？,3,2,4,
        //          2,1,汽车电影,速度与激情系列出了几部电影？,8,7,9,
        //          3,1,汽车电影,电影《速度与激情》的男星保罗·沃克哪一年出车祸身亡？,2013,2012,2011

        // `;

        var questions = `         
1,1,市场上家装公司通常宣传的“免费设计”是指？,平面布置图,效果图,施工图,
2,1,能够直接在网上计算签约价的家装平台是？,LE家居顾问网,土巴兔,齐家网,
3,1,花纹比较真实，质感比较强的瓷砖品种是？,大理石通体砖,全抛釉砖,抛光砖,
4,1,家中灯光的舒适度与下面哪项最相关？,色温,灯具品牌,流明,
5,1,相比较，容易变形的板材是？,多层板,密度板,复合原木板,
6,1,通常说的“E0”级环保标准指的是哪种物质？,甲醛,氨,苯,
7,1,卫生间墙面防水通常要做到多高？,1.8米,1.5米,2米,
8,1,以下哪种材料有金属元素放射性的风险？,大理石,石英石,亚克力,
9,1,以下哪种面积是数值最小的？,使用面积,建筑面积,室内面积,
10,1,同款产品情况下，哪种衣柜更贵？,开门衣柜,推拉门衣柜,"",
11,1,哪种衣柜板材能真正做到“健康无异味”？,竹香板,实木板,实木颗粒板,
12,1,哪种吊顶材料更能避免顶部油漆开裂？,轻钢龙骨吊顶,木方吊顶,"",
13,1,以下哪个品牌不是全屋定制品牌？,世友,欧派,索菲亚,
14,1,通常安装哪种地板不需要地面找平？,实木地板,强化地板,多层复合地板,
15,1,瓷砖的产地最好的是？,广东,江西,山东,
16,1,以下不属于油漆工艺的一项是？,高光,水性漆,混油,
17,1,以下哪一项不属于家装“半包”范围？,提供瓷砖,砌墙,水电施工,
18,1,以下哪个不是水管的品牌？,伟星,爱康保利,泰山,
19,1,家装设计服务通常不包括?,施工监理,施工现场对接,主材选购陪同,
20,1,全屋定制品牌“0元出效果图”的最大缺点：,缺乏现场施工对接经验,以销售柜子为目的,出图速度太慢
`;

        var qlist = questions.split(",");
        var date = dateUtil.addHours().getTime();

        for (var i = 0; i < qlist.length;) {
            var data = {
                title: qlist[i + 2],
                answers1: qlist[i + 3],
                answers2: qlist[i + 4],
                answers3: qlist[i + 5],
                created_time: date
            }
            await question.add(data);
            i = i + 6;
        }
        return this.success();
    }

    // 获取 题目 (随机获取5题)
    async getQuestionAction() {
        var category = this.post('category');
        var result = []

        if (think.isEmpty(category)) {
            result = await question.order('RAND()').limit(5).select();
        } else {
            result = await question.where({ category: category }).order('RAND()').limit(5).select();
        }


        for (let index = 0; index < result.length; index++) {
            result[index].question = [result[index].answers1, result[index].answers2, result[index].answers3];
        }

        return this.success(result);
    }
};