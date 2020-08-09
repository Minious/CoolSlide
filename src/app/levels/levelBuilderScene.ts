import { AbstractLevelScene } from "./abstractLevelScene";
import { LevelSetup } from "../grid/levelSetupType";
import { CellType } from "../grid/cellType";
import { Pawn } from "../pawns/pawn";
import { Soldier } from "../pawns/soldier";
import { PawnSprite } from "../pawnSprites/pawnSprite";

export class LevelBuilderScene extends AbstractLevelScene {
  public constructor() {
    const sizeMap: Phaser.Math.Vector2 = new Phaser.Math.Vector2(10, 6);
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

    super("LevelBuilderScene", levelSetup, []);
  }

  public create(): void {
    super.create();

    this.input.on("pointerup", (_pointer: Phaser.Input.Pointer): void => {
      const pointerUpPos: Phaser.Math.Vector2 = this.cameras.main.getWorldPoint(
        _pointer.x,
        _pointer.y
      );
      const gridPos: Phaser.Math.Vector2 = this.worldPosToGridPos(pointerUpPos);
      const pawn: Pawn = this.grid.getCell(gridPos);

      if (pawn) {
        pawn.pawnSprite.destroy();
        this.grid.destroyPawn(pawn);
      } else {
        const newPawn: Pawn = new Soldier(gridPos);
        this.grid.addPawn(newPawn);
        const newPawnPos: Phaser.Math.Vector2 = this.gridPosToWorldPos(
          newPawn.pos
        );
        const newPawnSprite: PawnSprite = newPawn.createPawnSprite(
          this,
          newPawnPos.x,
          newPawnPos.y
        );
        this.pawnSprites.add(newPawnSprite, true);
      }
    });
  }
}
