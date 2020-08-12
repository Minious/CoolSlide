import * as firebase from "firebase";

import { AbstractLevelScene } from "./abstractLevelScene";
import { LevelSetup } from "../grid/levelSetupType";
import { CellType } from "../grid/cellType";
import { Pawn } from "../pawns/pawn";
import { PawnSprite } from "../pawnSprites/pawnSprite";
import { pawnFactory } from "../pawns/pawnFactory";
import { ManagerScene } from "../managerScene";
import { PawnType } from "../pawns/pawnTypeEnum";
import { pawnTypeToPawnClass } from "../pawns/pawnTypeToPawnClass";

export class LevelBuilderScene extends AbstractLevelScene {
  private static keyToCellType: {
    [key: string]: CellType;
  } = {
    A: CellType.OBSTACLE,
    Z: CellType.EMPTY,
  };
  private static keyToPawnType: {
    [key: string]: PawnType;
  } = {
    E: PawnType.Soldier,
    R: PawnType.Grappling,
    T: PawnType.Assassin,
    Y: PawnType.Warrior,
    U: PawnType.Archer,
  };

  private selectedCellType: CellType;
  private selectedPawn: PawnType;
  private cursorSprite: Phaser.GameObjects.Image;

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

    this.selectedCellType = CellType.OBSTACLE;

    this.cursorSprite = this.add
      .image(0, 0, this.selectedCellType)
      .setScale(0.3);

    this.input.on("pointerup", (_pointer: Phaser.Input.Pointer): void => {
      const pointerUpPos: Phaser.Math.Vector2 = this.cameras.main.getWorldPoint(
        _pointer.x,
        _pointer.y
      );
      const gridPos: Phaser.Math.Vector2 = this.worldPosToGridPos(pointerUpPos);
      if (this.selectedPawn) {
        const pawn: Pawn = this.grid.getCellAt(gridPos);

        if (pawn) {
          pawn.pawnSprite.destroy();
          this.grid.destroyPawn(pawn);
        } else {
          const newPawn: Pawn = pawnFactory(this.selectedPawn, gridPos);
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
      } else if (this.selectedCellType) {
        this.grid.setCellAt(gridPos, this.selectedCellType);
        this.cellSprites[gridPos.x][gridPos.y].setTexture(
          this.selectedCellType
        );
      }

      this.children.bringToTop(this.cursorSprite);
    });

    for (const key in LevelBuilderScene.keyToPawnType) {
      if (LevelBuilderScene.keyToPawnType.hasOwnProperty(key)) {
        this.input.keyboard.on(
          `keydown-${key}`,
          (): void => {
            const pawnType: PawnType = LevelBuilderScene.keyToPawnType[key];
            this.setSelectedPawn(pawnType);
          },
          this
        );
      }
    }

    for (const key in LevelBuilderScene.keyToCellType) {
      if (LevelBuilderScene.keyToCellType.hasOwnProperty(key)) {
        this.input.keyboard.on(
          `keydown-${key}`,
          (): void => {
            const cellType: CellType = LevelBuilderScene.keyToCellType[key];
            this.setSelectedCellType(cellType);
          },
          this
        );
      }
    }

    this.input.keyboard.on(
      `keydown-SPACE`,
      (): void => {
        const levelRef: firebase.database.ThenableReference = firebase
          .database()
          .ref("levels")
          .push();
        const pawns: Array<Pawn> = this.grid.getPawnsRef();
        const levelSetup: LevelSetup = this.grid.levelSetup;
        levelRef.set({
          levelSetup,
          pawns,
        });
        (this.scene.get("ManagerScene") as ManagerScene).startCustomLevel(
          this.grid.levelSetup,
          this.grid.getPawns()
        );
        this.scene.stop("LevelBuilderScene");
      },
      this
    );
  }

  public setSelectedCellType(cellType: CellType): void {
    this.selectedPawn = undefined;
    this.selectedCellType = cellType;
    this.cursorSprite.setTexture(cellType);
  }

  public setSelectedPawn(pawnType: PawnType): void {
    this.selectedCellType = undefined;
    this.cursorSprite.setTexture(pawnTypeToPawnClass(pawnType).TEXTURE);
    this.selectedPawn = pawnType;
  }

  public update(): void {
    if (this.cursorSprite) {
      this.cursorSprite.setPosition(
        this.input.activePointer.worldX,
        this.input.activePointer.worldY
      );
    }
  }
}
