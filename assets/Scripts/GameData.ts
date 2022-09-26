

export class GameData {

    public static gameScore: number = 0;
    public static gameCoin: number = 0;
    public static continuousNum: number = 0;//连续命中中心
    public static BlockId: number = 0;//当前方块ID
    public static gameLevel: number = 1;

    public static canJump: boolean = false;

    public static hongbaoScore: number = 5;

    public static blocks = [0, 1, 2, 3, 4, 19];
}
