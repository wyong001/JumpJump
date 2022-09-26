
const { ccclass, property } = cc._decorator;
@ccclass
export class AudioPlay extends cc.Component {

    @property(cc.AudioClip)
    audio: cc.AudioClip = null;

    public nMusicId = -1;
    private nEffectId = -1;
    public currBackMusic: string = "";

    //实现单例
    //AudioPlay 这里没有实际的作用
    private static instance: AudioPlay = null;

    public static getInstance(): AudioPlay {
        if (!this.instance) {
            this.instance = new AudioPlay();
        }
        return this.instance;
    }

    playEffect(name: string, loop: boolean = false) {
        // 获取背景音乐资源
        window.platform.getRes(name, 'audio').then(audioClip => {
            if (audioClip)
                this.nEffectId = cc.audioEngine.playEffect(audioClip, loop);
        });

    }

    playMusic() {
        // 获取背景音乐资源
        window.platform.getRes('bgm', 'audio').then(audioClip => {
            if (audioClip)
                cc.audioEngine.playMusic(audioClip, true);
        });

    }


    setVoiceVolume(Volume) {
        console.log("setEffectsVolume---------------->", Volume);

        if (null == Volume || undefined == Volume) {
            Volume = 1;
        }

        cc.audioEngine.setMusicVolume(Volume)

        cc.sys.localStorage.setItem('VoiceValue', Volume);
    }

    setEffectsVolume(Volume) {
        console.log("setEffectsVolume---------------->", Volume);

        if (null == Volume || undefined == Volume) {
            Volume = 1;
        }

        cc.audioEngine.setEffectsVolume(Volume)

        cc.sys.localStorage.setItem('EffectValue', Volume);
    }

    pauseMusic(): void {
        cc.audioEngine.pauseMusic();
    }

    resumeMusic(): void {

        cc.audioEngine.resumeMusic();

    }

    stopMusic() {
        cc.audioEngine.stopMusic();
    }

    stopEffect(ID: number) {
        cc.audioEngine.stopEffect(ID);
    }

    stopCurrentEffect() {
        cc.audioEngine.stopEffect(this.nEffectId);
    }

    setMusicEnable(isEnable: boolean) {


        console.log("setMusicEnable", isEnable)

        if (!isEnable) {
            cc.sys.localStorage.setItem('openMusic', 0);
            cc.audioEngine.pauseMusic();
        }
        else {
            cc.sys.localStorage.setItem('openMusic', 1);
            this.setVoiceVolume(0.5)
            cc.audioEngine.resumeMusic();
        }
    }

    setEffectEnable(isEnable: boolean) {

        console.log("setEffectEnable", isEnable)
        if (!isEnable) {
            cc.sys.localStorage.setItem('openEffects', 0);
            cc.audioEngine.stopEffect(this.nEffectId);
        }
        else {
            cc.sys.localStorage.setItem('openEffects', 1);
            this.setEffectsVolume(1)
        }
    }

    //判断是否有播放背景音乐
    isPlayBackGroundMusic(): boolean {
        return cc.audioEngine.isMusicPlaying();
    }
}








