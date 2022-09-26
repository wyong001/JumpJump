import BlockItem from "./BlockItem";
import { GameData } from "./GameData";
import JumpPlayer from "./JumpPlayer";

const { ccclass, property } = cc._decorator;

declare global {
    interface Window {
        platform: any;
    }
}

@ccclass
export default class GameManager extends cc.Component {

    @property(cc.Node)
    player: cc.Node = null;

    @property(cc.Node)
    anim: cc.Node = null;

    @property(cc.Node)
    coin: cc.Node = null;

    @property(cc.Node)
    block_root: cc.Node = null;

    @property(cc.Vec2)
    left_org: cc.Vec2 = cc.v2(0, 0);

    @property(cc.Node)
    map_root: cc.Node = null;

    @property(cc.Node)
    touchArea: cc.Node = null;

    @property(cc.Node)
    bg_mask: cc.Node = null;

    @property
    y_radio: number = 0.5560472;

    @property(cc.Node)
    checkout: cc.Node = null;

    @property(cc.Label)
    totalScore: cc.Label = null;

    private cur_block: cc.Node = null;

    private next_block: cc.Node = null;

    private playerCom: JumpPlayer = null;

    private block_zorder: number = -1;

    private y_distance: number = 0;

    private block_prefab: cc.Node[] = [];

    start() {
        let self = this;
        this.initData();
        window.platform.getRes('bg').then(texture => {
            var spriteFrame = new cc.SpriteFrame(texture);
            self.node.getChildByName('bg').getComponent(cc.Sprite).spriteFrame = spriteFrame;
            self.bg_mask.active = false;
        });

        window.platform.getRes('player').then(texture => {
            var spriteFrame = new cc.SpriteFrame(texture);
            self.anim.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        });

        window.platform.getRes('mid_action').then(texture => {
            var spriteFrame = new cc.SpriteFrame(texture);
            self.anim.children[0].getComponent(cc.Sprite).spriteFrame = spriteFrame;
            self.anim.children[1].getComponent(cc.Sprite).spriteFrame = spriteFrame;
        });

        //获取游戏模式1.无尽模式，2.关卡模式
        window.platform.getGameMode();
        //获取游戏关卡
        window.platform.getGameLevel();
        //获取游戏总关卡
        window.platform.getGameLevelTotal();


        let blockArea = this.node.getChildByName('blocks');
        for (let i = 0; i < blockArea.children.length; i++) {
            this.block_prefab.push(blockArea.children[i]);
        }

        let randomID = this.getRandomValueFromArray(GameData.blocks);
        if (randomID == 19) { randomID = 4 }
        this.cur_block = cc.instantiate(this.block_prefab[randomID]);

        window.platform.getRes(1 + randomID + "").then(texture => {
            var spriteFrame = new cc.SpriteFrame(texture);
            cc.log(spriteFrame)
            self.cur_block.children[0].getComponent(cc.Sprite).spriteFrame = spriteFrame;
        });

        GameData.BlockId = randomID;
        this.block_root.addChild(this.cur_block);
        this.cur_block.active = true;

        //把这个世界坐标转到以block_root为原点节点的坐标系下
        this.cur_block.setPosition(this.block_root.convertToNodeSpaceAR(this.left_org));
        //块上面中心点的世界坐标
        var w_pos = this.cur_block.getChildByName("mid").convertToWorldSpaceAR(cc.v2(0, 0));
        //让player出现在第一个块的正中央
        let player_pos = this.map_root.convertToNodeSpaceAR(w_pos);
        this.player.position = cc.v2(player_pos.x, player_pos.y + 200);
        this.player.getComponent(cc.MotionStreak).enabled = false;
        cc.tween(this.player)
            .to(0.1, { opacity: 255 })
            .to(0.5, { y: player_pos.y }, { easing: "bounceOut" })
            .call(() => {
                this.player.getComponent(cc.MotionStreak).enabled = true;
            })
            .start();
        //下一个等于当前的这个块
        this.next_block = this.cur_block;
        //player这个组件
        this.playerCom = this.player.getComponent(JumpPlayer);

        this.playerCom.GameManager = this;
        this.playerCom.set_cur_block(this.cur_block);
        this.add_block(true)
    }

    initData() {
        GameData.gameScore = 0;
        GameData.continuousNum = 0;
        GameData.blocks = [0, 1, 2, 3, 4, 19];
        GameData.gameCoin = 0;
        cc.resources.preloadDir('images', function (err, assets) {
            cc.log("preloadDir");
            if (!err) {
                cc.log('图片资源预加载完成')
            }
        });
    }

