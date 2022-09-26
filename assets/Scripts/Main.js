// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },

        audio: {
            default: null,
            type: cc.AudioClip
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var self = this;
        console.log(window.platform);
        // 原Cocos加载资源
        /* 
        cc.resources.load('images/b_bg', function (err, texture) {
            if (!err) {
                var spriteFrame = new cc.SpriteFrame(texture);
                self.node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            }
        });
        */
        // 人人秀框架加载资源
        window.platform.getRes('b_bg').then(texture => {
            var spriteFrame = new cc.SpriteFrame(texture);
            self.node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        });

        // 获取子组件
        let gameIntroNode = self.node.getChildByName('gameIntro');
        console.log(gameIntroNode);
        let richText = gameIntroNode.getComponent(cc.RichText);
        richText.string = '123456789';

         // 获取背景音乐资源
         window.platform.getRes('s_click', 'audio').then(audioClip => {
            this.audio = audioClip
        });
        
        this.addAudioClickEventHandler();       // 添加播放音频按钮事件
        this.addGameOverClickEventHandler();    // 提交分数结束游戏按钮
    },

    start () {
        
    },

    addAudioClickEventHandler() {
        let self = this;
        // 添加播放音频按钮事件
        this.node.getChildByName('PlayAudioBtn').on('click', function() {
            cc.audioEngine.play(this.audio, false, 1);
        }, this);
    },

    addGameOverClickEventHandler() {
        let self = this;
        // 提交分数结束游戏按钮
        this.node.getChildByName('GameOverBtn').on('click', function() {
            window.platform.submitGameScore(100, 1);
        }, this);
    },

    // update (dt) {},
});
