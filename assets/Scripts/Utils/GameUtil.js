// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

var GameUtil = cc.Class({
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
        _isGameStart: false,    // 游戏开始标志
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    // update (dt) {},

    /**
     * 设置游戏开始标志
     * @param {boolean} isStart 
     */
    setGameStart(isStart) {
        this._isGameStart = isStart;
    },

    /**
     * 颜色转换成数字
     * @param {*} color 
     * @returns 
     */
    color2Num(color) {
        var that = color;
		var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;

		if (/^(rgb\(|RGB\()/.test(that)) {
			var aColor = that.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
			var strHex = "0x";
			for (var i = 0; i < aColor.length; i++) {
				var hex = Number(aColor[i]).toString(16);
				if (hex === "0") {
					hex += hex;
				}
				strHex += hex;
			}
			if (strHex.length !== 7 + 1) {
				strHex = that;
			}
			return strHex;
		} else if (reg.test(that)) {
			var aNum = that.replace(/#/, "").split("");
			if (aNum.length === 6) {
				that = that.replace(/#/, "0x");
				return that;
			} else if (aNum.length === 3) {
				var numHex = "0x";
				for (var i = 0; i < aNum.length; i += 1) {
					numHex += (aNum[i] + aNum[i]);
				}
				return numHex;
			}
		} else if (/^(rgba\(|RGBA\()/.test(that)) {
			var aColor = that.replace(/(?:\(|\)|rgba|RGBA)*/g, "").split(",");
			var strHex = "0x";
			for (var i = 0; i < aColor.length - 1; i++) {
				var hex = Number(aColor[i]).toString(16);
				if (hex === "0") {
					hex += hex;
				}
				strHex += hex;
			}

			return strHex;

		} else {
			return that;
		}
    },

    /**
     * 颜色转换
     * @param {*} color 
     * @param {*} percent 
     * @returns 
     */
	color2Shade(color, percent) {
		if (color.length > 7) return shadeRGBColor(color, percent);
		else return shadeColor2(color, percent);

		function shadeColor2(color, percent) {
			var f = parseInt(color.slice(1), 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = f >> 16, G = f >> 8 & 0x00FF, B = f & 0x0000FF;
			return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
		}
		function shadeRGBColor(color, percent) {
			var f = color.split(","), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = parseInt(f[0].slice(4)), G = parseInt(f[1]), B = parseInt(f[2]);
			return "rgb(" + (Math.round((t - R) * p) + R) + "," + (Math.round((t - G) * p) + G) + "," + (Math.round((t - B) * p) + B) + ")";
		}
	}
});

console.log('开始挂载window.gameUtil');
window.gameUtil = new GameUtil();
