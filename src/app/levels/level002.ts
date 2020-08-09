import { LevelSetup } from "../grid/levelSetupType";
import { CellType } from "../grid/cellType";
import { Pawn } from "../pawns/pawn";
import { Soldier } from "../pawns/soldier";
import { Archer } from "../pawns/archer";
import { Warrior } from "../pawns/warrior";
import { LevelScene } from "./levelScene";

export class Level002 extends LevelScene {
  public constructor() {
    const sizeMap: Phaser.Math.Vector2 = new Phaser.Math.Vector2(7, 7);
    const levelSetup: LevelSetup = new Array(sizeMap.x)
      .fill(undefined)
      .map(
        (value1: any, i: number): Array<CellType> =>
          new Array(sizeMap.y)
            .fill(undefined)
            .map(
              (value2: any, j: number): CellType =>
                i === 0 || i === sizeMap.x - 1 || j === 0 || j === sizeMap.y - 1
                  ? CellType.OBSTACLE
                  : CellType.EMPTY
            )
      );

    const pawns: Array<Pawn> = [
      new Soldier(new Phaser.Math.Vector2(3, 1)),
      new Archer(new Phaser.Math.Vector2(5, 1)),
      new Warrior(new Phaser.Math.Vector2(5, 4)),
    ];

    super("Level002", levelSetup, pawns);
  }
}
