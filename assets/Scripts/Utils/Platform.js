/**
 * Cocos框架人人秀开放接口API
 * API文件是建立游戏引擎和人人秀平台游戏框架 打通数据交互提供的统一方法；
  - 分为3个部分：
  - 第一部分 游戏资源、环境接口
  - 第二部分 游戏开始、结束、提示接口
  - 第三部分 高级API接口
 */
var Platform = cc.Class({

    // 第一部分 游戏资源、环境接口


    // 属性值人人秀框架自动注入
    properties: {
        _basePath: '',  // 人人秀资源根目录
        _enviormentType: 1,     // 默认环境类型
        enviormentType_cocos: 1,    // cocos本地环境
        enviormentType_rrxiu: 2,    // 在线人人秀环境
        _pluginGameHelper: null,    // 人人秀游戏辅助对象

        // 游戏基本配色
        _gameColor: '',
        // 基本配色-相近浅色
        _gameThinColor: '',

        // 游戏皮肤资源
        _gameSkins: { 
            default: function () {
                return {
                    images: {},
                    audios: {},
                    texts: {},
                    jsons: {}
                }
            }  
        },

        _gameMode: 1,   // 关卡模式:1=无尽模式，2=关卡模式
        _gameLevel: 0,       // 游戏关卡
        _gameLevelTotal: 12, // 游戏总关卡

        _cocosResourcePath: '',     // cocos本地资源路径  assets/resources
    },

    /** 是否是人人秀 */
    isRRX () {
        return this._enviormentType == this.enviormentType_rrxiu;
    },

    /** 是否允许人人秀事件 */
    canRRXEvent() {
        if (this._isEdit) {
            return false;
        }
        return this.isRRX();
    },

     // 设置插件空间上下文
    setPluginContext(pluginContext, callback = null) {
        this.setContext(pluginContext, callback);
    },

    // 全局注入需要参数
    setContext(options) {
        this._enviormentType    = this.enviormentType_rrxiu;
        this._pluginContext     = options;
        this._basePath          = this._pluginContext._basePath;
        this._isEdit            = this._pluginContext.isEdit;
        this._api               = this._pluginContext.api;
        this._pluginGameHelper  = this._pluginContext.pluginGameHelper;

        if (this._pluginContext.gameMode) {
            this._gameMode = this._pluginContext.gameMode;    // 关卡模式
        }
        if (this._pluginContext.gameLevel) {
            this._gameLevel = this._pluginContext.gameLevel;    // 当前关卡
        }
        if (this._pluginContext.gameLevelTotal) {
            this._gameLevelTotal = this._pluginContext.gameLevelTotal;  // 总关卡
        }
    },

    getContext() {
        return this._pluginContext;
    },

    /** 获取策略游戏数据支持 */
    getGameStrategyApi() {
        return this._pluginGameHelper.strategyEvent;
    },

    /**
     * 获取游戏模式
     * @returns
     */
    getGameMode() {
        return this._gameMode;
    },
    /**
     * 获取游戏关卡
     * @returns
     */
    getGameLevel() {
        return this._gameLevel;
    },
    /**
     * 获取游戏总关卡
     * @returns
     */
    getGameLevelTotal() {
        return this._gameLevelTotal;
    },

    // 加载资源数据，统一管理
    async initPluginResource(callback = null) {
        var that = this;
        let isRRX = this.isRRX();
        console.log('是否是RRX:' + isRRX);
        await that.cocosEnviormentLoad(isRRX);
        // 互动加载图片先去掉
        if (isRRX) {
            await this.rrxiuEnviormentLoad();
        }
        
        callback && callback();
    },

    // 预加载cocos本地资源
    async cocosEnviormentLoad(isRRX) {
        console.log('开始加载Cocos资源');
        try {
            
        }
        catch (e) {
            console.error(e);
        }
    },

    // 人人秀环境加载资源
    async rrxiuEnviormentLoad() {
        var that = this;
        return new Promise(function (resolve, reject) {
            let sourceDict =  that.getGameAPI().themeDict;
            if (sourceDict) {
                that._gameSkins.texts = sourceDict.dict;
                console.log(sourceDict.courseStyle);
                that.loadGameResource(sourceDict.courseStyle, function (reSource) {
                    that._gameSkins.images = reSource;
                    that.loadGameResourceAudio(sourceDict.audioStyle, function (reSource) {
                        that._gameSkins.audios = reSource;
                        that.loadGameResourceJson(function (reJsons) {
                            that._gameSkins.jsons = reJsons;
							resolve(that._gameSkins);
							that.isLoadOver();
                            console.info('游戏皮肤_gameSkins', that._gameSkins);
                        });
                    });
                });

            } else {
                reject('解析资源失败');
            }
        });
    },

    // 加载Loading结束消失
    isLoadOver() {
        if (!this.canRRXEvent()) {
            return true;
        }
        this.getGameStrategyApi().isLoadOver();
	},

    // 获取资源文件路径
    getPluginFiles(fileName, path) {
        if (this.isRRX()) {
            return this.getContext().getFile(fileName, path);
        }
        return path + '/' + fileName;
    },

    /**
     * 加载游戏资源图片
     * @param {*} resourceList 
     * @param {*} callback 
     * @returns 
     */
    loadGameResource(resourceList, callback) {
        let sourceDict = {};
        if (!resourceList || resourceList.length == 0) {
            if (callback) callback(sourceDict);
            return;
        }

        var that = this;
        var loadIndex = 0;

        function loadResource() {
            that.getResourceImage(resourceList[loadIndex].value, function (data) {
                if (data) {
                    sourceDict[resourceList[loadIndex].key] = data;
                }
                loadIndex++;
                if (loadIndex > resourceList.length - 1) {
                    if (callback) callback(sourceDict);
                } else {
                    loadResource();
                }
            });
        }
        loadResource();
    },

    /**
     * 获取资源图片
     * @param {*} url 
     * @param {*} callback 
     */
    async getResourceImage(url, callback) {
        await this.getImage(url).then(function (texture) {
            if (callback) callback(texture);
        }).catch(function () {
            if (callback) callback();
        });
    },

    async getImage(imageUrl, suffix) {
        return new Promise(function (resolve, reject) {
            imageUrl = suffix ? imageUrl + '?v=' + suffix : imageUrl;
            cc.assetManager.loadRemote(imageUrl, { ext: '.jpg'}, function (err, texture) {
                // Use texture to create sprite frame
                if (!err) {
                    // console.log(texture, '加载远程图片资源成功');
                    resolve(texture)
                } else {
                    console.log('加载远程图片资源失败：' + err);
                    reject(err);
                }
            });
        });
    },

    /**
     * 加载游戏资源音频
     * @param {*} resourceList 
     * @param {*} callback 
     * @returns 
     */
    loadGameResourceAudio(resourceList, callback) {
        let sourceDict = {};
        if (!resourceList || resourceList.length == 0) {
            if (callback) callback(sourceDict);
            return;
        }

        var that = this;
        var loadIndex = 0;

        function loadResource() {
            that.getResourceAudio(resourceList[loadIndex].value, function (data) {
                sourceDict[resourceList[loadIndex].key] = data;
                loadIndex++;
                if (loadIndex > resourceList.length - 1) {
                    if (callback) callback(sourceDict);
                } else {
                    loadResource();
                }
            });
        }
        loadResource();
    },

    /**
     * 获取音频资源
     * @param {*} url 
     * @param {*} callback 
     */
    getResourceAudio(url, callback) {
        cc.assetManager.loadRemote(url, function (err, audioClip) {
            if (!err) {
                if (callback) callback(audioClip);
            } else {
                console.log(err, '获取音频资源失败');
            }
        });
    },

    // 加载序列帧文件，部分游戏需要加载
    loadGameResourceJson(callback) {
        let loadJons = [
            // { id: 'b_balloonSkinRun_json', src: "b_balloonSkinRun.json" },
            /*  { id: 'NewProject_tex_json', src: "NewProject_tex.json" }*/
        ];
        let jonsDict = {};
        if (!loadJons || loadJons.length == 0) {
            if (callback) {
                callback(jonsDict);

            }
            return;
        }
        var that = this;
        var loadIndex = 0;
        function loadResource() {
            let loadUrl = that.getPluginFiles(loadJons[loadIndex].src, 'resource/assets') + '?v=' + location.host;
            console.log(loadUrl);
            that.getResourceJson(loadUrl, function (data) {
                jonsDict[loadJons[loadIndex].id] = data;
                loadIndex++;
                if (loadIndex > loadJons.length - 1) {
                    if (callback) {
                        callback(jonsDict);
                    }
                } else {
                    loadResource();
                }
            });
        }
        loadResource();
    },

    /**
     * 获取资源
     * @param {*} sourceName        资源名称
     * @param {*} type              资源类型
     * @param {*} path              本地资源相对路径，path为空时默认查找路径,图片是images，音频是audios
     * @returns                     Cocos资源对象
     */
    async getRes(sourceName, type = 'image', path = '') {
        let self = this;
        if (this.isRRX()) {
            return new Promise(function (resolve, reject) {
                resolve(self.getGameSkins(sourceName, type));
            })
        }

        return new Promise(function (resolve, reject) {
            switch (type) {
                case 'image':
                    if (path == '') path = 'images';
                    cc.resources.load(path + '/' + sourceName, function (err, texture) {
                        console.log('加载本地图片资源: ' + sourceName);
                        if (!err) {
                            console.log(texture, '加载本地图片资源成功');
                            resolve(texture)
                        } else {
                            console.log('加载本地图片资源失败：' + err);
                            reject(err);
                        }
                    });
                    break;
                case 'audio':
                    if (path == '') path = 'audios';
                    cc.resources.load(path + '/' + sourceName, function (err, resource) {
                        console.log('加载本地音频资源: ' + sourceName);
                        if (!err) {
                            console.log(resource, '加载本地音频资源成功');
                            resolve(resource)
                        } else {
                            console.log('加载本地音频资源失败：' + err);
                            reject(err);
                        }
                    });
                    break;
            }
        });
    },

    // 获取游戏资源配置 key:,type: ‘image/audio/text’
    getGameSkins(name, type = 'image') {
        if (this._gameSkins) {
            switch (type) {
                case 'image': {
                    if (this._gameSkins.images && this._gameSkins.images[name]) {
                        return this._gameSkins.images[name];
                    }
                    break;
                }
                case 'audio': {
                    if (this._gameSkins.audios && this._gameSkins.audios[name]) {
                        return this._gameSkins.audios[name];
                    }
                    break;
                }
                case 'text': {
                    var themeName = 'skinPage';
                    if (this._gameSkins.texts ) {
                        if (name) {
                            return this._gameSkins.texts[name];
                        }
                    }
                    break;
                }
                case 'json': {
                    if (this._gameSkins.jsons && this._gameSkins.jsons[name]) {
                        return this._gameSkins.jsons[name];
                    }
                    break;
                }
            }
        }
        return null;
    },

    /**
     * 获取游戏基本配色
     */
     getColor() {
        if (!this._gameColor) {
            if (this.isRRX()) {
                this._gameColor = this.getGamePageApi().getBasicColor();
                this._gameColor = GameUtils.color2Num(this._gameColor)
            } else {
                this._gameColor = '#d16b1e';
                this._gameColor = GameUtils.color2Num(this._gameColor)
            }
        }
        return this._gameColor;
    },

    /**
     * 获取默认游戏配色
     */
     getThinColor() {
        if (!this._gameThinColor) {
            this._gameThinColor = GameUtils.color2Shade(this.getColor(), 0.4);
        }
        return this._gameThinColor;
    },

    /*
    * 获得线的颜色
    */
    getWireColor() {
        let wireColor = "#8fd6ff";
        if (this.isRRX()) {
            let textKey = "tx_wire";
            var textData = this.getGameSkins(textKey, 'text');
            // console.log(textData);
            wireColor = textData.color;

        }
        wireColor = GameUtils.color2Num(wireColor);
        return wireColor
    },


    // 第二部分 游戏开始、结束、提示接口

    startGame() {
        window.gameUtil.setGameStart(true);
    },

    /**
     * 提交游戏分数
     * @param {*} gameScore 游戏分数
     * @param {*} gameGrade 游戏评星
     * @returns             Cocos本地环境返回true,  本地处理提交后逻辑
     */
    submitGameScore(gameScore, gameGrade = 0) {
        console.log('提交分数:' + gameScore + ', 游戏评星:' + gameGrade);
        if (!this.isRRX()) {
            console.log('这是Cocos本地环境，请自行随便处理提交分数逻辑');
            if (this.gameMode == 2) {
                this.gameLevel++;
                console.log('这是闯关模式，提交分数后进入下一关' + this.gameLevel);
            }
            return true;
        }
        this.getGameStrategyApi().addScore(gameScore, gameGrade);
	},

    showMsg(msg) {
        if (this.canMiniEvent()) {
            this.getGamePageApi().infoMsg(msg);
        } else {
            alert(msg);
        }
    },

    // 第三部分 高级API接口

    // 获取插件游戏API辅助接口
    getGameAPI() {
        return this._pluginGameHelper;
    },
});

console.log('开始挂载window.Platform');
window.platform = new Platform();