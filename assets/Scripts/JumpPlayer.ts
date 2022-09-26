import { AudioPlay } from "./AudioPlay";
import BlockItem from "./BlockItem";
import { GameData } from "./GameData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class JumpPlayer extends cc.Component {

    @property
    private init_speed: number = 500;

    @property
    private a_power: number = 600;

    @property
    private y_radio: number = 0.5560472;

    public GameManager = null;

    private next_block = null;

    private cur_block = null;

    //默认向右
    public direction = 1;

    private rot_node: cc.Node = null;

    private anim_node: cc.Node = null;

    private is_power_mode: boolean = false;

    private speed: number = 0;

    private x_distance: number = 0;

    start() {
        var self = this;
        this.rot_node = this.node.getChildByName('rotate');
        this.anim_node = this.rot_node.getChildByName('anim');
        this.is_power_mode = false;
        this.speed = 0;
        this.x_distance = 0;

        this.GameManager.touchArea.on(cc.Node.EventType.TOUCH_START, function (e) {
            if (!GameData.canJump) return;
            this.is_power_mode = true;
            this.initSpeed();
            window.platform.getRes("player2").then(texture => {
                var spriteFrame = new cc.SpriteFrame(texture);
                cc.log(spriteFrame)
                self.anim_node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            });

            this.anim_node.stopAllActions();
            this.anim_node.runAction(cc.moveBy(2, 0, -30))
            if (this.direction == 1) {
                this.anim_node.runAction(cc.scaleTo(2, 1, 0.6));
            } else {
                this.anim_node.runAction(cc.scaleTo(2, -1, 0.6))
            }
            AudioPlay.getInstance().playEffect("StoreEnergy", true);
            this.cur_block.getChildByName("icon").runAction(cc.scaleTo(2, 1, 0.7));
            cc.log("cur_block11:" + this.cur_block.name);
        }.bind(this), this);

        this.GameManager.touchArea.on(cc.Node.EventType.TOUCH_END, function (e) {
            if (!GameData.canJump) return;
            //加力结束
            this.is_power_mode = false;
            this.anim_node.stopAllActions();
            this.anim_node.y = 0;
            if (this.direction == 1) {
                this.anim_node.runAction(cc.scaleTo(0.5, 1, 1))
            } else {
                this.anim_node.runAction(cc.scaleTo(0.5, -1, 1))
            }

            this.cur_block.getChildByName("icon").stopAllActions();
            cc.tween(this.cur_block.getChildByName("icon"))
                .to(.3, { scaleY: 1 }, { easing: "bounceOut" })
                .start();
            this.player_jump();
            cc.audioEngine.stopAllEffects();
        }.bind(this), this);

        this.GameManager.touchArea.on(cc.Node.EventType.TOUCH_CANCEL, function (e) {
            if (!GameData.canJump) return;
            this.is_power_mode = false;
            this.anim_node.stopAllActions();
            this.anim_node.y = 0;
            if (this.direction == 1) {
                this.anim_node.runAction(cc.scaleTo(0.5, 1, 1))
            } else {
                this.anim_node.runAction(cc.scaleTo(0.5, -1, 1))
            }
            this.cur_block.getChildByName("icon").stopAllActions();
            cc.tween(this.cur_block.getChildByName("icon"))
                .to(.3, { scaleY: 1 }, { easing: "backOut" })
                .start();
            this.player_jump();
            cc.audioEngine.stopAllEffects();
        }.bind(this), this);
    }

    initSpeed() {
        this.x_distance = 0;
        this.speed = this.init_speed;
    }

    update(dt) {
        if (this.is_power_mode) {

            this.speed += (this.a_power * dt);

            this.x_distance += this.speed * dt;
        }
    }

    player_jump() {
        if (!GameData.canJump) return;
        var self = this;
        GameData.canJump = false;
        var x_distance = this.x_distance * this.direction;
        var y_distance = this.x_distance * this.y_radio;
        this.GameManager.player.getComponent(cc.MotionStreak).enabled = true;
        //跳到目的地
        var target_pos = this.node.getPosition();
        target_pos.x += x_distance;
        target_pos.y += y_distance;
        // cc.tween(this.rot_node)
        //     .by(0.5, { angle: -270 * this.direction })
        //     .call(() => {
        //         this.rot_node.angle = -360 * this.direction;
        //     })
        //     .start();
        // this.rot_node.runAction(cc.rotateBy(0.5, 360 * this.direction))
        var w_pos = this.node.parent.convertToWorldSpaceAR(target_pos);
        var is_game_over = false;
        let jumpCurBlock = false;
        if (this.cur_block.getComponent(BlockItem).is_jump_on_block(w_pos, this.direction)) {
            jumpCurBlock = true;
        }
        if (this.next_block.is_jump_on_block(w_pos, this.direction) || jumpCurBlock) {
            target_pos = this.node.parent.convertToNodeSpaceAR(w_pos);
        } else {
            is_game_over = true;
        }

        var j = cc.jumpTo(0.5, target_pos, 100, 1);
        var olddirection = this.direction;
        //随机产生一个方向
        if (!jumpCurBlock)
            this.direction = (Math.random() < 0.5) ? -1 : 1;

        var end_func = cc.callFunc(function () {
            this.initSpeed();
            //如果游戏结束
            if (is_game_over) {
                let end_func = () => {
                }
                let distance = 50;
                this.node.stopAllActions();
                cc.tween(this.node)
                    .by(0.25, { position: cc.v2(olddirection * distance, -20) })
                    .call(() => {
                        window.platform.getRes("player4").then(texture => {
                            var spriteFrame = new cc.SpriteFrame(texture);
                            self.anim_node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                            cc.log("回调1")
                        });
                    })
                    .by(0.2, { position: cc.v2(olddirection * distance, -20) })
                    .call(() => {
                        window.platform.getRes("player5").then(texture => {
                            var spriteFrame = new cc.SpriteFrame(texture);
                            self.anim_node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                            cc.log("回调2")
                        });
                    })
                    .by(0.2, { position: cc.v2(olddirection * distance, -20) })
                    .call(() => {
                        window.platform.getRes("player6").then(texture => {
                            var spriteFrame = new cc.SpriteFrame(texture);
                            self.anim_node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                            cc.log("回调3")
                            self.GameManager.on_checkout_game();
                        });

                    })
                    .start();
            } else {
                window.platform.getRes("player").then(texture => {
                    var spriteFrame = new cc.SpriteFrame(texture);
                    self.anim_node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                });
                let getScore = 1;
                if (!jumpCurBlock) {
                    if (GameData.BlockId == 19 || this.next_block.isJumpMid(w_pos)) {
                        AudioPlay.getInstance().playEffect("Center&Gold", false);
                    } else {
                        AudioPlay.getInstance().playEffect("JumpSuccess", false);
                    }
                    //跳到中心动效
                    if (this.next_block.isJumpMid(w_pos)) {
                        GameData.continuousNum++;
                        getScore = GameData.continuousNum * 2;
                        cc.tween(this.anim_node.children[0])
                            .to(.7, { opacity: 120, scale: 1 })
                            .call(() => {
                                this.anim_node.children[0].scale = 0;
                                this.anim_node.children[0].opacity = 255;
                            })
                            .start();
                        cc.tween(this.anim_node.children[1])
                            .delay(0.3)
                            .to(.9, { opacity: 120, scale: 1 })
                            .call(() => {
                                this.anim_node.children[1].scale = 0;
                                this.anim_node.children[1].opacity = 255;
                            })
                            .start();
                    } else {
                        GameData.continuousNum = 0;
                    }
                    if (GameData.BlockId == 19) {
                        GameData.gameCoin += 1;
                        getScore = GameData.hongbaoScore;
                        this.GameManager.coin.opacity = 0;
                    }

                    GameData.gameScore += getScore;
                    this.rot_node.getChildByName("getScore").opacity = 255;
                    this.rot_node.getChildByName("getScore").getComponent(cc.Label).string = "+" + getScore;
                    cc.tween(this.rot_node.getChildByName("getScore"))
                        .to(.5, { y: 200 })
                        .to(.5, { opacity: 0 })
                        .call(() => {
                            this.rot_node.getChildByName("getScore").y = 50;
                        })
                        .start();

                    if (this.direction === -1) {
                        this.GameManager.move_map(580 - w_pos.x, -y_distance);
                        cc.log("移动：", 580 - w_pos.x, -y_distance)
                    } else {
                        this.GameManager.move_map(180 - w_pos.x, -y_distance);
                        cc.log("移动：", 180 - w_pos.x, -y_distance)
                    }
                } else {
                    GameData.canJump = true;
                }

                this.GameManager.player.getComponent(cc.MotionStreak).reset();
                this.GameManager.player.getComponent(cc.MotionStreak).enabled = false;
                this.anim_node.scaleX = this.direction;
            }

        }.bind(this));
        //执行完j以后执行end_func,sequence表示队列
        AudioPlay.getInstance().playEffect("Jump", false);
        var seq = cc.sequence(j, end_func);
        this.node.runAction(seq);
        window.platform.getRes("player3").then(texture => {
            var spriteFrame = new cc.SpriteFrame(texture);
            cc.log(spriteFrame)
            self.anim_node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        });
    }

    set_next_block(block) {
        this.next_block = block;
    }

    set_cur_block(block) {
        this.cur_block = block;
    }
}