    getCurrentBlocks() {
        let scoreArea = 5;
        //没有规律 直接展开
        if (GameData.gameScore >= 300) {
            scoreArea = 20;
        } else if (GameData.gameScore >= 255) {
            scoreArea = 19;
        } else if (GameData.gameScore >= 215) {
            scoreArea = 18;
        } else if (GameData.gameScore >= 185) {
            scoreArea = 17;
        } else if (GameData.gameScore >= 155) {
            scoreArea = 16;
        } else if (GameData.gameScore >= 130) {
            scoreArea = 15;
        } else if (GameData.gameScore >= 105) {
            scoreArea = 14;
        } else if (GameData.gameScore >= 85) {
            scoreArea = 13;
        } else if (GameData.gameScore >= 65) {
            scoreArea = 12;
        } else if (GameData.gameScore >= 50) {
            scoreArea = 11;
        } else if (GameData.gameScore >= 35) {
            scoreArea = 10;
        } else if (GameData.gameScore >= 25) {
            scoreArea = 9;
        } else if (GameData.gameScore >= 20) {
            scoreArea = 8;
        } else if (GameData.gameScore >= 15) {
            scoreArea = 7;
        } else if (GameData.gameScore >= 10) {
            scoreArea = 6;
        }
        scoreArea = Math.min(scoreArea, 20);
        if (GameData.blocks.length >= scoreArea) {
            return GameData.blocks;
        } else {
            GameData.blocks.push(scoreArea - 2);
            return [scoreArea - 2];
        }
    }

    add_block(isfirst) {
        let self = this;
        this.cur_block = this.next_block;
        this.playerCom.set_cur_block(this.cur_block);
        let cur_blockArea = this.getCurrentBlocks().concat();
        if (cur_blockArea.length > 1) {
            cur_blockArea.splice(cur_blockArea.indexOf(GameData.BlockId), 1);
        }
        let randomID = this.getRandomValueFromArray(cur_blockArea);
        cc.log('当前Block:', randomID);
        this.next_block = cc.instantiate(this.block_prefab[Math.floor(randomID)]);
        this.next_block.opacity = 0;
        GameData.BlockId = randomID;
        window.platform.getRes(1 + randomID + "").then(texture => {
            var spriteFrame = new cc.SpriteFrame(texture);
            self.next_block.children[0].getComponent(cc.Sprite).spriteFrame = spriteFrame;
        });
        this.next_block.active = true;
        this.block_root.addChild(this.next_block);
        this.next_block.zIndex = this.block_zorder;
        this.block_zorder--;
        //随机生成一个x的范围250到450之间
        var x_distance = 250 + Math.random() * 200;
        var y_distance = x_distance * this.y_radio;
        this.y_distance = y_distance;

        var next_pos = this.cur_block.getPosition();
        //往左边x就减，往右边x就加
        next_pos.x += (x_distance * this.playerCom.direction);
        next_pos.y += y_distance;
        if (!isfirst) {
            this.next_block.position = cc.v2(next_pos.x, next_pos.y + 200);
            this.next_block.stopAllActions();
            cc.tween(this.next_block)
                .to(0.1, { opacity: 255 })
                .to(0.5, { y: next_pos.y }, { easing: "bounceOut" })
                .call(() => {
                    if (GameData.BlockId == 19) {
                        var w_pos = this.next_block.getChildByName("mid").convertToWorldSpaceAR(cc.v2(0, 0));
                        window.platform.getRes("coin").then(texture => {
                            var spriteFrame = new cc.SpriteFrame(texture);
                            self.coin.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                        });
                        this.coin.position = this.map_root.convertToNodeSpaceAR(w_pos);
                        this.coin.y += 20;
                        cc.log(this.coin.x, this.coin.y);
                        this.coin.opacity = 255;
                    }
                })
                .start();
        } else {
            this.next_block.opacity = 255;
            this.next_block.position = cc.v2(next_pos.x, next_pos.y);
            if (GameData.BlockId == 19) {
                var w_pos = this.next_block.getChildByName("mid").convertToWorldSpaceAR(cc.v2(0, 0));
                window.platform.getRes("coin").then(texture => {
                    var spriteFrame = new cc.SpriteFrame(texture);
                    self.coin.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                });
                this.coin.position = this.map_root.convertToNodeSpaceAR(w_pos);
                cc.log(this.coin.x, this.coin.y);
                this.coin.opacity = 255;
            }
        }

        GameData.canJump = true;

        this.playerCom.set_next_block(this.next_block.getComponent(BlockItem));
    }

    move_map(offset_x, offset_y) {
        cc.log("屏幕平移", this.y_distance, -offset_y);
        var m1 = cc.moveBy(0.3, offset_x, -this.y_distance);
        var end_func = cc.callFunc(function () {
            this.add_block(false);
        }.bind(this));
        var seq = cc.sequence([m1, end_func]);
        this.map_root.runAction(seq);
        this.totalScore.string = GameData.gameScore + "";
    }

    on_checkout_game() {

        // this.checkout.active = true;
        let result = window.platform.submitGameScore(GameData.gameScore, 1);
        if (result) {
            this.initData();
            cc.director.loadScene('gameScene');
        }
    }

    on_game_again() {
        let result = window.platform.submitGameScore(GameData.gameScore, 1);
        if (result) {
            this.initData();
            cc.director.loadScene('gameScene');
        }
    }

    /**
     * 从一个数组中随机取得其中一个元素
     * @param targetArray 随机数组
     */
    public getRandomValueFromArray(targetArray: Array<any>): any {
        if (targetArray == null || targetArray.length <= 0) {
            return null;
        }
        let length = targetArray.length;
        let random = Math.random();
        let index = Math.floor(random * length);
        return targetArray[index];
    }

}
