import { Grid } from "../grid/grid";
import { LevelSetup } from "../grid/levelSetupType";
import { Pawn } from "../pawns/pawn";
import { CellType } from "../grid/cellType";
import { PawnSprite } from "../pawnSprites/pawnSprite";

export abstract class AbstractLevelScene extends Phaser.Scene {
  protected grid: Grid;
  protected tileSize: number;
  protected pawnSprites: Phaser.GameObjects.Group;
  protected cellSprites: Array<Array<Phaser.GameObjects.Image>>;

  public constructor(key: string, levelSetup: LevelSetup, pawns: Array<Pawn>) {
    super({ key });

    this.grid = new Grid(levelSetup, pawns);
  }

  public create(): void {
    // Disables right click
    this.game.canvas.oncontextmenu = (e: MouseEvent): void => {
      e.preventDefault();
    };

    this.pawnSprites = this.add.group();

    /**
     * Places the camera centered to the origin (default is left upper corner is
     * at origin)
     */
    this.cameras.main.setZoom(2);
    this.cameras.main.centerOn(0, 0);

    this.tileSize = this.textures.get("emptyCell").get(0).width;

    this.cellSprites = this.grid.levelSetup.map(
      (column: Array<CellType>, i: number): Array<Phaser.GameObjects.Image> =>
        column.map(
          (cellType: CellType, j: number): Phaser.GameObjects.Image => {
            return this.add.image(
              (i - this.grid.size.x / 2 + 0.5) * this.tileSize,
              (j - this.grid.size.y / 2 + 0.5) * this.tileSize,
              cellType
            );
          }
        )
    );

    this.grid.getPawns().forEach((pawn: Pawn): void => {
      const pawnPos: Phaser.Math.Vector2 = this.gridPosToWorldPos(pawn.pos);
      const pawnSprite: PawnSprite = pawn.createPawnSprite(
        this,
        pawnPos.x,
        pawnPos.y
      );
      this.pawnSprites.add(pawnSprite, true);
    });
  }

  public gridPosToWorldPos(gridPos: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(
      (gridPos.x - this.grid.size.x / 2 + 0.5) * this.tileSize,
      (gridPos.y - this.grid.size.y / 2 + 0.5) * this.tileSize
    );
  }

  public worldPosToGridPos(worldPos: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(
      Math.floor(worldPos.x / this.tileSize + this.grid.size.x / 2),
      Math.floor(worldPos.y / this.tileSize + this.grid.size.y / 2)
    );
  }
}
