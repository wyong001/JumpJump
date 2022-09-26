const { ccclass, property } = cc._decorator;

@ccclass
export default class BlockItem extends cc.Component {

    private mid: cc.Node = null;

    private up: cc.Node = null;

    private down: cc.Node = null;

    private left: cc.Node = null;

    private right: cc.Node = null;

    start() {
        this.mid = this.node.getChildByName('mid');
        this.up = this.node.getChildByName('up');
        this.down = this.node.getChildByName('down');
        this.left = this.node.getChildByName('left');
        this.right = this.node.getChildByName('right');

        this.mid.opacity = 0;
        this.up.opacity = 0;
        this.down.opacity = 0;
        this.left.opacity = 0;
        this.right.opacity = 0;
    }

    is_jump_on_block(w_dst_pos, direction) {
        //1.找到了跳跃的位置距离参考点最近的哪个参考点以及位置
        var mid_pos = this.mid.convertToWorldSpaceAR(cc.v2(0.0));
        //目标减去mid原点的距离
        var dir = w_dst_pos.sub(mid_pos);
        //最近的点,算出这个距离的长度
        var min_len = dir.mag();
        var min_pos = mid_pos;
        if (direction === 1) {//如果往右边跳
            var up_pos = this.up.convertToWorldSpaceAR(cc.v2(0, 0));
            //返回两个向量
            dir = w_dst_pos.sub(up_pos);
            //返回指定向量的长度
            var len = dir.mag();
            if (min_len > len) {
                min_len = len;
                min_pos = up_pos;
            }
            var down_pos = this.down.convertToWorldSpaceAR(cc.v2(0, 0));
            //返回两个向量
            dir = w_dst_pos.sub(down_pos);
            //返回指定向量的长度
            var len = dir.mag();
            if (min_len > len) {
                min_len = len;
                min_pos = down_pos;
            }
        } else {
            var left_pos = this.left.convertToWorldSpaceAR(cc.v2(0, 0));
            //返回两个向量
            dir = w_dst_pos.sub(left_pos);
            //返回指定向量的长度
            var len = dir.mag();
            if (min_len > len) {
                min_len = len;
                min_pos = left_pos;
            }
            var right_pos = this.right.convertToWorldSpaceAR(cc.v2(0, 0));
            //返回两个向量
            dir = w_dst_pos.sub(right_pos);
            //返回指定向量的长度
            var len = dir.mag();
            if (min_len > len) {
                min_len = len;
                min_pos = right_pos;
            }
        }

        dir = w_dst_pos.sub(min_pos);
        //2.如果两个点之间的距离小于50，则表示这次跳跃是有效的
        if (dir.mag() < 50) {
            w_dst_pos.x = min_pos.x;
            w_dst_pos.y = min_pos.y;
            return true;
        }
        //否则啥也不改
        return false;
    }

    isJumpMid(w_dst_pos) {
        //1.找到了跳跃的位置距离参考点最近的哪个参考点以及位置
        var mid_pos = this.mid.convertToWorldSpaceAR(cc.v2(0.0));
        //目标减去mid原点的距离
        var dir = w_dst_pos.sub(mid_pos);
        if (dir.mag() < 10) {
            cc.log("MIDMID", dir.mag());
            return true;
        }
        //否则啥也不改
        return false;
    }
}
